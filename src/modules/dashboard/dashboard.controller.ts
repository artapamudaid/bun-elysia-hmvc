import { renderModuleView } from '../../config/view';
import { DashboardModel } from './dashboard.model';

export class DashboardController {
    static async index({ user, csrfToken = '', query = {} }: any) {
        const overview = await DashboardModel.getOverview();
        return renderModuleView('dashboard/views/index', {
            title: 'Dashboard Rekrutmen',
            overview,
            currentUser: user,
            csrfToken,
            query,
            activeNav: 'dashboard',
        });
    }
}
