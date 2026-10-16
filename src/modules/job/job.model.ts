import db from '../../config/database';
import { slug } from '../../helpers/string_helper';
import { datatableQuery, type DatatableParams, type DatatableResponse } from '../../helpers/datatable_helper';

export interface JobInput {
    title: string;
    division_id: number;
    criteria: string;
    job_description: string;
    image_path?: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_by?: number;
}

export interface Job extends JobInput {
    id: number;
    slug: string;
    division: string;
    created_at: string | Date;
    updated_at: string | Date;
}

export class JobModel {
    static async getDatatable(
        params: DatatableParams = {},
        filters: Record<string, string> = {},
    ): Promise<DatatableResponse<Job>> {
        const today = this.today();
        const query = db<Job>('jobs as j')
            .leftJoin('divisions as d', 'j.division_id', 'd.id')
            .select('j.*', 'd.name as division');

        if (filters.division) query.where('j.division_id', filters.division);
        if (filters.date_from) query.where('j.end_date', '>=', filters.date_from);
        if (filters.date_to) query.where('j.start_date', '<=', filters.date_to);
        if (filters.status === 'active') {
            query.where('j.is_active', true).where('j.end_date', '>=', today);
        } else if (filters.status === 'inactive') {
            query.where((builder) => builder.where('j.is_active', false).orWhere('j.end_date', '<', today));
        }

        const sortColumns: Record<string, string> = {
            id: 'j.id', title: 'j.title', division: 'd.name', start_date: 'j.start_date',
            end_date: 'j.end_date', is_active: 'j.is_active', created_at: 'j.created_at',
        };
        const result = await datatableQuery<Job>(query, {
            ...params,
            sort: sortColumns[String(params.sort ?? '')] ?? params.sort,
        }, {
            searchableColumns: ['j.title', 'j.slug', 'd.name'],
            sortableColumns: ['j.id', 'j.title', 'd.name', 'j.start_date', 'j.end_date', 'j.is_active', 'j.created_at'],
            defaultSort: 'j.created_at',
            defaultOrder: 'desc',
            defaultPerPage: 10,
            maxPerPage: 50,
        });

        return { ...result, data: result.data.map((job) => this.normalize(job, today)) };
    }

    static async getAll(filters: Record<string, string> = {}): Promise<Job[]> {
        const today = this.today();
        const query = db<Job>('jobs as j')
            .leftJoin('divisions as d', 'j.division_id', 'd.id')
            .select('j.*', 'd.name as division');

        if (filters.search) {
            const search = `%${filters.search.trim().toLowerCase()}%`;
            query.where((builder) => builder
                .whereRaw('LOWER(j.title) LIKE ?', [search])
                .orWhereRaw('LOWER(j.slug) LIKE ?', [search])
                .orWhereRaw('LOWER(d.name) LIKE ?', [search]));
        }
        if (filters.division) query.where('j.division_id', filters.division);
        if (filters.date_from) query.where('j.end_date', '>=', filters.date_from);
        if (filters.date_to) query.where('j.start_date', '<=', filters.date_to);

        if (filters.status === 'active') {
            query.where('j.is_active', true).where('j.end_date', '>=', today);
        } else if (filters.status === 'inactive') {
            query.where((builder) => builder.where('j.is_active', false).orWhere('j.end_date', '<', today));
        }

        const jobs = await query.orderBy('d.name').orderBy('j.start_date', 'desc').orderBy('j.created_at', 'desc');
        return jobs.map((job) => this.normalize(job, today));
    }

    static async getById(id: number): Promise<Job | undefined> {
        const job = await db<Job>('jobs as j')
            .leftJoin('divisions as d', 'j.division_id', 'd.id')
            .select('j.*', 'd.name as division')
            .where('j.id', id)
            .first();
        return job ? this.normalize(job, this.today()) : undefined;
    }

    static async create(input: JobInput): Promise<void> {
        const jobSlug = await this.uniqueSlug(input.title, input.start_date, input.end_date);
        await db<Job>('jobs').insert({ ...input, slug: jobSlug });
    }

    static async update(id: number, input: JobInput): Promise<void> {
        const jobSlug = await this.uniqueSlug(input.title, input.start_date, input.end_date, id);
        await db<Job>('jobs').where({ id }).update({ ...input, slug: jobSlug });
    }

    static async delete(id: number): Promise<void> {
        await db<Job>('jobs').where({ id }).del();
    }

    static async closeExpired(): Promise<void> {
        await db<Job>('jobs')
            .where('is_active', true)
            .where('end_date', '<', this.today())
            .update({ is_active: false, updated_at: db.fn.now() });
    }

    private static today(): string {
        return new Intl.DateTimeFormat('en-CA', { timeZone: Bun.env.APP_TIMEZONE ?? 'Asia/Jakarta' }).format(new Date());
    }

    private static normalize(job: Job, today: string): Job {
        const startDate = this.dateOnly(job.start_date);
        const endDate = this.dateOnly(job.end_date);
        return {
            ...job,
            start_date: startDate,
            end_date: endDate,
            is_active: Boolean(job.is_active) && endDate >= today,
        };
    }

    private static dateOnly(value: string | Date): string {
        if (typeof value === 'string') return value.slice(0, 10);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private static async uniqueSlug(title: string, startDate: string, endDate: string, exceptId?: number): Promise<string> {
        const base = slug(`${title}-${startDate}-${endDate}`).slice(0, 200).replace(/-+$/, '') || 'lowongan';
        let candidate = base;
        let suffix = 2;

        while (true) {
            const query = db<Job>('jobs').where({ slug: candidate });
            if (exceptId !== undefined) query.whereNot({ id: exceptId });
            if (!(await query.first())) return candidate;
            candidate = `${base}-${suffix++}`;
        }
    }
}
