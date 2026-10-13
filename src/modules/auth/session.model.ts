// ============================================================
//  Session Model
//  Menyimpan dan mengelola sesi aktif pengguna di database
//  Mirip CI3 database session driver
// ============================================================

import db from '../../config/database';

export interface Session {
    id: string;
    user_id: number;
    ip_address?: string;
    user_agent?: string;
    payload?: string;
    last_activity: number;
    created_at?: string | Date;
    updated_at?: string | Date;
    user_name?: string;
    user_email?: string;
}

export class SessionModel {
    /**
     * Buat sesi baru di database
     */
    static async create(data: {
        id: string;
        userId: number;
        ipAddress?: string;
        userAgent?: string;
        payload?: Record<string, any>;
    }) {
        const now = Math.floor(Date.now() / 1000);
        await db('sessions').insert({
            id: data.id,
            user_id: data.userId,
            ip_address: data.ipAddress ?? null,
            user_agent: data.userAgent ?? null,
            payload: data.payload ? JSON.stringify(data.payload) : null,
            last_activity: now,
        });
    }

    /**
     * Ambil data sesi berdasarkan ID
     */
    static async getById(id: string): Promise<Session | undefined> {
        return await db<Session>('sessions').where({ id }).first();
    }

    /**
     * Ambil semua sesi aktif milik seorang user
     */
    static async getByUserId(userId: number): Promise<Session[]> {
        return await db<Session>('sessions')
            .where({ user_id: userId })
            .orderBy('last_activity', 'desc');
    }

    /**
     * Ambil seluruh sesi beserta data user untuk tabel session management
     */
    static async getAllWithUser(): Promise<Session[]> {
        return await db('sessions')
            .join('users', 'sessions.user_id', '=', 'users.id')
            .select(
                'sessions.*',
                'users.name as user_name',
                'users.email as user_email'
            )
            .orderBy('sessions.last_activity', 'desc');
    }

    /**
     * Perbarui waktu aktivitas terakhir
     */
    static async touch(id: string) {
        const now = Math.floor(Date.now() / 1000);
        await db('sessions').where({ id }).update({
            last_activity: now,
            updated_at: new Date(),
        });
    }

    /**
     * Hapus satu sesi (revoke/logout)
     */
    static async delete(id: string) {
        return await db('sessions').where({ id }).del();
    }

    /**
     * Hapus semua sesi user (logout all devices)
     */
    static async deleteByUserId(userId: number) {
        return await db('sessions').where({ user_id: userId }).del();
    }

    /**
     * Hapus sesi yang sudah usang / kadaluarsa
     */
    static async cleanup(lifetimeSeconds: number = 86400 * 7) {
        const threshold = Math.floor(Date.now() / 1000) - lifetimeSeconds;
        return await db('sessions').where('last_activity', '<', threshold).del();
    }
}
