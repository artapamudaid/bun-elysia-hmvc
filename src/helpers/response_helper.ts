// ============================================================
//  API Response Helper
//  Standar format response JSON untuk mode API
// ============================================================

export interface ApiResponsePayload<T = any> {
    success: boolean;
    message: string;
    data?: T;
    meta?: Record<string, any>;
    error?: any;
}

export class ApiResponse {
    /**
     * Respon sukses standar (200 / 201)
     */
    static success<T>(
        data: T,
        message: string = 'Operasi berhasil',
        meta?: Record<string, any>,
        status: number = 200
    ) {
        const payload: ApiResponsePayload<T> = {
            success: true,
            message,
            data,
            ...(meta ? { meta } : {})
        };

        return new Response(JSON.stringify(payload), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * Respon created (201)
     */
    static created<T>(data: T, message: string = 'Data berhasil dibuat') {
        return this.success(data, message, undefined, 201);
    }

    /**
     * Respon error standar (400, 422, 500, dll)
     */
    static error(
        message: string = 'Terjadi kesalahan',
        error: any = null,
        status: number = 400
    ) {
        const payload: ApiResponsePayload = {
            success: false,
            message,
            error: error ?? message
        };

        return new Response(JSON.stringify(payload), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * 401 Unauthorized
     */
    static unauthorized(message: string = 'Autentikasi gagal atau token JWT tidak valid') {
        return this.error(message, 'UNAUTHORIZED', 401);
    }

    /**
     * 403 Forbidden
     */
    static forbidden(message: string = 'Anda tidak memiliki hak akses untuk resource ini') {
        return this.error(message, 'FORBIDDEN', 403);
    }

    /**
     * 404 Not Found
     */
    static notFound(message: string = 'Data atau endpoint tidak ditemukan') {
        return this.error(message, 'NOT_FOUND', 404);
    }

    /**
     * 422 Unprocessable Entity (Validasi)
     */
    static validationError(message: string = 'Data yang dikirim tidak valid', details?: any) {
        return this.error(message, details ?? 'VALIDATION_ERROR', 422);
    }
}
