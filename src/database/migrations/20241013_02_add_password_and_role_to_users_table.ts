import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.string('password', 255).nullable().after('email');
        table.string('role', 50).defaultTo('user').after('password');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('role');
        table.dropColumn('password');
    });
}
