import knex from 'knex';

const db = knex({
    client: 'mysql2',
    connection: {
        host: Bun.env.DB_HOST ?? '127.0.0.1',
        port: Number(Bun.env.DB_PORT ?? 3306),
        user: Bun.env.DB_USER ?? 'root',
        password: Bun.env.DB_PASSWORD ?? '',
        database: Bun.env.DB_NAME ?? 'bun_elysia_hmvc',
    },
    pool: {
        min: 0,
        max: 10,
    },
});

export default db;
