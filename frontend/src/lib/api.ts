import axios from 'axios';

const TOKEN_KEY = 'kantin_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Satu-satunya instance Axios; base URL diatur lewat VITE_API_BASE_URL.
 * Default '/api/v1' diteruskan Vite (proxy) ke backend, sehingga tidak butuh CORS saat development.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Sisipkan JWT ke setiap request (Authorization: Bearer <token>)
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 pada sesi yang sedang aktif => token tidak berlaku lagi
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Error seragam untuk seluruh UI. */
export class ApiError extends Error {
  status?: number;
  fieldErrors: Record<string, string>;
  constructor(message: string, status?: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function parseFieldErrors(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === 'object') {
        const it = item as { field?: string; path?: string | string[]; message?: string };
        const key = it.field ?? (Array.isArray(it.path) ? it.path.join('.') : it.path);
        if (key && it.message) out[key] = it.message;
      }
    }
  } else if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
  }
  return out;
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (axios.isAxiosError(e)) {
    if (!e.response) {
      return new ApiError(
        e.code === 'ECONNABORTED'
          ? 'Server terlalu lama merespons. Coba lagi.'
          : 'Tidak dapat terhubung ke server. Pastikan backend berjalan (dan CORS aktif bila memakai URL penuh).',
      );
    }
    const { status, data } = e.response;
    const body = (data ?? {}) as { message?: unknown; error?: unknown; errors?: unknown; details?: unknown; issues?: unknown };
    const fallback =
      status === 401 ? 'Anda belum login atau sesi sudah berakhir.'
      : status === 403 ? 'Anda tidak memiliki izin untuk melakukan aksi ini.'
      : status === 404 ? 'Data tidak ditemukan.'
      : status >= 500 ? 'Terjadi kesalahan pada server.'
      : 'Permintaan tidak valid.';
    const message =
      typeof body.message === 'string' && body.message ? body.message
      : typeof body.error === 'string' && body.error ? body.error
      : fallback;
    return new ApiError(message, status, parseFieldErrors(body.errors ?? body.details ?? body.issues));
  }
  return new ApiError(e instanceof Error ? e.message : 'Terjadi kesalahan tak terduga.');
}
