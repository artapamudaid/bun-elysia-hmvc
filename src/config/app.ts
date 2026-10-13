// ============================================================
//  Application Configuration
//  Mirip CI3 application/config/config.php
// ============================================================

export const appConfig = {
    name:        Bun.env.APP_NAME     ?? 'Bun Elysia HMVC',
    env:         Bun.env.APP_ENV      ?? 'development',
    port:        Number(Bun.env.APP_PORT ?? 3000),
    baseUrl:     Bun.env.APP_URL      ?? 'http://localhost:3000',
    debug:       (Bun.env.APP_DEBUG   ?? 'true') === 'true',
    timezone:    Bun.env.APP_TIMEZONE ?? 'Asia/Jakarta',
};

export default appConfig;
