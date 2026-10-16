import { isUserRole, UserModel, userRoleLabel } from './user.model';
import { renderModuleView } from '../../config/view';
import appConfig from '../../config/app';

export class UserController {
    // Helper untuk merangkai redirect URL dengan status flash message
    private static makeRedirectUrl(returnUrl?: string, status?: string): string {
        const raw = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/users';
        try {
            const baseUrl = Bun.env.APP_URL ?? appConfig.baseUrl;
            const parsed = new URL(raw, baseUrl);
            if (status) {
                parsed.searchParams.set('status', status);
            }
            return parsed.pathname + parsed.search;
        } catch {
            return status ? `/users?status=${status}` : '/users';
        }
    }

    // Menampilkan halaman daftar user dengan filter & pagination server-side
    static async index({ query = {}, csrfToken = '', headers = {}, user }: any) {
        const params = {
            page: query.page,
            perPage: query.per_page || query.perPage,
            search: query.search,
            sort: query.sort,
            order: query.order,
            draw: query.draw,
        };

        const result = await UserModel.getDatatable(params);

        // Jika request meminta JSON (misal fetch/AJAX datatable)
        const isJson = query.format === 'json' ||
            headers['accept']?.includes('application/json') ||
            headers['x-requested-with'] === 'XMLHttpRequest';

        if (isJson) {
            return result;
        }

        return renderModuleView('user/views/index', {
            title: 'Manajemen Pengguna (HMVC)',
            datatable: result,
            csrfToken: csrfToken ?? '',
            query: query,
            currentUser: user,
            activeNav: 'users',
            userRoleLabel,
        });
    }

    // Endpoint API JSON khusus untuk server-side datatable
    static async data({ query = {} }: any) {
        return await UserModel.getDatatable({
            page: query.page,
            perPage: query.per_page || query.perPage || query.length,
            search: typeof query.search === 'object' ? query.search.value : query.search,
            sort: query.sort,
            order: query.order,
            draw: query.draw,
        });
    }

    // Ambil detail satu user (untuk modal edit)
    static async getById({ params }: { params: { id: string } }) {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) return { error: 'ID tidak valid' };
        const user = await UserModel.getById(id);
        if (!user) return { error: 'User tidak ditemukan' };
        return user;
    }

    // Menyimpan data user baru dari form (Create)
    static async store({ body, redirect }: { body: any; redirect: any }) {
        const { name, email, return_url } = body;
        const role = isUserRole(body.role) ? body.role : 'staff';
        if (name && email) {
            await UserModel.create(name.trim(), email.trim(), role);
        }
        return redirect(UserController.makeRedirectUrl(return_url, 'created'));
    }

    // Memperbarui data user (Update)
    static async update({ params, body, redirect }: { params: { id: string }; body: any; redirect: any }) {
        const userId = parseInt(params.id, 10);
        const { name, email, return_url } = body;
        if (!isNaN(userId) && name && email) {
            const existing = await UserModel.getById(userId);
            const role = isUserRole(body.role) ? body.role : (isUserRole(existing?.role) ? existing.role : 'staff');
            await UserModel.update(userId, name.trim(), email.trim(), role);
        }
        return redirect(UserController.makeRedirectUrl(return_url, 'updated'));
    }

    // Menghapus data user (Delete)
    static async destroy({ params, query = {}, body = {}, redirect }: { params: { id: string }; query?: any; body?: any; redirect: any }) {
        const userId = parseInt(params.id, 10);
        const returnUrl = query.return_url || body.return_url;
        if (!isNaN(userId)) {
            await UserModel.delete(userId);
        }
        return redirect(UserController.makeRedirectUrl(returnUrl, 'deleted'));
    }
}
