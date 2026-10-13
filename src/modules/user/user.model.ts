import db from '../../config/database';
import { datatableQuery, type DatatableParams, type DatatableResponse } from '../../helpers/datatable_helper';

export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role?: string;
    created_at?: string | Date;
    updated_at?: string | Date;
}

export class UserModel {
    // Datatable Server-Side dengan search filter, sorting, dan pagination
    static async getDatatable(params: DatatableParams = {}): Promise<DatatableResponse<User>> {
        return await datatableQuery<User>(db<User>('users'), params, {
            searchableColumns: ['name', 'email'],
            sortableColumns: ['id', 'name', 'email', 'created_at'],
            defaultSort: 'id',
            defaultOrder: 'asc',
            defaultPerPage: 10,
        });
    }

    // Ambil semua data user
    static async getAll(): Promise<User[]> {
        return await db<User>('users').select('*');
    }

    // Ambil detail satu user berdasarkan ID
    static async getById(id: number): Promise<User | undefined> {
        return await db<User>('users').where({ id }).first();
    }

    // Ambil detail satu user berdasarkan Email
    static async getByEmail(email: string): Promise<User | undefined> {
        return await db<User>('users').where({ email }).first();
    }

    // Tambah user baru
    static async create(name: string, email: string) {
        return await db('users').insert({ name, email });
    }

    // Update user
    static async update(id: number, name: string, email: string) {
        return await db('users').where({ id }).update({ name, email });
    }

    // Hapus user
    static async delete(id: number) {
        return await db('users').where({ id }).del();
    }
}