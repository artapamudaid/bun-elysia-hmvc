import { UserModel } from './user.model';
import { ApiResponse } from '../../helpers/response_helper';

export class UserApiController {
    // GET /api/users - List users dengan datatable server-side pagination & filter
    static async index({ query = {} }: any) {
        const result = await UserModel.getDatatable({
            page: query.page,
            perPage: query.per_page || query.perPage || query.limit,
            search: typeof query.search === 'object' ? query.search.value : query.search,
            sort: query.sort,
            order: query.order,
        });

        return ApiResponse.success(result.data, 'Daftar pengguna berhasil diambil', {
            page: result.page,
            perPage: result.perPage,
            recordsTotal: result.recordsTotal,
            recordsFiltered: result.recordsFiltered,
            lastPage: result.lastPage,
            hasNext: result.hasNext,
            hasPrev: result.hasPrev,
            sort: result.sort,
            order: result.order,
        });
    }

    // GET /api/users/:id - Detail pengguna berdasarkan ID
    static async show({ params }: { params: { id: string } }) {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return ApiResponse.error('Parameter ID harus berupa angka', 'INVALID_ID', 400);
        }

        const user = await UserModel.getById(id);
        if (!user) {
            return ApiResponse.notFound(`Pengguna dengan ID #${id} tidak ditemukan`);
        }

        return ApiResponse.success(user, 'Detail pengguna berhasil diambil');
    }

    // POST /api/users - Tambah pengguna baru (Dilindungi JWT Auth)
    static async store({ body, user }: any) {
        const { name, email } = body;

        if (!name || !email) {
            return ApiResponse.validationError('Nama dan email wajib diisi');
        }

        const existing = await UserModel.getByEmail(email);
        if (existing) {
            return ApiResponse.error('Email sudah terdaftar, gunakan email lain', 'DUPLICATE_EMAIL', 409);
        }

        const [insertId] = await UserModel.create(name.trim(), email.trim());
        const newUser = await UserModel.getById(Number(insertId));

        return ApiResponse.created(newUser, 'Pengguna baru berhasil dibuat');
    }

    // PUT/PATCH /api/users/:id - Perbarui data pengguna (Dilindungi JWT Auth)
    static async update({ params, body }: any) {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return ApiResponse.error('Parameter ID harus berupa angka', 'INVALID_ID', 400);
        }

        const user = await UserModel.getById(id);
        if (!user) {
            return ApiResponse.notFound(`Pengguna dengan ID #${id} tidak ditemukan`);
        }

        const { name, email } = body;
        if (!name || !email) {
            return ApiResponse.validationError('Nama dan email tidak boleh kosong');
        }

        // Cek jika email dipakai user lain
        const existingEmail = await UserModel.getByEmail(email);
        if (existingEmail && existingEmail.id !== id) {
            return ApiResponse.error('Email sudah digunakan oleh pengguna lain', 'DUPLICATE_EMAIL', 409);
        }

        await UserModel.update(id, name.trim(), email.trim());
        const updatedUser = await UserModel.getById(id);

        return ApiResponse.success(updatedUser, 'Data pengguna berhasil diperbarui');
    }

    // DELETE /api/users/:id - Hapus pengguna (Dilindungi JWT Auth)
    static async destroy({ params }: { params: { id: string } }) {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return ApiResponse.error('Parameter ID harus berupa angka', 'INVALID_ID', 400);
        }

        const user = await UserModel.getById(id);
        if (!user) {
            return ApiResponse.notFound(`Pengguna dengan ID #${id} tidak ditemukan`);
        }

        await UserModel.delete(id);
        return ApiResponse.success({ id }, `Pengguna #${id} berhasil dihapus`);
    }
}
