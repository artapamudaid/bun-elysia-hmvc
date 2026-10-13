// ============================================================
//  Datatable & Server-Side Pagination Helper
//  Mirip library DataTables / CI3 pagination untuk query builder
// ============================================================

import type { Knex } from 'knex';

export interface DatatableParams {
    page?: number | string;
    perPage?: number | string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc' | string;
    draw?: number | string;
}

export interface DatatableOptions {
    searchableColumns?: string[];
    sortableColumns?: string[];
    defaultSort?: string;
    defaultOrder?: 'asc' | 'desc';
    defaultPerPage?: number;
    maxPerPage?: number;
}

export interface DatatableResponse<T> {
    data: T[];
    recordsTotal: number;
    recordsFiltered: number;
    page: number;
    perPage: number;
    lastPage: number;
    from: number;
    to: number;
    hasNext: boolean;
    hasPrev: boolean;
    sort: string;
    order: 'asc' | 'desc';
    search: string;
    draw?: number;
}

/**
 * Helper untuk query server-side datatable dengan filter, sort, dan pagination menggunakan Knex.
 *
 * @example
 * const result = await datatableQuery<User>(db('users'), params, {
 *     searchableColumns: ['name', 'email'],
 *     sortableColumns: ['id', 'name', 'email', 'created_at'],
 *     defaultSort: 'id',
 *     defaultOrder: 'asc'
 * });
 */
export async function datatableQuery<T extends Record<string, any>>(
    baseQuery: Knex.QueryBuilder,
    params: DatatableParams = {},
    options: DatatableOptions = {}
): Promise<DatatableResponse<T>> {
    const {
        searchableColumns = [],
        sortableColumns = [],
        defaultSort = 'id',
        defaultOrder = 'asc',
        defaultPerPage = 10,
        maxPerPage = 100
    } = options;

    // Normalisasi pagination params
    const page = Math.max(1, parseInt(String(params.page || 1), 10) || 1);
    const requestedPerPage = parseInt(String(params.perPage || defaultPerPage), 10) || defaultPerPage;
    const perPage = Math.min(Math.max(1, requestedPerPage), maxPerPage);
    const search = (params.search || '').trim();

    // Normalisasi sorting
    const requestedSort = (params.sort || defaultSort).trim();
    const sort = sortableColumns.length === 0 || sortableColumns.includes(requestedSort)
        ? requestedSort
        : defaultSort;

    const requestedOrder = (params.order || defaultOrder).toLowerCase();
    const order: 'asc' | 'desc' = requestedOrder === 'desc' ? 'desc' : 'asc';

    // 1. Hitung total data sebelum filter pencarian
    const totalCountQuery = baseQuery.clone().clearSelect().clearOrder().count<{ total: number }[]>('* as total');
    const totalCountResult = await totalCountQuery;
    const recordsTotal = Number(totalCountResult[0]?.total || 0);

    // 2. Terapkan filter pencarian jika ada kata kunci
    const filteredQuery = baseQuery.clone();
    if (search && searchableColumns.length > 0) {
        filteredQuery.where((builder) => {
            searchableColumns.forEach((col, idx) => {
                if (idx === 0) {
                    builder.where(col, 'like', `%${search}%`);
                } else {
                    builder.orWhere(col, 'like', `%${search}%`);
                }
            });
        });
    }

    // 3. Hitung total data setelah filter
    let recordsFiltered = recordsTotal;
    if (search && searchableColumns.length > 0) {
        const filteredCountQuery = filteredQuery.clone().clearSelect().clearOrder().count<{ total: number }[]>('* as total');
        const filteredCountResult = await filteredCountQuery;
        recordsFiltered = Number(filteredCountResult[0]?.total || 0);
    }

    // 4. Hitung parameter batas halaman
    const lastPage = Math.max(1, Math.ceil(recordsFiltered / perPage));
    const safePage = Math.min(page, lastPage);
    const offset = (safePage - 1) * perPage;

    // 5. Eksekusi query data dengan sort & pagination
    const data = await filteredQuery
        .clone()
        .orderBy(sort, order)
        .limit(perPage)
        .offset(offset);

    const from = recordsFiltered === 0 ? 0 : offset + 1;
    const to = Math.min(offset + perPage, recordsFiltered);

    const draw = params.draw !== undefined ? Number(params.draw) : undefined;

    return {
        data: data as T[],
        recordsTotal,
        recordsFiltered,
        page: safePage,
        perPage,
        lastPage,
        from,
        to,
        hasNext: safePage < lastPage,
        hasPrev: safePage > 1,
        sort,
        order,
        search,
        draw,
    };
}
