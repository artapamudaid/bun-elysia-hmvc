import { Elysia, t } from 'elysia';
import { UserController } from './user.controller';
import { requireWebAuth } from '../../middleware/auth.middleware';

export const userRoutes = new Elysia({ prefix: '/users' })
    .use(requireWebAuth)
    // Read: Halaman utama dengan filter, sort, & pagination (Server-Side)
    .get('/', ({ query, csrfToken, headers, user }: any) => UserController.index({ query, csrfToken, headers, user }))

    // Read (API JSON): Endpoint datatable untuk AJAX
    .get('/data', ({ query }: any) => UserController.data({ query }))

    // Read (API JSON): Detail user untuk modal edit
    .get('/api/:id', ({ params }: any) => UserController.getById({ params }))

    // Create: Simpan user baru
    .post('/', ({ body, redirect }) => UserController.store({ body, redirect }), {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            csrf_token: t.Optional(t.String()),
            return_url: t.Optional(t.String()),
        })
    })

    // Update: Simpan perubahan user
    .post('/update/:id', ({ params, body, redirect }) => UserController.update({ params, body, redirect }), {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            csrf_token: t.Optional(t.String()),
            return_url: t.Optional(t.String()),
        })
    })

    // Delete: Hapus user (mendukung GET dan POST dengan return_url)
    .get('/delete/:id', ({ params, query, redirect }: any) => UserController.destroy({ params, query, redirect }))
    .post('/delete/:id', ({ params, query, body, redirect }: any) => UserController.destroy({ params, query, body, redirect }));