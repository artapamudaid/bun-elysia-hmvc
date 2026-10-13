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

    // Insert data dummy
    await knex('users').insert([
        { name: 'Admin Utama',       email: 'admin@example.com' },
        { name: 'Budi Santoso',      email: 'budi@example.com' },
        { name: 'Citra Dewi',        email: 'citra@example.com' },
        { name: 'Dian Pratama',      email: 'dian@example.com' },
        { name: 'Eko Wahyudi',       email: 'eko@example.com' },
        { name: 'Fajar Nugraha',     email: 'fajar@example.com' },
        { name: 'Gita Permata',      email: 'gita@example.com' },
        { name: 'Hadi Saputra',      email: 'hadi@example.com' },
        { name: 'Indah Kusuma',      email: 'indah@example.com' },
        { name: 'Joko Widodo',       email: 'joko@example.com' },
        { name: 'Kartika Sari',      email: 'kartika@example.com' },
        { name: 'Lukman Hakim',      email: 'lukman@example.com' },
        { name: 'Mega Utami',        email: 'mega@example.com' },
        { name: 'Nanda Pratama',     email: 'nanda@example.com' },
        { name: 'Oki Setiawan',      email: 'oki@example.com' },
    ]);
}
