# Frontend Kantin Review

React 18 + TypeScript + Vite, komunikasi HTTP memakai **Axios**.
Petunjuk instalasi, konfigurasi `.env`, dan cara menjalankan ada di [README utama](../README.md).

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:5173 (backend harus berjalan)
npm run build            # pengecekan tipe + build produksi
```

Struktur: `src/lib/api.ts` (instance Axios, interceptor JWT dan 401, ApiError), `src/services/` (semua pemanggilan HTTP), `src/context/AuthContext.tsx` (sesi dan hak akses role), `src/components/`, `src/pages/`.
