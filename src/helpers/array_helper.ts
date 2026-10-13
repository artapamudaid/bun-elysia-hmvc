// ============================================================
//  Array Helper
//  Mirip CI3 array_helper.php
//  Usage: import { pluck, group_by, paginate } from '@/helpers/array_helper'
// ============================================================

/**
 * Ambil nilai satu kolom dari array of objects — mirip CI3 element() / array_column()
 * @example pluck(users, 'name') → ['Budi', 'Citra']
 */
export function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
    return arr.map((item) => item[key]);
}

/**
 * Group array of objects berdasarkan key — mirip Laravel groupBy()
 * @example group_by(users, 'role') → { admin: [...], user: [...] }
 */
export function group_by<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce<Record<string, T[]>>((acc, item) => {
        const group = String(item[key]);
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});
}

/**
 * Paginasi array — mirip CI3 Pagination library tapi untuk data lokal
 * @returns { data, total, page, perPage, lastPage, from, to }
 */
export interface PaginateResult<T> {
    data:     T[];
    total:    number;
    page:     number;
    perPage:  number;
    lastPage: number;
    from:     number;
    to:       number;
    hasNext:  boolean;
    hasPrev:  boolean;
}

export function paginate<T>(
    arr: T[],
    page: number = 1,
    perPage: number = 10
): PaginateResult<T> {
    const total    = arr.length;
    const lastPage = Math.ceil(total / perPage);
    const safePage = Math.max(1, Math.min(page, lastPage));
    const from     = (safePage - 1) * perPage;
    const to       = Math.min(from + perPage, total);

    return {
        data:     arr.slice(from, to),
        total,
        page:     safePage,
        perPage,
        lastPage,
        from:     from + 1,
        to,
        hasNext:  safePage < lastPage,
        hasPrev:  safePage > 1,
    };
}

/**
 * Cari item pertama yang cocok — mirip CI3 element()
 * @example find_where(users, 'id', 3) → { id: 3, name: 'Citra' }
 */
export function find_where<T>(arr: T[], key: keyof T, value: unknown): T | undefined {
    return arr.find((item) => item[key] === value);
}

/**
 * Hapus duplikat dari array — mirip array_unique()
 * @example unique_value([1, 2, 2, 3]) → [1, 2, 3]
 */
export function unique_value<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

/**
 * Unique by key dari array of objects
 * @example unique_by(users, 'email') → user unik berdasarkan email
 */
export function unique_by<T>(arr: T[], key: keyof T): T[] {
    const seen = new Set();
    return arr.filter((item) => {
        const k = item[key];
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

/**
 * Chunk array ke sub-array berukuran n — mirip PHP array_chunk()
 * @example chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/**
 * Flatten array satu level — mirip PHP array_merge() / JS flat()
 */
export function flatten<T>(arr: T[][]): T[] {
    return ([] as T[]).concat(...arr);
}
