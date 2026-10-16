import db from '../../config/database';
import { datatableQuery, type DatatableParams, type DatatableResponse } from '../../helpers/datatable_helper';

export interface Division {
    id: number;
    name: string;
    created_at: string | Date;
    updated_at: string | Date;
}

export class DivisionModel {
    static async getDatatable(params: DatatableParams = {}): Promise<DatatableResponse<Division>> {
        return datatableQuery<Division>(db<Division>('divisions').select('*'), params, {
            searchableColumns: ['name'],
            sortableColumns: ['id', 'name', 'created_at'],
            defaultSort: 'name',
            defaultOrder: 'asc',
            defaultPerPage: 10,
            maxPerPage: 50,
        });
    }

    static async getAll(): Promise<Division[]> {
        return db<Division>('divisions').select('*').orderBy('name', 'asc');
    }

    static async getById(id: number): Promise<Division | undefined> {
        return db<Division>('divisions').where({ id }).first();
    }

    static async nameExists(name: string, exceptId?: number): Promise<boolean> {
        const query = db<Division>('divisions').whereRaw('LOWER(name) = ?', [name.toLowerCase()]);
        if (exceptId !== undefined) query.whereNot({ id: exceptId });
        return Boolean(await query.first('id'));
    }

    static async create(name: string): Promise<void> {
        await db<Division>('divisions').insert({ name });
    }

    static async update(id: number, name: string): Promise<void> {
        await db<Division>('divisions').where({ id }).update({ name, updated_at: db.fn.now() });
    }

    static async isUsed(id: number): Promise<boolean> {
        const row = await db('jobs').where({ division_id: id }).first('id');
        return Boolean(row);
    }

    static async delete(id: number): Promise<void> {
        await db<Division>('divisions').where({ id }).del();
    }
}
