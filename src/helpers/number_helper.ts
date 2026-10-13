// ============================================================
//  Number Helper
//  Mirip CI3 number_helper.php
//  Usage: import { currency, format_bytes } from '@/helpers/number_helper'
// ============================================================

/**
 * Format angka ke format mata uang — mirip CI3 number_format()
 * @example currency(150000) → 'Rp 150.000'
 * @example currency(150000, 'USD') → '$150,000.00'
 */
export function currency(
    amount: number,
    currencyCode: string = 'IDR',
    locale: string = 'id-ID'
): string {
    return new Intl.NumberFormat(locale, {
        style:    'currency',
        currency: currencyCode,
        minimumFractionDigits: currencyCode === 'IDR' ? 0 : 2,
    }).format(amount);
}

/**
 * Format angka dengan pemisah ribuan
 * @example number_format(1500000) → '1.500.000'
 */
export function number_format(
    num: number,
    decimals: number = 0,
    locale: string = 'id-ID'
): string {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Konversi bytes ke ukuran yang mudah dibaca — mirip CI3 byte_format()
 * @example format_bytes(1536) → '1.5 KB'
 */
export function format_bytes(bytes: number, decimals: number = 1): string {
    if (bytes === 0) return '0 Bytes';
    const k     = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i     = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format angka ke persentase
 * @example percentage(0.75) → '75%'
 * @example percentage(75, false) → '75%'
 */
export function percentage(num: number, isDecimal: boolean = true, decimals: number = 1): string {
    const val = isDecimal ? num * 100 : num;
    return `${val.toFixed(decimals)}%`;
}

/**
 * Clamp angka antara min dan max
 * @example clamp(150, 0, 100) → 100
 */
export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

/**
 * Ordinal number — 1st, 2nd, 3rd, dst (bahasa Inggris)
 * @example ordinal(1) → '1st'
 */
export function ordinal(num: number): string {
    const s    = ['th', 'st', 'nd', 'rd'];
    const v    = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}
