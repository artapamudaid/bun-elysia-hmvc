import knex from 'knex';
import knexConfig from '../config/knexfile';

const [command, ...args] = process.argv.slice(2);
const environment = Bun.env.APP_ENV === 'production' ? 'production' : 'development';
const db = knex(knexConfig[environment]);

try {
    switch (command) {
        case 'migrate:latest': {
            const [batch, migrations] = await db.migrate.latest();
            console.log(`Migration batch ${batch}: ${migrations.length ? migrations.join(', ') : 'tidak ada migration baru.'}`);
            break;
        }
        case 'migrate:rollback': {
            const [batch, migrations] = await db.migrate.rollback(undefined, args.includes('--all'));
            console.log(`Rollback batch ${batch}: ${migrations.length ? migrations.join(', ') : 'tidak ada migration untuk di-rollback.'}`);
            break;
        }
        case 'migrate:status': {
            const [completed, pending] = await db.migrate.list();
            console.log('Migration selesai:');
            for (const migration of completed) console.log(`  ✔ ${migration.name}`);
            console.log('Migration menunggu:');
            for (const migration of pending) console.log(`  ○ ${migration.file}`);
            break;
        }
        case 'migrate:make': {
            const name = args.find((arg) => !arg.startsWith('--'));
            if (!name) throw new Error('Nama migration wajib diberikan. Contoh: bun run migrate:make add_job_status');
            const filename = await db.migrate.make(name);
            console.log(`Migration dibuat: ${filename}`);
            break;
        }
        case 'seed:run': {
            const seeds = await db.seed.run();
            console.log(`Seed selesai: ${seeds.length ? seeds.join(', ') : 'tidak ada seed baru.'}`);
            break;
        }
        case 'seed:make': {
            const name = args.find((arg) => !arg.startsWith('--'));
            if (!name) throw new Error('Nama seed wajib diberikan. Contoh: bun run seed:make demo_jobs');
            const filename = await db.seed.make(name);
            console.log(`Seed dibuat: ${filename}`);
            break;
        }
        default:
            throw new Error(`Perintah tidak dikenal: ${command ?? '(kosong)'}`);
    }
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
    await db.destroy();
}
