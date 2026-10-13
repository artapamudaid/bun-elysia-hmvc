// ============================================================
//  Application Entry Point
//  Mirip CI3 index.php + application/config/routes.php
//  Auto-loads semua module routes dari src/modules/
// ============================================================

import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import appConfig from './config/app';
import { loggerMiddleware, logAfterHandle } from './middleware/logger.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import { rateLimitMiddleware } from './middleware/ratelimit.middleware';
import { csrfMiddleware } from './middleware/csrf.middleware';

// ── Auto-import semua *routes.ts di dalam src/modules/**  ──
// Mirip CI3 HMVC: setiap modul mendaftarkan dirinya sendiri
const routeFiles = await Array.fromAsync(
    new Bun.Glob('modules/*/*.routes.ts').scan({
        cwd: import.meta.dir,
        absolute: true,
    })
);

// ── Bootstrap App ──────────────────────────────────────────
const app = new Elysia()

    // Static files (public/)
    .use(staticPlugin({ prefix: '/public' }))

    // Logger middleware — pre-request log dengan warna
    .use(loggerMiddleware)

    // Rate limiter — proteksi request flood / DDoS per client IP
    .use(rateLimitMiddleware({ max: 100, windowMs: 60_000 }))

    // CORS middleware — aktifkan untuk API / frontend terpisah
    .use(corsMiddleware())

    // CSRF protection — validasi token untuk form submission (POST/PUT/DELETE)
    .use(csrfMiddleware({ excludedPaths: ['/api/'] }))

    // After-handle log (response time) — dipasang di app bukan plugin (Elysia 1.4.x)
    .onAfterHandle(logAfterHandle)

    // Route default / -> redirect ke /users
    .get('/', ({ redirect }) => {
        return redirect('/users');
    })

    // Global error handler (mirip CI3 show_error / show_404)
    .onError(({ code, error, request }) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ERROR] ${request.method} ${new URL(request.url).pathname} — ${code}:`, message);

        if (code === 'NOT_FOUND') {
            return new Response(
                `<h1>404 – Halaman tidak ditemukan</h1><p>${new URL(request.url).pathname}</p>`,
                { status: 404, headers: { 'Content-Type': 'text/html' } }
            );
        }

        return new Response(
            `<h1>500 – Internal Server Error</h1><pre>${appConfig.debug ? message : 'Terjadi kesalahan'}</pre>`,
            { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
    });

// ── Register semua module routes secara dinamis ────────────
for (const file of routeFiles) {
    const mod = await import(file);

    // Convention: setiap routes.ts wajib export named export
    // dengan suffix "Routes" (e.g. userRoutes, productRoutes)
    const routeExport = Object.values(mod).find(
        (v): v is Elysia => v instanceof Elysia
    );

    if (routeExport) {
        app.use(routeExport);
        if (appConfig.debug) {
            const moduleName = file.split('/').at(-1)?.replace('.routes.ts', '');
            console.log(`  ✔ Module loaded: ${moduleName}`);
        }
    }
}

// ── Start Server ───────────────────────────────────────────
app.listen(appConfig.port, () => {
    console.log('');
    console.log(`┌─────────────────────────────────────────┐`);
    console.log(`│  🚀  ${appConfig.name.padEnd(35)}│`);
    console.log(`│  ENV : ${appConfig.env.padEnd(33)}│`);
    console.log(`│  URL : ${appConfig.baseUrl.padEnd(33)}│`);
    console.log(`└─────────────────────────────────────────┘`);
    console.log('');
});

export { app };
