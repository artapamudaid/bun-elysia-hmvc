import { renderModuleView } from '../../config/view';
import { DivisionModel } from './division.model';

export class DivisionController {
    static async index({ query = {}, csrfToken = '', user }: any) {
        const datatable = await DivisionModel.getDatatable({
            page: query.page,
            perPage: query.per_page || query.perPage,
            search: query.search,
            sort: query.sort,
            order: query.order,
        });
        return renderModuleView('division/views/index', {
            title: 'Manajemen Divisi',
            datatable,
            divisions: datatable.data,
            query,
            csrfToken,
            currentUser: user,
            activeNav: 'divisions',
        });
    }

    static async store({ body, redirect }: any) {
        const name = String(body.name ?? '').trim();
        const returnUrl = this.returnUrl(body.return_url);
        if (!name || name.length > 120) return redirect(this.withNotice(returnUrl, 'invalid'));
        if (await DivisionModel.nameExists(name)) return redirect(this.withNotice(returnUrl, 'duplicate'));
        await DivisionModel.create(name);
        return redirect(this.withNotice(returnUrl, 'created'));
    }

    static async update({ params, body, redirect }: any) {
        const id = Number(params.id);
        const name = String(body.name ?? '').trim();
        const returnUrl = this.returnUrl(body.return_url);
        if (!Number.isSafeInteger(id) || id < 1 || !name || name.length > 120) {
            return redirect(this.withNotice(returnUrl, 'invalid'));
        }
        if (!(await DivisionModel.getById(id))) return redirect(this.withNotice(returnUrl, 'not_found'));
        if (await DivisionModel.nameExists(name, id)) return redirect(this.withNotice(returnUrl, 'duplicate'));
        await DivisionModel.update(id, name);
        return redirect(this.withNotice(returnUrl, 'updated'));
    }

    static async destroy({ params, body, redirect }: any) {
        const id = Number(params.id);
        const returnUrl = this.returnUrl(body?.return_url);
        if (!Number.isSafeInteger(id) || id < 1) return redirect(this.withNotice(returnUrl, 'invalid'));
        if (!(await DivisionModel.getById(id))) return redirect(this.withNotice(returnUrl, 'not_found'));
        if (await DivisionModel.isUsed(id)) return redirect(this.withNotice(returnUrl, 'in_use'));
        await DivisionModel.delete(id);
        return redirect(this.withNotice(returnUrl, 'deleted'));
    }

    private static returnUrl(value: unknown): string {
        if (typeof value !== 'string') return '/divisions';
        try {
            const url = new URL(value, 'http://localhost');
            if (url.origin !== 'http://localhost' || (url.pathname !== '/divisions' && !url.pathname.startsWith('/divisions/'))) {
                return '/divisions';
            }
            return `${url.pathname}${url.search}`;
        } catch {
            return '/divisions';
        }
    }

    private static withNotice(urlValue: string, notice: string): string {
        const url = new URL(urlValue, 'http://localhost');
        url.searchParams.set('notice', notice);
        return `${url.pathname}${url.search}`;
    }
}
