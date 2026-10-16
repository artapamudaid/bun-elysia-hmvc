import type { Knex } from 'knex';

const validRoles = ['admin', 'staff', 'candidate'];

export async function up(knex: Knex): Promise<void> {
    await knex('users')
        .where((query) => query.whereNull('role').orWhereNotIn('role', validRoles))
        .update({ role: 'staff' });

    await knex.schema.alterTable('users', (table) => {
        table.string('role', 50).notNullable().defaultTo('staff').alter();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex('users').whereNot('role', 'admin').update({ role: 'user' });
    await knex.schema.alterTable('users', (table) => {
        table.string('role', 50).nullable().defaultTo('user').alter();
    });
}
