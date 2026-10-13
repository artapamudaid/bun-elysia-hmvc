import { Elysia, t } from 'elysia';
import { UserApiController } from './user.api.controller';
import { authMiddleware, requireApiAuth } from '../../middleware/auth.middleware';

export const userApiRoutes = new Elysia({ prefix: '/api/users' })
    .use(authMiddleware)

    // Public API: List users dengan filter, pagination, dan sorting
    .get('/', ({ query }: any) => UserApiController.index({ query }))

    // Public API: Detail satu user berdasarkan ID
    .get('/:id', ({ params }: any) => UserApiController.show({ params }))

    // Protected API (Wajib Header 'Authorization: Bearer <token>')
    .guard({ beforeHandle: requireApiAuth.event.beforeHandle }, (app) =>
        app
            // Create user (201 Created)
            .post('/', ({ body, user }: any) => UserApiController.store({ body, user }), {
                body: t.Object({
                    name: t.String({ minLength: 2 }),
                    email: t.String(),
                })
            })
            // Update user (PUT)
            .put('/:id', ({ params, body }: any) => UserApiController.update({ params, body }), {
                body: t.Object({
                    name: t.String({ minLength: 2 }),
                    email: t.String(),
                })
            })
            // Update user (PATCH)
            .patch('/:id', ({ params, body }: any) => UserApiController.update({ params, body }), {
                body: t.Object({
                    name: t.String({ minLength: 2 }),
                    email: t.String(),
                })
            })
            // Delete user
            .delete('/:id', ({ params }: any) => UserApiController.destroy({ params }))
    );
