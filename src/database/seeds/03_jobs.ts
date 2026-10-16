import type { Knex } from 'knex';
import { slug } from '../../helpers/string_helper';

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export async function seed(knex: Knex): Promise<void> {
    const today = new Date();
    const startDate = formatDate(today);
    const endDate = new Date(today);
    endDate.setUTCDate(endDate.getUTCDate() + 30);

    const admin = await knex('users').where({ role: 'admin' }).first('id');
    const examples = [
        {
            title: 'Senior Product Designer',
            division: 'Product & Design',
            criteria: 'Pengalaman minimal 5 tahun sebagai product atau UX designer. Menguasai Figma, design system, user research, dan prototyping. Mampu berkolaborasi lintas fungsi.',
            job_description: 'Memimpin proses desain dari discovery sampai delivery, menerjemahkan kebutuhan pengguna dan bisnis menjadi pengalaman digital yang mudah digunakan, serta menjaga konsistensi design system.',
        },
        {
            title: 'Backend Engineer',
            division: 'Engineering',
            criteria: 'Pengalaman minimal 3 tahun membangun layanan backend. Memahami REST API, SQL, keamanan aplikasi, testing, serta salah satu runtime TypeScript, Go, atau Java.',
            job_description: 'Merancang dan mengembangkan API serta layanan backend yang aman dan andal, bekerja bersama tim produk dan frontend, serta berpartisipasi dalam review kode dan perbaikan sistem.',
        },
    ];

    for (const example of examples) {
        const jobSlug = slug(`${example.title}-${startDate}-${formatDate(endDate)}`);
        const exists = await knex('jobs').where({ slug: jobSlug }).first('id');
        if (exists) continue;
        const division = await knex('divisions').where({ name: example.division }).first('id');
        if (!division) throw new Error(`Divisi seed tidak ditemukan: ${example.division}`);

        await knex('jobs').insert({
            title: example.title,
            division_id: division.id,
            criteria: example.criteria,
            job_description: example.job_description,
            slug: jobSlug,
            image_path: null,
            start_date: startDate,
            end_date: formatDate(endDate),
            is_active: true,
            created_by: admin?.id ?? null,
        });
    }
}
