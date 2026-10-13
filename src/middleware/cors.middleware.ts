// ============================================================
//  CORS Middleware
//  Cross-Origin Resource Sharing headers
//  Berguna saat frontend (React/Vue) di domain berbeda
// ============================================================

import { Elysia } from 'elysia';

interface CorsOptions {
    origin?:      string | string[] | RegExp | boolean;
    methods?:     string[];
    headers?:     string[];
    credentials?: boolean;
    maxAge?:      number;
}

const DEFAULT_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const DEFAULT_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

export function corsMiddleware(options: CorsOptions = {}) {
    const {
        origin      = '*',
        methods     = DEFAULT_METHODS,
        headers     = DEFAULT_HEADERS,
        credentials = false,
        maxAge      = 86400,
    } = options;

    function resolveOrigin(requestOrigin: string | null): string {
        if (!requestOrigin || origin === '*' || origin === true) return '*';
        if (typeof origin === 'string')  return origin === requestOrigin ? origin : '';
        if (origin instanceof RegExp)    return origin.test(requestOrigin) ? requestOrigin : '';
        if (Array.isArray(origin))       return origin.includes(requestOrigin) ? requestOrigin : '';
        return '';
    }

    return new Elysia({ name: 'middleware:cors' })
        .onRequest(({ request, set }) => {
            const reqOrigin   = request.headers.get('origin');
            const allowOrigin = resolveOrigin(reqOrigin);

            const headersList: Record<string, string> = {
                'Access-Control-Allow-Origin': allowOrigin || '*',
                'Access-Control-Allow-Methods': methods.join(', '),
                'Access-Control-Allow-Headers': headers.join(', '),
            };

            if (credentials) {
                headersList['Access-Control-Allow-Credentials'] = 'true';
            }

            // Set ke response headers
            Object.assign(set.headers, headersList);

            // Preflight OPTIONS — return Response 204 langsung
            if (request.method === 'OPTIONS') {
                headersList['Access-Control-Max-Age'] = String(maxAge);
                return new Response(null, {
                    status: 204,
                    headers: headersList,
                });
            }
        });
}

// Instance default — bisa langsung di-use
export const cors = corsMiddleware();
