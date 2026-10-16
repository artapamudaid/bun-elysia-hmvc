import { Elysia, t } from 'elysia';
import { requireWebAuth } from '../../middleware/auth.middleware';
import { DivisionController } from './division.controller';

const divisionForm = t.Object({
    name: t.String({ minLength: 2, maxLength: 120 }),
    return_url: t.Optional(t.String()),
    csrf_token: t.Optional(t.String()),
});

export const divisionRoutes = new Elysia({ prefix: '/divisions' })
    .use(requireWebAuth)
    .get('/', ({ query, csrfToken, user }: any) => DivisionController.index({ query, csrfToken, user }))
    .post('/', ({ body, redirect }: any) => DivisionController.store({ body, redirect }), { body: divisionForm })
    .post('/update/:id', ({ params, body, redirect }: any) => DivisionController.update({ params, body, redirect }), { body: divisionForm })
    .post('/delete/:id', ({ params, body, redirect }: any) => DivisionController.destroy({ params, body, redirect }), {
        body: t.Object({ return_url: t.Optional(t.String()), csrf_token: t.Optional(t.String()) }),
    });
