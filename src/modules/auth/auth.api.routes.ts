import { Elysia, t } from 'elysia';
import { AuthApiController } from './auth.api.controller';
import { authMiddleware, requireApiAuth } from '../../middleware/auth.middleware';

export const authApiRoutes = new Elysia({ prefix: '/api/auth' })
    .use(authMiddleware)

    // Public: Login untuk mendapatkan Bearer Token JWT
    .post('/login', ({ body, jwt }: any) => AuthApiController.login({ body, jwt }), {
        body: t.Object({
            email: t.String(),
            password: t.Optional(t.String()),
        })
    })

    // Protected (JWT Required): Ambil info profil user yang sedang login
    .guard({ beforeHandle: requireApiAuth.event.beforeHandle }, (app) =>
        app
            .get('/profile', ({ user }: any) => AuthApiController.profile({ user }))
            .get('/me', ({ user }: any) => AuthApiController.profile({ user }))
    );
