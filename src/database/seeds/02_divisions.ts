import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    const names = ['Engineering', 'Product & Design', 'Umum'];
    for (const name of names) {
        const exists = await knex('divisions').where({ name }).first('id');
        if (!exists) await knex('divisions').insert({ name });
    }
}
