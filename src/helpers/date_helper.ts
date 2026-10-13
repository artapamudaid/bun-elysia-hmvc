// ============================================================
//  Date Helper
//  Mirip CI3 date_helper.php
//  Usage: import { now, format_date, time_ago } from '@/helpers/date_helper'
// ============================================================

import appConfig from '../config/app';

/**
 * Tanggal/waktu sekarang — mirip CI3 now()
 * Menggunakan timezone dari APP_TIMEZONE di config
 */
export function now(): Date {
    return new Date();
}

/**
 * Format tanggal ke string lokal — mirip CI3 mdate()
 * @param date   Date object atau string ISO
 * @param format 'date' | 'datetime' | 'time' | string (Intl format)
 * @example format_date(new Date(), 'datetime') → '13 Oktober 2024, 08.30'
 */
export function format_date(
    date: Date | string,
    format: 'date' | 'datetime' | 'time' | Intl.DateTimeFormatOptions = 'date',
    locale: string = 'id-ID'
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const tz = appConfig.timezone;

    const presets: Record<string, Intl.DateTimeFormatOptions> = {
        date: {
            day: 'numeric', month: 'long', year: 'numeric',
            timeZone: tz,
        },
        datetime: {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: tz,
        },
        time: {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: tz,
        },
    };

    const opts = typeof format === 'string'
        ? presets[format] ?? presets.date
        : format;

    return new Intl.DateTimeFormat(locale, opts).format(d);
}

/**
 * Format tanggal ke format MySQL (YYYY-MM-DD HH:mm:ss)
 * @example mysql_date(new Date()) → '2024-10-13 08:30:00'
 */
export function mysql_date(date: Date | string = new Date()): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Waktu relatif (time ago) — mirip CI3 timespan()
 * @example time_ago(new Date('2024-10-01')) → '12 hari yang lalu'
 */
export function time_ago(date: Date | string, locale: string = 'id-ID'): string {
    const d     = typeof date === 'string' ? new Date(date) : date;
    const diff  = Date.now() - d.getTime(); // ms
    const rtf   = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours   / 24);
    const weeks   = Math.floor(days    / 7);
    const months  = Math.floor(days    / 30);
    const years   = Math.floor(days    / 365);

    if (seconds < 60)   return rtf.format(-seconds, 'second');
    if (minutes < 60)   return rtf.format(-minutes, 'minute');
    if (hours   < 24)   return rtf.format(-hours,   'hour');
    if (days    < 7)    return rtf.format(-days,    'day');
    if (weeks   < 4)    return rtf.format(-weeks,   'week');
    if (months  < 12)   return rtf.format(-months,  'month');
    return rtf.format(-years, 'year');
}

/**
 * Cek apakah tanggal sudah lewat
 */
export function is_past(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getTime() < Date.now();
}

/**
 * Tambah hari ke tanggal
 * @example add_days(new Date(), 7) → 7 hari dari sekarang
 */
export function add_days(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
