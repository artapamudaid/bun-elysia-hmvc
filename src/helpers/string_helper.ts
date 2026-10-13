// ============================================================
//  String Helper
//  Mirip CI3 string_helper.php + text_helper.php
//  Usage: import { slug, truncate, random_string } from '@/helpers/string_helper'
// ============================================================

/**
 * Buat URL slug dari string — mirip CI3 url_title()
 * @example slug('Halo Dunia!') → 'halo-dunia'
 */
export function slug(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/**
 * Potong teks ke panjang tertentu — mirip CI3 character_limiter()
 * @example truncate('Halo Dunia Bro', 8) → 'Halo Dun...'
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length).trimEnd() + suffix;
}

/**
 * Potong teks berdasarkan jumlah kata — mirip CI3 word_limiter()
 * @example word_limit('Halo Dunia Bro', 2) → 'Halo Dunia...'
 */
export function word_limit(str: string, limit: number, suffix: string = '...'): string {
    const words = str.trim().split(/\s+/);
    if (words.length <= limit) return str;
    return words.slice(0, limit).join(' ') + suffix;
}

/**
 * Generate random string — mirip CI3 random_string()
 * @param type  'alnum' | 'alpha' | 'numeric' | 'nozero' | 'unique' | 'md5'
 * @param length panjang string (tidak berlaku untuk 'unique' dan 'md5')
 */
export function random_string(
    type: 'alnum' | 'alpha' | 'numeric' | 'nozero' | 'unique' | 'md5' = 'alnum',
    length: number = 8
): string {
    const sets = {
        alnum:   'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        alpha:   'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numeric: '0123456789',
        nozero:  '123456789',
    };

    if (type === 'unique' || type === 'md5') {
        return crypto.randomUUID().replace(/-/g, '');
    }

    const charset = sets[type];
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map((b) => charset[b % charset.length])
        .join('');
}

/**
 * Kapitalisasi huruf pertama setiap kata — mirip PHP ucwords()
 * @example ucwords('halo dunia') → 'Halo Dunia'
 */
export function ucwords(str: string): string {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Highlight kata pencarian dalam teks
 * @example highlight('Halo Dunia', 'Dunia') → 'Halo <mark>Dunia</mark>'
 */
export function highlight(str: string, keyword: string, tag: string = 'mark'): string {
    if (!keyword.trim()) return str;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return str.replace(new RegExp(`(${escaped})`, 'gi'), `<${tag}>$1</${tag}>`);
}

/**
 * Strip tag HTML dari string
 * @example strip_tags('<b>Halo</b>') → 'Halo'
 */
export function strip_tags(str: string): string {
    return str.replace(/<[^>]*>/g, '');
}
