// ============================================================
//  CSRF Protection Middleware
//  Mirip proteksi CSRF di CodeIgniter 3:
//  - Menyimpan token di cookie (HttpOnly/Secure opsional)
//  - Validasi token pada method POST, PUT, PATCH, DELETE
//  - Token dapat dikirim via form body (csrf_token) atau header (X-CSRF-Token)
// ============================================================

import { Elysia } from 'elysia';

export interface CsrfOptions {
    cookieName?: string;       // default: 'csrf_token' (mirip csrf_cookie_name di CI3)
    paramName?: string;        // default: 'csrf_token' (mirip csrf_token_name di CI3)
    headerName?: string;       // default: 'x-csrf-token'
    excludedMethods?: string[];
    excludedPaths?: string[];
}

function generateRandomToken(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function parseCookie(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce((acc, str) => {
        const [k, v] = str.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
    }, {} as Record<string, string>);
}

export function csrfMiddleware(options: CsrfOptions = {}) {
    const {
        cookieName = 'csrf_token',
        paramName = 'csrf_token',
        headerName = 'x-csrf-token',
        excludedMethods = ['GET', 'HEAD', 'OPTIONS'],
        excludedPaths = [],
    } = options;

    return new Elysia({ name: 'middleware:csrf' })
        .derive({ as: 'global' }, ({ request }) => {
            const cookies = parseCookie(request.headers.get('cookie'));
            const existingToken = cookies[cookieName];
            const token = existingToken || generateRandomToken();

            return {
                csrfToken: token,
                csrfInput: `<input type="hidden" name="${paramName}" value="${token}">`,
            };
        })
        .onBeforeHandle({ as: 'global' }, async ({ request, set, body }: any) => {
            const method = request.method.toUpperCase();
            const url = new URL(request.url);

            // Lewati method yang aman seperti GET, HEAD, OPTIONS
            if (excludedMethods.includes(method)) {
                return;
            }

            // Lewati path yang dikecualikan (misal webhook)
            if (excludedPaths.some(p => url.pathname.startsWith(p))) {
                return;
            }

            const cookies = parseCookie(request.headers.get('cookie'));
            const expectedToken = cookies[cookieName];

            // Ambil token dari Header atau Form Body
            const receivedHeader = request.headers.get(headerName) || request.headers.get(headerName.toLowerCase());
            let receivedBody = undefined;

            if (body && typeof body === 'object') {
                receivedBody = body[paramName];
            }

            const submittedToken = receivedHeader || receivedBody;

            // Validasi token
            if (!expectedToken || !submittedToken || submittedToken !== expectedToken) {
                set.status = 403;
                return new Response(
                    `<!DOCTYPE html>
<html>
<head><title>403 – CSRF Token Mismatch</title></head>
<body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
    <h2>403 – Forbidden</h2>
    <p>Aksi tidak diizinkan: CSRF token tidak valid atau telah kadaluarsa (The action you have requested is not allowed).</p>
    <a href="javascript:history.back()" style="color: #38bdf8;">&larr; Kembali</a>
</body>
</html>`,
                    {
                        status: 403,
                        headers: { 'Content-Type': 'text/html' }
                    }
                );
            }
        })
        .onAfterHandle({ as: 'global' }, ({ request, set, csrfToken }: any) => {
            // Pastikan cookie diset pada response jika belum ada atau diperbarui
            const cookies = parseCookie(request.headers.get('cookie'));
            if (!cookies[cookieName] && csrfToken) {
                // Set cookie CSRF (SameSite Lax, Path /)
                const cookieString = `${cookieName}=${csrfToken}; Path=/; SameSite=Lax`;
                set.headers['Set-Cookie'] = cookieString;
            }
        });
}

export const csrf = csrfMiddleware();
