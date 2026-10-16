// ============================================================
//  Auth Web Controller
//  Menangani halaman Login Web, Logout, dan Session Management
// ============================================================

import { UserModel } from '../user/user.model';
import { SessionModel } from './session.model';
import { renderModuleView } from '../../config/view';
import { signToken } from '../../middleware/auth.middleware';

export class AuthController {
    /**
     * Tampilkan halaman Login Web (GET /auth/login)
     */
    static async showLogin({ user, query = {}, csrfToken = '', redirect }: any) {
        // Jika sudah login, redirect ke dashboard utama
        if (user) {
            return redirect('/dashboard');
        }

        return renderModuleView('auth/views/login', {
            title: 'Masuk Akun - Bun Elysia HMVC',
            pageType: 'login',
            currentUser: null,
            csrfToken: csrfToken ?? '',
            query,
        });
    }

    /**
     * Proses Login Web (POST /auth/login)
     */
    static async login({ body, request, cookie, redirect, jwt }: any) {
        const { email, password } = body;

        if (!email || !password) {
            return redirect('/auth/login?error=empty_fields');
        }

        // Cari user di database
        const user = await UserModel.getByEmail(email.trim());
        if (!user || !user.password) {
            return redirect('/auth/login?error=invalid_credentials');
        }

        // Verifikasi password hash Argon2id / bcrypt dengan Bun.password
        const passwordMatches = await Bun.password.verify(password, user.password);
        if (!passwordMatches) {
            return redirect('/auth/login?error=invalid_credentials');
        }

        // Generate Session ID unik
        const sessionId = crypto.randomUUID();
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

        // Simpan sesi ke tabel database `sessions`
        await SessionModel.create({
            id: sessionId,
            userId: user.id,
            ipAddress,
            userAgent,
            payload: {
                name: user.name,
                email: user.email,
                role: user.role ?? 'user',
            },
        });

        // Buat JWT token
        const token = await signToken(jwt, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role ?? 'user',
        });

        // Set Cookie Auth & Session
        cookie.auth_token.set({
            value: token,
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 hari
        });

        cookie.session_id.set({
            value: sessionId,
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        return redirect('/dashboard?status=login_success');
    }

    /**
     * Logout Web (GET /auth/logout)
     */
    static async logout({ cookie, redirect }: any) {
        const sessionId = cookie?.session_id?.value;
        if (sessionId) {
            await SessionModel.delete(sessionId);
        }

        // Hapus cookies
        cookie.auth_token.remove({ path: '/' });
        cookie.session_id.remove({ path: '/' });

        return redirect('/auth/login?status=logged_out');
    }

    /**
     * Tampilkan Tabel Session Management (GET /auth/sessions)
     */
    static async sessions({ user, query = {}, csrfToken = '' }: any) {
        const sessions = await SessionModel.getAllWithUser();

        return renderModuleView('auth/views/sessions', {
            title: 'Session Management - Sesi Pengguna Aktif',
            sessions,
            currentUser: user,
            activeNav: 'sessions',
            csrfToken: csrfToken ?? '',
            query,
        });
    }

    /**
     * Revoke / Hapus Sesi Tertentu (GET /auth/sessions/revoke/:id)
     */
    static async revokeSession({ params, redirect }: any) {
        if (params.id) {
            await SessionModel.delete(params.id);
        }

        return redirect('/auth/sessions?status=revoked');
    }
}
