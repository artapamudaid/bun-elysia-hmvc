import { Elysia, t } from 'elysia';
import { AuthController } from './auth.controller';
import { authMiddleware, requireWebAuth } from '../../middleware/auth.middleware';

export const authRoutes = new Elysia({ prefix: '/auth' })
    .use(authMiddleware)

    // Halaman Login Web
    .get('/login', ({ user, query, csrfToken, redirect }: any) =>
        AuthController.showLogin({ user, query, csrfToken, redirect })
    )

    // Proses Submit Form Login Web
    .post('/login', ({ body, request, cookie, redirect, jwt }: any) =>
        AuthController.login({ body, request, cookie, redirect, jwt }),
        {
            body: t.Object({
                email: t.String(),
                password: t.String(),
                csrf_token: t.Optional(t.String()),
            })
        }
    )

    // Logout Web
    .get('/logout', ({ cookie, redirect }: any) =>
        AuthController.logout({ cookie, redirect })
    )

    // Halaman Session Management (Wajib Login Web)
    .guard({ beforeHandle: requireWebAuth.event.beforeHandle }, (app) =>
        app
            .get('/sessions', ({ user, query, csrfToken }: any) =>
                AuthController.sessions({ user, query, csrfToken })
            )
            .get('/sessions/revoke/:id', ({ params, redirect }: any) =>
                AuthController.revokeSession({ params, redirect })
            )
    );
