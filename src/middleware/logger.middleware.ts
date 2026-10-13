// ============================================================
//  Logger Middleware
//  Mirip CI3 Hooks: pre_controller + post_controller
//  Mencatat request method, url, dan status code
//
//  CATATAN Elysia 1.4.x: onAfterHandle di plugin sebaiknya
//  dipasang di app utama (index.ts), bukan di dalam plugin.
//  loggerMiddleware hanya handle onRequest (pre).
//  Untuk after-log, pakai logAfterHandle di index.ts
// ============================================================

import { Elysia } from 'elysia';
import appConfig from '../config/app';

// ANSI color codes untuk terminal
export const colors = {
    reset:  '\x1b[0m',
    dim:    '\x1b[2m',
    green:  '\x1b[32m',
    yellow: '\x1b[33m',
    red:    '\x1b[31m',
    cyan:   '\x1b[36m',
    blue:   '\x1b[34m',
    white:  '\x1b[37m',
    bold:   '\x1b[1m',
};

export function methodColor(method: string): string {
    const map: Record<string, string> = {
        GET:    colors.green,
        POST:   colors.blue,
        PUT:    colors.yellow,
        PATCH:  colors.yellow,
        DELETE: colors.red,
    };
    return (map[method] ?? colors.white) + colors.bold;
}

export function statusColor(status: number): string {
    if (status < 300) return colors.green + colors.bold;
    if (status < 400) return colors.cyan  + colors.bold;
    if (status < 500) return colors.yellow + colors.bold;
    return colors.red + colors.bold;
}

// Map global untuk simpan waktu mulai per request
export const requestTimings = new Map<string, number>();

// ── Logger Middleware (onRequest only) ──────────────────────
export const loggerMiddleware = new Elysia({ name: 'middleware:logger' })
    .onRequest(({ request }) => {
        if (!appConfig.debug) return;

        requestTimings.set(request.url, Date.now());

        const method = request.method.padEnd(6);
        const url    = new URL(request.url).pathname;
        const time   = new Date().toLocaleTimeString('id-ID', { hour12: false });

        process.stdout.write(
            `${colors.dim}[${time}]${colors.reset} ` +
            `${methodColor(request.method)}${method}${colors.reset} ` +
            `${url}\n`
        );
    });

// ── Log After Handler (pasang di app utama index.ts) ────────
// app.onAfterHandle(logAfterHandle)
export function logAfterHandle({ request, response }: { request: Request; response: unknown }) {
    if (!appConfig.debug) return;

    const startTime = requestTimings.get(request.url) ?? Date.now();
    const elapsed   = Date.now() - startTime;
    requestTimings.delete(request.url);

    const status  = response instanceof Response ? response.status : 200;
    const url     = new URL(request.url).pathname;
    const method  = request.method.padEnd(6);
    const time    = new Date().toLocaleTimeString('id-ID', { hour12: false });

    process.stdout.write(
        `${colors.dim}[${time}]${colors.reset} ` +
        `${methodColor(request.method)}${method}${colors.reset} ` +
        `${url} ` +
        `${statusColor(status)}${status}${colors.reset} ` +
        `${colors.dim}+${elapsed}ms${colors.reset}\n`
    );
}
