import { Elysia, t } from 'elysia';
import { JobController } from './job.controller';
import { requireWebAuth } from '../../middleware/auth.middleware';

const jobForm = t.Object({
    title: t.String({ minLength: 2, maxLength: 180 }),
    division_id: t.String({ minLength: 1, maxLength: 10 }),
    criteria: t.String({ minLength: 1 }),
    job_description: t.String({ minLength: 1 }),
    start_date: t.String(),
    end_date: t.String(),
    is_active: t.String(),
    // Browser mengirim empty File untuk input file yang dibiarkan kosong.
    // Validasi file dilakukan di controller agar file kosong diterima saat edit.
    image: t.Optional(t.Any()),
    return_url: t.Optional(t.String()),
    csrf_token: t.Optional(t.String()),
});

export const jobRoutes = new Elysia({ prefix: '/jobs' })
    .use(requireWebAuth)
    .get('/', ({ user, csrfToken, query }: any) => JobController.index({ user, csrfToken, query }))
    .post('/', ({ body, user, redirect }: any) => JobController.store({ body, user, redirect }), { body: jobForm })
    .post('/update/:id', ({ params, body, redirect }: any) => JobController.update({ params, body, redirect }), { body: jobForm })
    .post('/delete/:id', ({ params, body, redirect }: any) => JobController.destroy({ params, body, redirect }), {
        body: t.Object({ csrf_token: t.Optional(t.String()), return_url: t.Optional(t.String()) }),
    });
