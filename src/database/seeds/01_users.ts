// ============================================================
//  Seed: Users Table
//  Data dummy awal untuk development
//  Mirip CI3 application/seeds/
//  Jalankan: bun run seed
// ============================================================

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Truncate dulu (mirip CI3 truncate before seed)
    await knex('users').del();

    // Hash default password 'password123'
    const defaultPassword = await Bun.password.hash('password123');

    // Insert data dummy
    await knex('users').insert([
        { name: 'Admin Utama',       email: 'admin@example.com',   password: defaultPassword, role: 'admin' },
        { name: 'Budi Santoso',      email: 'budi@example.com',    password: defaultPassword, role: 'user' },
        { name: 'Citra Dewi',        email: 'citra@example.com',   password: defaultPassword, role: 'user' },
        { name: 'Dian Pratama',      email: 'dian@example.com',    password: defaultPassword, role: 'user' },
        { name: 'Eko Wahyudi',       email: 'eko@example.com',     password: defaultPassword, role: 'user' },
        { name: 'Fajar Nugraha',     email: 'fajar@example.com',   password: defaultPassword, role: 'user' },
        { name: 'Gita Permata',      email: 'gita@example.com',    password: defaultPassword, role: 'user' },
        { name: 'Hadi Saputra',      email: 'hadi@example.com',    password: defaultPassword, role: 'user' },
        { name: 'Indah Kusuma',      email: 'indah@example.com',   password: defaultPassword, role: 'user' },
        { name: 'Joko Widodo',       email: 'joko@example.com',    password: defaultPassword, role: 'user' },
        { name: 'Kartika Sari',      email: 'kartika@example.com', password: defaultPassword, role: 'user' },
        { name: 'Lukman Hakim',      email: 'lukman@example.com',  password: defaultPassword, role: 'user' },
        { name: 'Mega Utami',        email: 'mega@example.com',    password: defaultPassword, role: 'user' },
        { name: 'Nanda Pratama',     email: 'nanda@example.com',   password: defaultPassword, role: 'user' },
        { name: 'Oki Setiawan',      email: 'oki@example.com',     password: defaultPassword, role: 'user' },
    ]);
}
