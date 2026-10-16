# Panduan Agent untuk Bun Elysia HMVC

Dokumen ini adalah panduan kerja untuk agent dan kontributor. Ikuti pola yang sudah dipakai proyek, jaga perubahan tetap fokus, dan jangan mengubah perilaku yang tidak diminta.

## Tujuan proyek

- Backend menggunakan Bun, TypeScript, Elysia, dan Knex.
- Arsitektur HMVC: fitur berada di `src/modules/<module>/` dan modul mengelola route, controller, model, serta view miliknya.
- Web dirender di server memakai EJS. Aset publik dan tema admin berada di `public/`.
- Web dan API adalah dua antarmuka terpisah: web umumnya menggunakan cookie/sesi dan HTML, API menggunakan JSON dan Bearer JWT.

## Peta kode

| Lokasi | Tanggung jawab |
| --- | --- |
| `src/index.ts` | Bootstrap Elysia, middleware global, error handler, dan auto-discovery route |
| `src/config/` | Konfigurasi aplikasi, koneksi Knex, dan renderer EJS |
| `src/modules/<module>/*.routes.ts` | Definisi route modul. File `*.routes.ts` ditemukan otomatis oleh bootstrap |
| `src/modules/<module>/*.controller.ts` | Menghubungkan input route ke model dan memilih response/view |
| `src/modules/<module>/*.model.ts` | Query dan perubahan data melalui Knex |
| `src/modules/<module>/views/*.ejs` | Markup khusus modul |
| `src/views/layouts/main.ejs` | Layout HTML global dan navigasi aplikasi |
| `src/middleware/` | Auth, CSRF, CORS, rate limit, dan logging |
| `src/helpers/` | Fungsi utilitas lintas modul |
| `src/database/migrations/`, `src/database/seeds/` | Skema database dan data awal |
| `public/spark-admin/` | Template Spark Admin dan aset statisnya |

## Alur request

### Halaman web

1. Route di `src/modules/<module>/<module>.routes.ts` menerima request.
2. Route meneruskan data yang diperlukan ke controller.
3. Controller memanggil model untuk operasi database.
4. Untuk HTML, controller memanggil `renderModuleView('<module>/views/<view>', data)`.
5. `src/config/view.ts` merender view modul lalu menyisipkannya ke `src/views/layouts/main.ejs`.

Pertahankan kontrak data yang dikirim controller ke view. Untuk layout web, kirim `currentUser` dan `activeNav` bila halaman memerlukannya. Hindari query database atau aturan bisnis di file EJS.

### API

- Route API ditempatkan di file `*.api.routes.ts`, dengan prefix `/api/...`.
- Gunakan controller API dan `ApiResponse` dari `src/helpers/response_helper.ts` untuk format response yang konsisten.
- Jangan merender EJS dari route API.
- Bila endpoint memerlukan autentikasi, gunakan `authMiddleware` dan guard `requireApiAuth` sesuai pola di modul auth/user.

## Menambah atau mengubah modul

- Ikuti contoh modul `user` atau `auth`; jangan membuat struktur alternatif tanpa alasan kuat.
- Nama file route harus berakhiran `.routes.ts` agar auto-discovery menemukannya.
- Gunakan validasi schema Elysia (`t.Object`, `t.String`, dan constraints) untuk body request.
- Route tipis: delegasikan keputusan dan operasi ke controller/model.
- Model menjadi satu-satunya lapisan modul yang menyusun query Knex. Jangan membangun nama kolom sort langsung dari input pengguna; batasi ke allowlist.
- Gunakan migration baru untuk perubahan skema. Jangan mengedit migration yang sudah mungkin digunakan, kecuali diminta secara eksplisit.
- Untuk daftar besar, gunakan pagination/filter server-side melalui helper yang ada jika sesuai.

## Database dan konfigurasi

- Akses database runtime lewat `src/config/database.ts`.
- Konfigurasi runtime berasal dari `Bun.env`; contoh variabel tersedia di `.env.example`.
- Knex CLI membaca konfigurasi melalui `src/config/knexfile.ts`.
- Jangan menaruh kredensial, token, atau data sensitif di source control. Jangan membaca atau menyalin nilai rahasia dari `.env` ke jawaban.
- Jangan menjalankan `db:fresh`, rollback, atau operasi data destruktif kecuali pengguna meminta dengan jelas.

