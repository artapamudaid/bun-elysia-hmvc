# ⚡ Bun Elysia HMVC

Boilerplate & starter kit arsitektur **HMVC (Hierarchical Model View Controller)** modern berbasis **Bun** dan **Elysia.js**, terinspirasi dari filosofi kesederhanaan dan kemudahan **CodeIgniter 3**.

Proyek ini menghadirkan kecepatan runtime Bun dengan modularitas HMVC yang rapi, dilengkapi proteksi keamanan, database query builder, server-side datatable, template engine EJS, dan UI responsif Bootstrap 5.

---

## 🌟 Fitur Utama

- **🚀 Ultra-Fast Runtime**: Ditenagai oleh [Bun](https://bun.sh) dan framework [Elysia.js](https://elysiajs.com).
- **🧱 Modular HMVC**: Setiap fitur/modul bersifat independen di dalam `src/modules/<nama_modul>/` berisi `Controller`, `Model`, `Routes`, dan `Views`.
- **🔄 Auto-Discovery Routes**: Setiap modul otomatis dimuat oleh aplikasi tanpa perlu mendaftarkan route manual satu per satu di file utama.
- **📊 Datatable & Pagination Server-Side**: Helper generic query builder untuk pagination, pencarian multi-kolom, dan sorting dinamis layaknya DataTables server-side.
- **🛡️ Keamanan & Proteksi Lengkap**:
  - **CSRF Protection**: Token validasi berbasis cookie & form body (mirip CI3 CSRF).
  - **Rate Limiting**: Pencegahan brute-force / flood request per IP.
  - **CORS & Logger**: Middleware response time dan log request berwarna.
  - **JWT Authentication Guard**: Guard middleware untuk proteksi route dan role pengguna.
- **🎨 Modern UI & Alert**:
  - Tema gelap modern dengan **Bootstrap 5**.
  - **SweetAlert2 (Dark Theme)** untuk konfirmasi hapus data dan notifikasi toast aksi CRUD.
  - Mempertahankan posisi nomor halaman, sorting, dan filter setelah melakukan aksi Create/Update/Delete.
- **🗄️ Database Knex.js**: Mendukung MySQL/MariaDB dan SQLite dengan sistem Migration dan Seed bawaan.
- **🧰 CI3-Style Helpers**: Helper familiar seperti `base_url()`, `site_url()`, `redirect()`, `slug()`, `format_date()`, `currency()`, dan `datatableQuery()`.

---

## 📁 Struktur Direktori

```text
bun-elysia-hmvc/
├── src/
│   ├── config/             # Konfigurasi aplikasi, database, knexfile, dan view
│   │   ├── app.ts          # App config (port, baseUrl, debug, timezone)
│   │   ├── database.ts     # Koneksi Knex MySQL / SQLite
│   │   ├── knexfile.ts     # Konfigurasi migration & seed
│   │   └── view.ts         # View renderer helper (EJS)
│   ├── database/           # Migrasi dan Seed database
│   │   ├── migrations/     # File skema tabel
│   │   └── seeds/          # Data dummy pengujian
│   ├── helpers/            # Helper utilitas (CI3-style)
│   │   ├── datatable_helper.ts # Generic server-side datatable query
│   │   ├── url_helper.ts   # base_url, site_url, redirect
│   │   ├── date_helper.ts  # format_date, waktu relatif
│   │   ├── string_helper.ts# slug, truncate, random string
│   │   ├── number_helper.ts# currency, format rupiah
│   │   └── array_helper.ts # pluck, group_by, paginate
│   ├── middleware/         # Middleware aplikasi
│   │   ├── csrf.middleware.ts      # Proteksi CSRF
│   │   ├── auth.middleware.ts      # JWT Auth & Role Guard
│   │   ├── ratelimit.middleware.ts # Rate limiter
│   │   ├── logger.middleware.ts    # Request logger
│   │   └── cors.middleware.ts      # Konfigurasi CORS
│   ├── modules/            # Modul-modul aplikasi (HMVC)
│   │   └── user/           # Contoh modul Pengguna
│   │       ├── user.controller.ts  # Controller aksi CRUD
│   │       ├── user.model.ts       # Model data pengguna & Knex query
│   │       ├── user.routes.ts      # Routing modul user
│   │       └── views/              # View spesifik modul user
│   │           └── index.ejs       # UI Datatable & Modal CRUD
│   ├── views/              # Layout global
│   │   └── layouts/
│   │       └── main.ejs    # Master layout EJS
│   └── index.ts            # Entry point aplikasi
├── public/                 # Aset statis (CSS, JS, Gambar)
├── .env.example            # Template environment variables
├── .gitignore              # Git ignore file
├── package.json            # Daftar dependensi & npm scripts
└── tsconfig.json           # Konfigurasi TypeScript
```

---

## 🚀 Memulai (Quick Start)

### 1. Prasyarat
Pastikan Anda telah menginstal **Bun**:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Kloning & Instal Dependensi
```bash
git clone <repository-url> bun-elysia-hmvc
cd bun-elysia-hmvc
bun install
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Sesuaikan konfigurasi database dan port aplikasi pada `.env`:
```ini
# App
APP_NAME="Bun Elysia HMVC"
APP_ENV=development
APP_PORT=3012
APP_URL=http://localhost:3012
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta

# Database (MySQL / MariaDB)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bun_elysia_hmvc

# JWT
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRES=7d
```

### 4. Menjalankan Database Migration & Seed
Buat database terlebih dahulu di MySQL (misal: `bun_elysia_hmvc`), lalu jalankan:
```bash
# Jalankan migrasi tabel
bun run migrate

# Masukkan data awal (seed)
bun run seed
```

Jika ingin me-reset ulang database dari awal:
```bash
bun run db:fresh
```

### 5. Menjalankan Server Development
```bash
bun run dev
```

Buka browser dan akses:
👉 **[http://localhost:3012](http://localhost:3012)** (otomatis redirect ke `/users`)

---

## 🛠️ Panduan Pengembangan

### Menambahkan Modul Baru (HMVC)

Untuk membuat modul baru (misal: modul `product`):

1. **Buat folder modul**: `src/modules/product/`
2. **Buat file Model (`product.model.ts`)**:
   ```typescript
   import db from '../../config/database';
   import { datatableQuery, type DatatableParams } from '../../helpers';

   export class ProductModel {
       static async getDatatable(params: DatatableParams = {}) {
           return await datatableQuery(db('products'), params, {
               searchableColumns: ['name', 'sku'],
               sortableColumns: ['id', 'name', 'price', 'created_at'],
               defaultSort: 'id',
               defaultOrder: 'desc',
           });
       }
   }
   ```
3. **Buat file Controller (`product.controller.ts`)**:
   ```typescript
   import { ProductModel } from './product.model';
   import { renderModuleView } from '../../config/view';

   export class ProductController {
       static async index({ query, csrfToken }: any) {
           const datatable = await ProductModel.getDatatable(query);
           return renderModuleView('product/views/index', {
               title: 'Manajemen Produk',
               datatable,
               csrfToken,
           });
       }
   }
   ```
4. **Buat file Routes (`product.routes.ts`)**:
   ```typescript
   import { Elysia } from 'elysia';
   import { ProductController } from './product.controller';

   // Suffix nama wajib "Routes" agar di-load otomatis
   export const productRoutes = new Elysia({ prefix: '/products' })
       .get('/', ({ query, csrfToken }: any) => ProductController.index({ query, csrfToken }));
   ```
5. **Buat file View (`src/modules/product/views/index.ejs`)**:
   Gunakan fungsi helper `renderModuleView` untuk merender tampilan modul ke dalam layout utama. Route akan langsung aktif secara otomatis tanpa perlu import manual!

---

## 📜 Perintah yang Tersedia (NPM Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `bun run dev` | Menjalankan server dalam mode watch (hot reload) |
| `bun run start` | Menjalankan server dalam mode produksi |
| `bun run migrate` | Menjalankan file migrasi terbaru |
| `bun run migrate:rollback` | Membatalkan migrasi batch terakhir |
| `bun run migrate:status` | Mengecek status file migrasi |
| `bun run migrate:make <nama>` | Membuat file migrasi baru |
| `bun run seed` | Menjalankan seeder database |
| `bun run seed:make <nama>` | Membuat file seeder baru |
| `bun run db:fresh` | Rollback semua migrasi, jalankan migrasi ulang, dan seed data |

---

## 📄 Lisensi

Proyek ini bersifat open-source di bawah lisensi [MIT](LICENSE).
