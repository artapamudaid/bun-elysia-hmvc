import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderModuleView } from '../../config/view';
import { JobModel, type JobInput } from './job.model';
import { DivisionModel } from '../division/division.model';

const uploadDirectory = path.resolve(import.meta.dir, '../../../public/uploads/jobs');
const allowedImageTypes: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
const maxImageSize = 5 * 1024 * 1024;

export class JobController {
    static async index({ user, csrfToken = '', query = {} }: any) {
        await JobModel.closeExpired();
        const filters = {
            search: String(query.search ?? '').trim(),
            division: /^\d+$/.test(String(query.division ?? '')) ? String(query.division) : '',
            status: ['active', 'inactive'].includes(query.status) ? query.status : '',
            date_from: this.isDate(String(query.date_from ?? '')) ? String(query.date_from) : '',
            date_to: this.isDate(String(query.date_to ?? '')) ? String(query.date_to) : '',
        };
        const datatable = await JobModel.getDatatable({
            page: query.page,
            perPage: query.per_page || query.perPage,
            search: filters.search,
            sort: query.sort,
            order: query.order,
        }, filters);
        const divisions = await DivisionModel.getAll();
        return renderModuleView('job/views/index', {
            title: 'Manajemen Lowongan',
            datatable,
            jobs: datatable.data,
            divisions,
            filters,
            csrfToken,
            query,
            currentUser: user,
            activeNav: 'jobs',
        });
    }

    static async store({ body, user, redirect }: any) {
        const input = this.parseInput(body);
        const imagePath = await this.saveImage(body.image);
        await JobModel.create({ ...input, image_path: imagePath, created_by: user?.id });
        return redirect(this.redirectUrl(body.return_url, 'created'));
    }

    static async update({ params, body, redirect }: any) {
        const id = Number(params.id);
        if (!Number.isSafeInteger(id) || id < 1) return redirect(this.redirectUrl(body.return_url, 'invalid'));

        const existing = await JobModel.getById(id);
        if (!existing) return redirect(this.redirectUrl(body.return_url, 'not_found'));

        const input = this.parseInput(body);
        const imagePath = await this.saveImage(body.image, existing.image_path);
        await JobModel.update(id, { ...input, image_path: imagePath });
        return redirect(this.redirectUrl(body.return_url, 'updated'));
    }

    static async destroy({ params, body, redirect }: any) {
        const id = Number(params.id);
        if (!Number.isSafeInteger(id) || id < 1) return redirect(this.redirectUrl(body?.return_url, 'invalid'));
        const existing = await JobModel.getById(id);
        if (existing?.image_path) await this.removeImage(existing.image_path);
        await JobModel.delete(id);
        return redirect(this.redirectUrl(body?.return_url, 'deleted'));
    }

    private static redirectUrl(value: unknown, status: string): string {
        if (typeof value !== 'string') return `/jobs?notice=${status}`;

        try {
            const url = new URL(value, 'http://localhost');
            if (url.origin !== 'http://localhost' || (url.pathname !== '/jobs' && !url.pathname.startsWith('/jobs/'))) {
                return `/jobs?notice=${status}`;
            }
            url.searchParams.set('notice', status);
            return `${url.pathname}${url.search}`;
        } catch {
            return `/jobs?notice=${status}`;
        }
    }

    private static parseInput(body: any): JobInput {
        const title = String(body.title ?? '').trim();
        const divisionId = Number(body.division_id);
        const criteria = String(body.criteria ?? '').trim();
        const jobDescription = String(body.job_description ?? '').trim();
        const startDate = String(body.start_date ?? '');
        const endDate = String(body.end_date ?? '');

        if (!title || !Number.isSafeInteger(divisionId) || divisionId < 1 || !criteria || !jobDescription) {
            throw new Error('Judul, divisi, kriteria, dan job description wajib diisi.');
        }
        if (!this.isDate(startDate) || !this.isDate(endDate) || endDate < startDate) {
            throw new Error('Periode lowongan tidak valid. Tanggal akhir harus sama atau setelah tanggal mulai.');
        }

        return {
            title,
            division_id: divisionId,
            criteria,
            job_description: jobDescription,
            start_date: startDate,
            end_date: endDate,
            is_active: body.is_active === true || body.is_active === 'true' || body.is_active === '1',
        };
    }

    private static isDate(value: string): boolean {
        return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
    }

    private static async saveImage(value: unknown, currentPath?: string | null): Promise<string | null> {
        if (value === undefined || value === null) return currentPath ?? null;
        if (!(value instanceof File)) throw new Error('File gambar tidak valid.');
        if (value.size === 0) return currentPath ?? null;
        const extension = allowedImageTypes[value.type];
        if (!extension) throw new Error('Format gambar harus JPG, PNG, atau WebP.');
        if (value.size > maxImageSize) throw new Error('Ukuran gambar maksimal 5 MB.');

        await mkdir(uploadDirectory, { recursive: true });
        const filename = `${crypto.randomUUID()}.${extension}`;
        await writeFile(path.join(uploadDirectory, filename), new Uint8Array(await value.arrayBuffer()));

        if (currentPath) await this.removeImage(currentPath);
        return `/public/uploads/jobs/${filename}`;
    }

    private static async removeImage(imagePath: string): Promise<void> {
        const filename = path.basename(imagePath);
        if (!filename || filename === '.' || filename === path.sep) return;
        await unlink(path.join(uploadDirectory, filename)).catch(() => {});
    }
}
