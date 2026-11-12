# Panduan Pengujian Manual (12 skenario Tugas 4)

Siapkan: backend + SQL Server berjalan, frontend berjalan (`npm run dev`), SSMS terbuka, DevTools browser (tab **Network**) terbuka.
Siapkan akun uji: jalankan `npm run seed:passwords` di folder backend (lihat README), lalu pakai akun berikut dengan password `Password123`:
admin `admin@kantin.test`; Owner A `tini@kantin.test` (pemilik warung id 1); Owner B `slamet@kantin.test` (pemilik warung id 3); customer `bagas@student.test`.
Akun baru dari halaman Registrasi selalu berperan customer. Untuk skenario 7, daftar akun baru lalu login (password minimal 8 karakter).

Simpan screenshot di `report/screenshots/` dengan nama sesuai kolom **Bukti** (mis. `A01.png`), lalu isi `HASIL_UJI` dan `KELAS` di `report/build_report.py`.

| No | Skenario | Langkah | Hasil yang diharapkan | Bukti |
| --- | --- | --- | --- | --- |
| 1 | Daftar warung dari backend | Buka `/` tanpa login | Kartu warung tampil; Network: `GET /api/v1/stalls` 200 | A01, B01 |
| 2 | Detail warung | Klik satu warung | Detail tampil; `GET /api/v1/stalls/:id` 200 | A02, B02 |
| 3 | Admin tambah, ubah, hapus | Login admin; Tambah warung; Ubah; Hapus | 201, 200, 200; data berubah di UI | A03-A07, A11, B03-B05 |
| 4 | Owner buat dan ubah warung sendiri | Login Owner A; Tambah; Ubah warung milik sendiri | 201 dan 200 | A12, B03, B04 |
| 5 | Owner tidak bisa ubah warung owner lain | Aktifkan `VITE_PERMISSION_TEST_MODE=true`, restart `npm run dev`; login Owner A (Tini); ubah warung id 3 milik Owner B (Slamet) | Backend membalas 403; UI menampilkan pesan | B07 |
| 6 | Owner tidak bisa hapus | Mode uji aktif; Owner A klik Hapus pada warung mana pun | 403 (backend hanya mengizinkan admin menghapus) | B08 |
| 7 | Registrasi dan login | Daftar akun baru lalu login | Register 201, login 200, token tersimpan | A08, A09, B06 |
| 8 | `GET /auth/me` | Buka `/profile` | Nama, email, role tampil; request `me` 200 | A10, B06 |
| 9 | Akses tanpa login | Logout, buka `/stalls/new` | Dialihkan ke `/login`; request tanpa token ke endpoint terlindungi membalas 401 | B09 |
| 10 | Penanganan 401 dan 403 | Ubah/hapus tanpa token valid (hapus token di DevTools > Application > Local Storage lalu aksi) dan kasus 5-6 | 401: sesi berakhir, diminta login; 403: pesan penolakan | B07-B09 |
| 11 | Loading, empty, error state | Throttle "Slow 3G"; cari kata acak; matikan backend lalu muat ulang | Spinner, "Tidak ada warung yang cocok", pesan gagal + tombol Coba lagi | A14-A16 |
| 12 | Tersimpan di database | Jalankan `SELECT * FROM dbo.STALLS ORDER BY id DESC` sebelum dan sesudah operasi | Baris bertambah, berubah, atau hilang sesuai operasi | B10 |

Tampilan per role (A11-A13): ambil screenshot daftar warung saat login sebagai Admin, Owner, lalu Customer dan Public (belum login).

Catatan: ubah `VITE_PERMISSION_TEST_MODE` kembali ke `false` setelah pengujian skenario 5, 6, dan 10.
