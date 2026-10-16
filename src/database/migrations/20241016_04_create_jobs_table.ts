import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('jobs', (table) => {
        table.increments('id').primary();
        table.string('title', 180).notNullable();
        table.string('slug', 220).notNullable().unique();
        table.text('criteria').notNullable();
        table.text('job_description').notNullable();
        table.string('image_path', 500).nullable();
        table.date('start_date').notNullable();
        table.date('end_date').notNullable();
        table.boolean('is_active').notNullable().defaultTo(true);
        table.integer('created_by').unsigned().nullable();
        table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
        table.timestamps(true, true);
        table.index(['is_active', 'start_date', 'end_date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('jobs');
}
