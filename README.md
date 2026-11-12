# Sistem Review Kantin (Praktikum RSI)

Aplikasi review warung kantin. Repository ini memuat **backend** (Tugas 2 dan 3) dan **frontend** (Tugas 4).

| Bagian | Teknologi |
| --- | --- |
| Frontend (`frontend/`) | React 18, TypeScript, Vite, React Router, **Axios** |
| Backend (`src/`) | Node.js, Express 5, TypeScript (tsx), Drizzle ORM, Zod, JWT (jsonwebtoken), bcryptjs, Swagger |
| Database | Microsoft SQL Server (database `review_kantin`) |

Metode integrasi HTTP frontend: **Axios** (dipakai konsisten untuk seluruh komunikasi dengan backend).

## Struktur repository

```
src/            kode backend (routes, controllers, services, repositories, middlewares, dtos, db)
db/             skrip SQL: 01 login, 02 skema, 03 data awal
frontend/       aplikasi React (Tugas 4)
report/         skrip pembuat laporan PDF
TESTING.md      panduan pengujian manual 12 skenario
.env.example    contoh konfigurasi backend (tanpa nilai rahasia)
```

## Prasyarat

- Node.js 20 atau lebih baru
- Microsoft SQL Server dan SSMS (atau Azure Data Studio)

## Menjalankan backend

1. **Database.** Buka `db/01-create-login-tugas2.sql`, ganti `GANTI_DENGAN_PASSWORD_KUAT` dengan password Anda, lalu jalankan skrip berurutan di SSMS: `db/01-create-login-tugas2.sql`, `db/02-schema.sql`, `db/03-seed-full.sql`. Pastikan database `review_kantin` sudah ada sebelum skrip 01 dijalankan (`CREATE DATABASE review_kantin;`). Jika database sudah dibuat dari skema lama (tabel sudah ada), jalankan juga `db/04-migrasi-cascade.sql` agar relasi data turunan (menu, review, like, flag) memakai `ON DELETE CASCADE`; skrip ini aman dijalankan berulang. Opsional: `db/05-sinkron-rating.sql` menyamakan `avg_rating` dan `review_count` warung dengan tabel review bila data review pernah diubah langsung di SSMS.
2. **Environment.** Salin `.env.example` menjadi `.env` (Windows: `copy .env.example .env`) lalu isi:

   | Variabel | Keterangan |
   | --- | --- |
   | `DB_SERVER`, `DB_PORT`, `DB_NAME` | Alamat SQL Server dan nama database (default sudah sesuai) |
   | `DB_USER`, `DB_PASSWORD` | Login SQL Server dari skrip 01 |
   | `DB_ENCRYPT`, `DB_TRUST_SERVER_CERTIFICATE` | Opsi koneksi (default untuk SQL Server lokal) |
   | `JWT_SECRET` | **Wajib.** String acak panjang untuk menandatangani token |

   File `.env` tidak boleh di-commit. Hanya `.env.example` (tanpa nilai rahasia) yang ada di repository.
3. **Dependensi dan akun uji.**

   ```bash
   npm install
   npm run seed:passwords
   ```

   `db/03-seed-full.sql` aman dijalankan ulang dan aman untuk database lama: hanya baris seed yang belum ada yang ditambahkan (data lama tidak diubah), lalu `avg_rating` dan `review_count` warung disamakan dengan data review. Akun pada data awal memakai hash palsu sehingga tidak bisa login. `npm run seed:passwords` mengganti hash itu dengan hash bcrypt dari password uji `Password123` (ubah lewat `SEED_PASSWORD` di `.env` bila perlu).
4. **Jalankan.**

   ```bash
   npm run dev
   ```

   Backend berjalan di http://localhost:3000. Cek `http://localhost:3000/health` dan dokumentasi API di `http://localhost:3000/docs`.

### Akun uji (setelah `npm run seed:passwords`, password `Password123`)

| Role | Email | Catatan |
| --- | --- | --- |
| admin | `admin@kantin.test` | Boleh tambah, ubah, hapus semua warung |
| owner | `tini@kantin.test` | Pemilik warung id 1 |
| owner | `slamet@kantin.test` | Pemilik warung id 3 |
| customer | `bagas@student.test` | Hanya melihat |

Halaman Registrasi selalu membuat akun berperan **customer** (aturan backend). Akun admin dan owner berasal dari data awal.

## Menjalankan frontend

```bash
cd frontend
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```