## Keamanan

- Jangan menonaktifkan auth, CSRF, rate limit, atau validasi untuk membuat perubahan UI/fitur tampak bekerja.
- Semua form web yang mengubah data harus menyertakan `csrf_token` bila token tersedia; nama field harus sesuai middleware.
- Endpoint mutasi API harus memakai schema request dan guard auth bila datanya terlindungi.
- Jangan menyimpan password plaintext. Ikuti pola `Bun.password` yang sudah dipakai autentikasi.
- Escape output EJS dengan `<%= value %>`. Gunakan `<%- value %>` hanya untuk markup tepercaya yang memang perlu dirender sebagai HTML, seperti `body` layout.
- Hindari membentuk HTML response dari input pengguna.
- Validasi ID, filter, pagination, serta nilai yang memengaruhi query; gunakan parameter Knex dan allowlist.

## UI, EJS, dan aset

- Tema Spark Admin tersedia di `public/spark-admin/assets/`. Rujuk aset lewat URL `/public/spark-admin/...` karena static plugin dipasang dengan prefix `/public`.
- Pertahankan pola visual Spark Admin dari `public/spark-admin/index.html` dan komponen terkait. Jangan menyalin seluruh halaman demo ke aplikasi; sesuaikan markup dengan route dan data aplikasi.
- Bootstrap dan Bootstrap Icons versi lokal tersedia di dalam folder aset Spark Admin. Hindari menambahkan CDN atau salinan dependensi kedua tanpa kebutuhan.
- Saat mengubah view, pertahankan nama field form, URL action, atribut yang dipakai JavaScript, ID modal, dan query string yang menjadi bagian dari alur CRUD.
- Gunakan EJS untuk data, CSS kelas/utilitas untuk presentasi, dan JS untuk interaksi browser. Jangan memindahkan aturan bisnis ke sisi browser.
- Periksa tampilan desktop dan mobile secara konseptual, terutama sidebar, tabel responsif, modal, dan form.

## Gaya TypeScript

- Ikuti gaya import dan format yang sudah ada pada file terkait.
- Gunakan tipe eksplisit untuk kontrak baru jika memungkinkan. Hindari memperluas penggunaan `any`; bila pola lama memakai `any`, jangan menjadikannya alasan untuk melemahkan tipe di kode baru.
- Gunakan alias `@/` hanya jika konsisten dengan konfigurasi TypeScript dan konteks file; import relatif yang sudah digunakan juga valid.
- Jangan menambahkan dependency baru untuk fungsi yang bisa ditangani kemampuan Bun/Elysia/Knex yang sudah tersedia.

## Alur kerja agent

1. Baca file terkait dan ikuti alur nyata dari route sampai model/view sebelum mengedit.
2. Periksa `git status` terlebih dahulu. Jangan menghapus atau menimpa perubahan pengguna yang sudah ada.
3. Buat perubahan terkecil yang menyelesaikan permintaan. Hindari refactor tidak terkait.
4. Bila perlu, perbarui dokumentasi agar cocok dengan implementasi aktual.
5. Jalankan pemeriksaan yang relevan dan aman. Jangan menjalankan migrasi, seed, atau reset data sebagai bagian dari pemeriksaan rutin.
6. Laporkan file yang diubah, pemeriksaan yang dijalankan, dan hal yang belum diverifikasi. Jangan mengklaim test berhasil jika tidak dijalankan.

## Perintah proyek

- `bun run dev` — server development dengan watch.
- `bun run start` — menjalankan aplikasi.
- `bun run migrate` — menerapkan migration database.
- `bun run migrate:status` — memeriksa status migration.
- `bun run seed` — memasukkan data seed.
- `bun run db:fresh` — menghapus/membangun ulang data lewat rollback, migration, dan seed; destruktif.

Tidak ada script test atau lint yang didefinisikan saat panduan ini dibuat. Jangan mengasumsikan perintah tersebut tersedia.
