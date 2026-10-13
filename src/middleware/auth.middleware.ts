// ============================================================
//  Auth Middleware (JWT-based)
//  Mirip CI3 MY_Controller + Ion Auth
//
//  Usage di routes.ts:
//    import { authMiddleware, requireAuth, requireRole } from '@/middleware/auth.middleware';
//
//    // Semua route di bawah wajib login:
//    export const adminRoutes = new Elysia({ prefix: '/admin' })
//        .use(requireAuth)
//        .get('/', AdminController.index)
//
//    // Hanya role tertentu:
//        .use(requireRole('admin', 'superadmin'))
//        .get('/settings', AdminController.settings)
// ============================================================

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';

// ── Tipe payload JWT ────────────────────────────────────────
export interface JwtPayload {
    id:    number;
    email: string;
    role:  string;
    name:  string;
}

// ── Auth Middleware ─────────────────────────────────────────
// Decode JWT dari cookie dan inject `user` ke context
// Tambahkan ke app atau route group agar ctx.user tersedia
export const authMiddleware = new Elysia({ name: 'middleware:auth' })
    .use(jwt({
        name:   'jwt',
        secret: Bun.env.JWT_SECRET ?? 'change-me-in-production',
        exp:    Bun.env.JWT_EXPIRES ?? '7d',
    }))
    .use(cookie())
    .derive({ as: 'global' }, async ({ jwt: jwtInstance, cookie }) => {
        const token = cookie?.auth_token?.value ?? null;
        let user: JwtPayload | null = null;

        if (token) {
            try {
                const payload = await jwtInstance.verify(token);
                if (payload && typeof payload === 'object' && 'id' in payload) {
                    user = payload as unknown as JwtPayload;
                }
            } catch {
                user = null;
            }
        }

        return { user };
    });

// ── Guard: Wajib Login ──────────────────────────────────────
// Mirip CI3: if (!$this->session->userdata('logged_in')) redirect('/login')
export const requireAuth = new Elysia({ name: 'guard:auth' })
    .use(authMiddleware)
    .onBeforeHandle({ as: 'global' }, ({ user, set }: { user: JwtPayload | null; set: any }) => {
        if (!user) {
            set.status = 302;
            return new Response(null, {
                status: 302,
                headers: { Location: '/auth/login' },
            });
        }
    });

// ── Guard: Cek Role ─────────────────────────────────────────
// Mirip CI3: if ($this->session->userdata('role') !== 'admin') show_error(403)
export function requireRole(...roles: string[]) {
    return new Elysia({ name: `guard:role:${roles.join(',')}` })
        .use(authMiddleware)
        .onBeforeHandle({ as: 'global' }, ({ user, set }: { user: JwtPayload | null; set: any }) => {
            if (!user) {
                set.status = 302;
                return new Response(null, {
                    status: 302,
                    headers: { Location: '/auth/login' },
                });
            }

            if (!roles.includes(user.role)) {
                set.status = 403;
                return new Response(
                    `<h1>403 – Akses Ditolak</h1><p>Halaman ini hanya untuk: ${roles.join(', ')}</p>`,
                    { status: 403, headers: { 'Content-Type': 'text/html' } }
                );
            }
        });
}

// ── Helper: Generate token (pakai di auth controller) ───────
// Contoh penggunaan di AuthController.login():
//   const token = await signToken(ctx.jwt, { id: 1, email: '...', role: 'admin', name: '...' });
export async function signToken(
    jwtInstance: { sign: (payload: object) => Promise<string> },
    payload: JwtPayload
): Promise<string> {
    return await jwtInstance.sign(payload as unknown as Record<string, string | number>);
}
