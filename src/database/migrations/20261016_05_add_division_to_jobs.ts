import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('jobs', (table) => {
        table.string('division', 120).notNullable().defaultTo('Umum');
        table.index(['division', 'start_date', 'end_date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('jobs', (table) => {
        table.dropIndex(['division', 'start_date', 'end_date']);
        table.dropColumn('division');
    });
}
