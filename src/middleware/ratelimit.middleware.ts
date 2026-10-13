// ============================================================
//  Rate Limit Middleware
//  Membatasi jumlah request per client IP dalam kurun waktu tertentu
//  Mirip throttle / rate limiter pada framework MVC modern
// ============================================================

import { Elysia } from 'elysia';

export interface RateLimitOptions {
    max?: number;          // Maksimal request dalam window
    windowMs?: number;     // Durasi window dalam milidetik (default: 60_000 = 1 menit)
    message?: string;      // Pesan error jika terlampaui
    skipSuccessfulRequests?: boolean;
}

interface ClientRecord {
    count: number;
    resetTime: number;
}

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
    const {
        max = 60,
        windowMs = 60_000,
        message = 'Too many requests, silakan coba beberapa saat lagi.',
    } = options;

    const store = new Map<string, ClientRecord>();

    // Bersihkan IP yang expired secara periodik agar hemat memori
    setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of store.entries()) {
            if (now > record.resetTime) {
                store.delete(ip);
            }
        }
    }, windowMs);

    return new Elysia({ name: 'middleware:ratelimit' })
        .onRequest(({ request, set }) => {
            // Dapatkan IP klien dari proxy headers atau fallback
            const forwardedFor = request.headers.get('x-forwarded-for');
            const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

            const now = Date.now();
            let record = store.get(clientIp);

            if (!record || now > record.resetTime) {
                record = {
                    count: 1,
                    resetTime: now + windowMs,
                };
                store.set(clientIp, record);
            } else {
                record.count++;
            }

            const remaining = Math.max(0, max - record.count);
            const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

            set.headers['X-RateLimit-Limit'] = String(max);
            set.headers['X-RateLimit-Remaining'] = String(remaining);
            set.headers['X-RateLimit-Reset'] = String(resetSeconds);

            if (record.count > max) {
                set.headers['Retry-After'] = String(resetSeconds);
                const accept = request.headers.get('accept') ?? '';

                if (accept.includes('application/json')) {
                    return new Response(
                        JSON.stringify({
                            status: 429,
                            error: 'Too Many Requests',
                            message,
                            retryAfterSeconds: resetSeconds,
                        }),
                        {
                            status: 429,
                            headers: {
                                'Content-Type': 'application/json',
                                'Retry-After': String(resetSeconds),
                            },
                        }
                    );
                }

                return new Response(
                    `<!DOCTYPE html>
<html>
<head><title>429 – Terlalu Banyak Permintaan</title></head>
<body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
    <h2>429 – Terlalu Banyak Permintaan</h2>
    <p>${message}</p>
    <p><small>Silakan coba kembali dalam ${resetSeconds} detik.</small></p>
</body>
</html>`,
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'text/html',
                            'Retry-After': String(resetSeconds),
                        },
                    }
                );
            }
        });
}

export const rateLimit = rateLimitMiddleware();
