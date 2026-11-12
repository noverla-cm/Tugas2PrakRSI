import { api, toApiError } from '../lib/api';
import type { Stall, StallInput, StallPage, StallQuery } from '../lib/types';

// Backend Tugas 2 belum tentu menyertakan rating; null berarti "tidak tersedia" (UI menyembunyikannya).
const toNum = (v: unknown): number | null => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

export function normalizeStall(r: any): Stall {
  return {
    id: Number(r.id),
    ownerId: Number(r.ownerId ?? r.owner_id ?? 0),
    name: String(r.name ?? ''),
    category: r.category ?? null,
    location: r.location ?? null,
    description: r.description ?? null,
    avgRating: toNum(r.avgRating ?? r.avg_rating ?? r.averageRating),
    reviewCount: toNum(r.reviewCount ?? r.review_count),
    createdAt: r.createdAt ?? r.created_at,
  };
}

// ownerId TIDAK dikirim: backend mengambilnya dari token JWT pengguna yang login.
// Create: field kosong dihilangkan. Update (PUT parsial): string kosong dikirim agar field bisa dikosongkan.
function toPayload(input: StallInput, mode: 'create' | 'update') {
  const val = (v: string) => (mode === 'update' ? v.trim() : v.trim() === '' ? undefined : v.trim());
  return {
    name: input.name.trim(),
    category: val(input.category),
    location: val(input.location),
    description: val(input.description),
  };
}

export const stallService = {
  async list(q: StallQuery): Promise<StallPage> {
    try {
      const params: Record<string, string | number> = { page: q.page, limit: q.limit };
      if (q.search) params.search = q.search;
      if (q.category) params.category = q.category;
      const { data } = await api.get('/stalls', { params });
      const rows: any[] = Array.isArray(data?.data) ? data.data : [];
      return {
        items: rows.map(normalizeStall),
        total: Number(data?.meta?.total ?? rows.length),
        page: Number(data?.meta?.page ?? q.page),
        limit: Number(data?.meta?.limit ?? q.limit),
      };
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<Stall> {
    try {
      const { data } = await api.get(`/stalls/${id}`);
      return normalizeStall(data?.data ?? data);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(input: StallInput): Promise<Stall> {
    try {
      const { data } = await api.post('/stalls', toPayload(input, 'create'));
      return normalizeStall(data?.data ?? data);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, input: StallInput): Promise<Stall> {
    try {
      const { data } = await api.put(`/stalls/${id}`, toPayload(input, 'update'));
      return normalizeStall(data?.data ?? data);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`/stalls/${id}`);
    } catch (e) {
      throw toApiError(e);
    }
  },
};