Buka http://localhost:5173 (backend harus sudah berjalan).

### Konfigurasi environment frontend (`frontend/.env`)

| Variabel | Fungsi | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL API untuk Axios | `/api/v1` |
| `VITE_PROXY_TARGET` | Alamat backend yang dituju proxy Vite; ubah bila port backend bukan 3000 | `http://localhost:3000` |
| `VITE_PERMISSION_TEST_MODE` | `true` menampilkan tombol Ubah/Hapus untuk semua pengguna login agar respons 403 backend bisa diuji. Biarkan `false` untuk pemakaian normal. | `false` |

**Tentang CORS.** Dengan `VITE_API_BASE_URL=/api/v1`, request dikirim ke server Vite lalu diteruskan (proxy) ke backend sehingga backend tidak perlu CORS. Jika memakai URL penuh (mis. `http://localhost:3000/api/v1`), backend wajib mengaktifkan CORS (`npm install cors`, lalu `app.use(cors({ origin: 'http://localhost:5173' }))` di `src/index.ts`).

## Endpoint yang dipakai frontend

Semua endpoint berada di bawah prefix `/api/v1` (diatur lewat base URL Axios).

| Fitur | Endpoint | Hak akses |
| --- | --- | --- |
| Daftar warung (search, category, page, limit) | `GET /stalls` | Publik |
| Detail warung | `GET /stalls/:id` | Publik |
| Tambah warung | `POST /stalls` | Admin, Owner (pemilik = pengguna yang login) |
| Ubah warung | `PUT /stalls/:id` | Admin; Owner hanya warung miliknya (selain itu 403) |
| Hapus warung | `DELETE /stalls/:id` | Admin (menu, review, like, flag warung itu ikut terhapus dalam satu transaksi) |
| Registrasi | `POST /auth/register` | Publik (role customer) |
| Login | `POST /auth/login` | Publik |
| Info pengguna | `GET /auth/me` | Butuh token |

Logout: JWT bersifat stateless sehingga sesi diakhiri dengan menghapus token di sisi klien.

## Tampilan berdasarkan role

| Role | Yang tampil di frontend |
| --- | --- |
| Public | Daftar dan detail warung, registrasi, login |
| Customer | Daftar dan detail warung (tanpa tombol pengelolaan) |
| Owner | Tambah warung; Ubah hanya pada warung miliknya |
| Admin | Tambah, ubah, dan hapus semua warung |

Backend tetap menjadi penentu akhir hak akses; frontend menampilkan pesan untuk respons 401 dan 403.

## Aturan akses endpoint lain (backend Tugas 3)

Identitas pengguna (`userId`) selalu diambil dari token JWT, bukan dari body request.

| Endpoint | Hak akses |
| --- | --- |
| `GET /reviews?stallId=1` | Publik (filter `stallId` opsional) |
| `POST /stalls/:id/reviews` (`rating`, `comment`) | Sama dengan `POST /reviews` (memakai logika yang sama) |
| `POST /reviews` (`stallId`, `rating`, `comment`) | Semua role yang login; `userId` dari JWT. 404 bila warung tidak ada, 409 bila sudah pernah mereview warung itu |
| `DELETE /reviews/:id` | Admin (likes dan flags review ikut terhapus) |
| `POST /likes` (`reviewId`) | Semua role yang login; `userId` dari JWT. 409 bila sudah pernah like |
| `DELETE /likes/:id` | Admin, atau pemilik like tersebut |
| `POST /audit-logs` (`action`, `targetTable`, `targetId`, `metadata`) | Admin; pelaku (`userId`) dicatat dari JWT admin, bukan dari body |
| `PUT /flags/:id` (`status`: pending, resolved, dismissed) | Admin; `id` dan `status` divalidasi (400 bila tidak valid) |
| `POST /menu-items`, `PUT /menu-items/:id`, `DELETE /menu-items/:id` | Admin untuk semua menu; Owner hanya menu di warung miliknya (selain itu 403) |

Setiap review ditambah atau dihapus, `avgRating` dan `reviewCount` warung dihitung ulang otomatis dalam transaksi yang sama.

## Pengujian dan laporan

- `TESTING.md`: langkah pengujian manual untuk 12 skenario tugas dan bukti yang perlu di-screenshot.
- `report/build_report.py`: membuat laporan PDF `NIM_Nama.pdf` dari screenshot (petunjuk di bagian atas skrip).
