import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('divisions', (table) => {
        table.increments('id').primary();
        table.string('name', 120).notNullable().unique();
        table.timestamps(true, true);
    });

    const existingJobs = await knex('jobs').select('division').whereNotNull('division').distinct();
    const namesByKey = new Map<string, string>();
    for (const row of existingJobs) {
        const name = String(row.division ?? '').trim();
        if (name && !namesByKey.has(name.toLowerCase())) namesByKey.set(name.toLowerCase(), name);
    }
    const names = [...namesByKey.values()];
    if (names.length) {
        await knex('divisions').insert(names.map((name) => ({ name })));
    }

    await knex.schema.alterTable('jobs', (table) => {
        table.integer('division_id').unsigned().nullable();
    });

    const divisions = await knex('divisions').select('id', 'name');
    const divisionIds = new Map(divisions.map((division) => [String(division.name).toLowerCase(), division.id]));
    for (const job of existingJobs) {
        const name = String(job.division ?? '').trim();
        const divisionId = divisionIds.get(name.toLowerCase());
        if (divisionId) {
            await knex('jobs').where({ division: job.division }).update({ division_id: divisionId });
        }
    }

    await knex.schema.alterTable('jobs', (table) => {
        table.dropIndex(['division', 'start_date', 'end_date']);
        table.dropColumn('division');
    });
    await knex.schema.alterTable('jobs', (table) => {
        table.integer('division_id').unsigned().notNullable().alter();
        table.foreign('division_id').references('id').inTable('divisions').onUpdate('CASCADE').onDelete('RESTRICT');
        table.index(['division_id', 'start_date', 'end_date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('jobs', (table) => {
        table.dropForeign(['division_id']);
        table.dropIndex(['division_id', 'start_date', 'end_date']);
        table.string('division', 120).nullable();
    });

    await knex('jobs')
        .join('divisions', 'jobs.division_id', 'divisions.id')
        .update({ division: knex.ref('divisions.name') });

    await knex.schema.alterTable('jobs', (table) => {
        table.dropColumn('division_id');
        table.index(['division', 'start_date', 'end_date']);
    });
    await knex.schema.dropTableIfExists('divisions');
}
