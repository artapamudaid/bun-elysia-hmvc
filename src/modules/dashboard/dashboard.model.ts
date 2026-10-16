import db from '../../config/database';

export interface DashboardJob {
    id: number;
    title: string;
    slug: string;
    division: string;
    start_date: string | Date;
    end_date: string | Date;
    is_active: boolean;
    created_at: string | Date;
}

export interface DashboardUser {
    id: number;
    name: string;
    email: string;
    created_at: string | Date;
}

export class DashboardModel {
    static async getOverview() {
        const today = this.today();
        const sevenDaysFromNow = this.addDays(today, 7);

        const [jobTotals, openNow, scheduled, divisionTotal, userTotal, expiringSoon, jobsByDivision, recentJobs, recentUsers] = await Promise.all([
            db('jobs').count<{ total: number }[]>({ total: 'id' }).first(),
            db('jobs').where('is_active', true).where('start_date', '<=', today).where('end_date', '>=', today).count<{ total: number }[]>({ total: 'id' }).first(),
            db('jobs').where('is_active', true).where('start_date', '>', today).count<{ total: number }[]>({ total: 'id' }).first(),
            db('divisions').count<{ total: number }[]>({ total: 'id' }).first(),
            db('users').count<{ total: number }[]>({ total: 'id' }).first(),
            db('jobs as j')
                .join('divisions as d', 'j.division_id', 'd.id')
                .select('j.id', 'j.title', 'j.end_date', 'd.name as division')
                .where('j.is_active', true)
                .whereBetween('j.end_date', [today, sevenDaysFromNow])
                .orderBy('j.end_date', 'asc')
                .limit(5),
            db('divisions as d')
                .leftJoin('jobs as j', 'j.division_id', 'd.id')
                .select('d.id', 'd.name')
                .count({ total_jobs: 'j.id' })
                .groupBy('d.id', 'd.name')
                .orderBy('total_jobs', 'desc')
                .orderBy('d.name', 'asc'),
            db<DashboardJob>('jobs as j')
                .join('divisions as d', 'j.division_id', 'd.id')
                .select('j.id', 'j.title', 'j.slug', 'j.start_date', 'j.end_date', 'j.is_active', 'j.created_at', 'd.name as division')
                .orderBy('j.created_at', 'desc')
                .limit(5),
            db<DashboardUser>('users')
                .select('id', 'name', 'email', 'created_at')
                .orderBy('created_at', 'desc')
                .limit(5),
        ]);

        return {
            asOf: today,
            metrics: {
                totalJobs: this.count(jobTotals),
                openNow: this.count(openNow),
                scheduled: this.count(scheduled),
                totalDivisions: this.count(divisionTotal),
                totalUsers: this.count(userTotal),
            },
            expiringSoon,
            jobsByDivision: jobsByDivision.map((row: any) => ({
                id: Number(row.id),
                name: row.name,
                total: Number(row.total_jobs),
            })),
            recentJobs,
            recentUsers,
        };
    }

    private static count(row: any): number {
        return Number(row?.total ?? 0);
    }

    private static today(): string {
        return new Intl.DateTimeFormat('en-CA', { timeZone: Bun.env.APP_TIMEZONE ?? 'Asia/Jakarta' }).format(new Date());
    }

    private static addDays(date: string, days: number): string {
        const value = new Date(`${date}T00:00:00.000Z`);
        value.setUTCDate(value.getUTCDate() + days);
        return value.toISOString().slice(0, 10);
    }
}
