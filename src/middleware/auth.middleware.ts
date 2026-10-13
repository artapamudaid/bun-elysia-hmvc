// ============================================================
//  Auth Middleware (JWT-based)
//  Mendukung 2 mode: API (Bearer Token -> JSON) & Web (Cookie -> Redirect)
// ============================================================

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { ApiResponse } from '../helpers/response_helper';

// ── Tipe payload JWT ────────────────────────────────────────
export interface JwtPayload {
    id:    number;
    email: string;
    role:  string;
    name:  string;
}

// ── Auth Middleware ─────────────────────────────────────────
// Decode JWT dari Authorization Header (Bearer) atau Cookie
export const authMiddleware = new Elysia({ name: 'middleware:auth' })
    .use(jwt({
        name:   'jwt',
        secret: Bun.env.JWT_SECRET ?? 'change-me-in-production',
        exp:    Bun.env.JWT_EXPIRES ?? '7d',
    }))
    .use(cookie())
    .derive({ as: 'global' }, async ({ jwt: jwtInstance, cookie, request }) => {
        // 1. Cek Authorization Header: Bearer <token>
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        let token: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else if (cookie?.auth_token?.value) {
            // 2. Fallback: Cek cookie auth_token
            token = cookie.auth_token.value;
        }

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

        return { user, token };
    });

// ── Guard API: Wajib Login (Mengembalikan JSON 401) ───────────
export const requireApiAuth = new Elysia({ name: 'guard:api:auth' })
    .use(authMiddleware)
    .onBeforeHandle({ as: 'global' }, ({ user, set }: { user: JwtPayload | null; set: any }) => {
        if (!user) {
            set.status = 401;
            return ApiResponse.unauthorized('Akses ditolak: Token JWT tidak ditemukan, salah, atau telah kedaluwarsa');
        }
    });

// ── Guard Web: Wajib Login (Redirect 302 ke /auth/login) ──────
export const requireWebAuth = new Elysia({ name: 'guard:web:auth' })
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

// Default alias untuk backward compatibility
export const requireAuth = requireApiAuth;

// ── Guard: Cek Role (Mendukung mode API & Web) ───────────────
export function requireRole(...roles: string[]) {
    return new Elysia({ name: `guard:role:${roles.join(',')}` })
        .use(authMiddleware)
        .onBeforeHandle({ as: 'global' }, ({ user, set, request }: { user: JwtPayload | null; set: any; request: Request }) => {
            const isApi = new URL(request.url).pathname.startsWith('/api') ||
                request.headers.get('accept')?.includes('application/json');

            if (!user) {
                if (isApi) {
                    set.status = 401;
                    return ApiResponse.unauthorized('Akses ditolak: Anda harus login terlebih dahulu');
                }
                set.status = 302;
                return new Response(null, {
                    status: 302,
                    headers: { Location: '/auth/login' },
                });
            }

            if (!roles.includes(user.role)) {
                if (isApi) {
                    set.status = 403;
                    return ApiResponse.forbidden(`Hak akses ditolak. Diperlukan role: ${roles.join(', ')}`);
                }
                set.status = 403;
                return new Response(
                    `<h1>403 – Akses Ditolak</h1><p>Halaman ini hanya untuk: ${roles.join(', ')}</p>`,
                    { status: 403, headers: { 'Content-Type': 'text/html' } }
                );
            }
        });
}

// ── Helper: Generate token JWT ──────────────────────────────
export async function signToken(
    jwtInstance: { sign: (payload: object) => Promise<string> },
    payload: JwtPayload
): Promise<string> {
    return await jwtInstance.sign(payload as unknown as Record<string, string | number>);
}
