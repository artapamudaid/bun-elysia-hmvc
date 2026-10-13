import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('sessions', (table) => {
        table.string('id', 128).primary(); // Session ID
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('ip_address', 45).nullable();
        table.text('user_agent').nullable();
        table.text('payload').nullable(); // Data session (JSON string)
        table.integer('last_activity').notNullable(); // Unix timestamp
        table.timestamps(true, true);
        table.index(['user_id', 'last_activity']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('sessions');
}
