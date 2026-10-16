// ============================================================
//  Knex Configuration File (digunakan database CLI yang berjalan di Bun)
//  Mirip CI3 application/config/database.php
// ============================================================

import type { Knex } from 'knex';

// Load .env manual agar konfigurasi tetap tersedia untuk perintah database.
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Resolve path relatif terhadap file ini, bukan working directory shell.
const envPath = resolve(import.meta.dir, '../../.env');
const env: Record<string, string> = {};

try {
    const raw = readFileSync(envPath, 'utf-8');
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        env[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
} catch {
    // fallback ke process.env
    Object.assign(env, process.env);
}

const config: Record<string, Knex.Config> = {
    development: {
        client: 'mysql2',
        connection: {
            host:     env.DB_HOST     ?? '127.0.0.1',
            port:     Number(env.DB_PORT ?? 3306),
            user:     env.DB_USER     ?? 'root',
            password: env.DB_PASSWORD ?? '',
            database: env.DB_NAME     ?? 'bun_elysia_hmvc',
        },
        pool: { min: 0, max: 10 },
        migrations: {
            directory: resolve(import.meta.dir, '../database/migrations'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
        seeds: {
            directory: resolve(import.meta.dir, '../database/seeds'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
    },

    production: {
        client: 'mysql2',
        connection: {
            host:     env.DB_HOST,
            port:     Number(env.DB_PORT ?? 3306),
            user:     env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
        },
        pool: { min: 2, max: 20 },
        migrations: {
            directory: resolve(import.meta.dir, '../database/migrations'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
        seeds: {
            directory: resolve(import.meta.dir, '../database/seeds'),
            extension: 'ts',
            loadExtensions: ['.ts'],
        },
    },
};

export default config;
