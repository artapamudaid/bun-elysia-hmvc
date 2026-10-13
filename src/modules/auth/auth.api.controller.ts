import { UserModel } from '../user/user.model';
import { ApiResponse } from '../../helpers/response_helper';
import { signToken } from '../../middleware/auth.middleware';

export class AuthApiController {
    /**
     * POST /api/auth/login
     * Login untuk mendapatkan token JWT
     */
    static async login({ body, jwt }: any) {
        const { email, password } = body;

        if (!email) {
            return ApiResponse.validationError('Email wajib diisi');
        }

        // Cari user di database
        const user = await UserModel.getByEmail(email.trim());
        if (!user) {
            return ApiResponse.unauthorized('Kredensial tidak valid: Pengguna tidak ditemukan');
        }

        // Generate token JWT
        const token = await signToken(jwt, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.id === 1 ? 'admin' : 'user',
        });

        return ApiResponse.success({
            token,
            token_type: 'Bearer',
            expires_in: Bun.env.JWT_EXPIRES ?? '7d',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.id === 1 ? 'admin' : 'user',
            }
        }, 'Login berhasil');
    }

    /**
     * GET /api/auth/profile atau GET /api/auth/me
     * Menampilkan profil user saat ini dari JWT token
     */
    static async profile({ user }: any) {
        if (!user) {
            return ApiResponse.unauthorized();
        }

        return ApiResponse.success(user, 'Data profil pengguna yang sedang terautentikasi');
    }
}
