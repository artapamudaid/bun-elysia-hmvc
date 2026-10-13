// ============================================================
//  URL Helper
//  Mirip CI3 url_helper.php
//  Usage: import { base_url, site_url, anchor } from '@/helpers/url_helper'
// ============================================================

import appConfig from '../config/app';

/**
 * Base URL — mirip CI3 base_url()
 * @example base_url('assets/css/style.css') → 'http://localhost:3000/assets/css/style.css'
 */
export function base_url(path: string = ''): string {
    const base = appConfig.baseUrl.replace(/\/$/, '');
    const uri  = path.replace(/^\//, '');
    return uri ? `${base}/${uri}` : base;
}

/**
 * Site URL — mirip CI3 site_url() (auto prefix /public jika perlu)
 * @example site_url('users') → 'http://localhost:3000/users'
 */
export function site_url(path: string = ''): string {
    return base_url(path);
}

/**
 * Current URL — mirip CI3 current_url()
 */
export function current_url(request: Request): string {
    return request.url;
}

/**
 * Previous URL dari Referer header — mirip CI3 uri_string()
 */
export function previous_url(request: Request): string {
    return request.headers.get('referer') ?? base_url();
}

/**
 * Buat anchor tag HTML — mirip CI3 anchor()
 * @example anchor('/users', 'Lihat User', { class: 'btn' })
 */
export function anchor(
    href: string,
    title: string,
    attrs: Record<string, string> = {}
): string {
    const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
    const url = href.startsWith('http') ? href : base_url(href);
    return `<a href="${url}"${attrStr ? ' ' + attrStr : ''}>${title}</a>`;
}

/**
 * Redirect helper (return dari Elysia handler) — mirip CI3 redirect()
 * @example return redirect('/users');
 */
export function redirect(path: string, status: 301 | 302 = 302): Response {
    return new Response(null, {
        status,
        headers: { Location: path.startsWith('http') ? path : base_url(path) },
    });
}
