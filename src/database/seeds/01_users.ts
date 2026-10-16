// ============================================================
//  Seed: Users Table
//  Data dummy awal untuk development
//  Mirip CI3 application/seeds/
//  Jalankan: bun run seed
// ============================================================

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Hash default password 'password123'
    const defaultPassword = await Bun.password.hash('password123');

    // Tambahkan akun demo yang belum ada tanpa menghapus data pengguna.
    const demoUsers = [
        { name: 'Admin Utama',       email: 'admin@example.com',   password: defaultPassword, role: 'admin' },
        { name: 'Budi Santoso',      email: 'budi@example.com',    password: defaultPassword, role: 'staff' },
    ];

    for (const user of demoUsers) {
        const exists = await knex('users').where({ email: user.email }).first('id');
        if (!exists) await knex('users').insert(user);
    }
}
