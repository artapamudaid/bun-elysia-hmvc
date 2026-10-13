// ============================================================
//  Migration: Create Users Table
//  Mirip CI3 HMVC migration untuk tabel users
//  Jalankan: bun run migrate
// ============================================================

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 150).notNullable().unique();
        table.timestamps(true, true); // created_at, updated_at
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('users');
}
