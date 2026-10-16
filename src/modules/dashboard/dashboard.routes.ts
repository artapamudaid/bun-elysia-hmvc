import { Elysia } from 'elysia';
import { requireWebAuth } from '../../middleware/auth.middleware';
import { DashboardController } from './dashboard.controller';

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
    .use(requireWebAuth)
    .get('/', ({ user, csrfToken, query }: any) => DashboardController.index({ user, csrfToken, query }));
