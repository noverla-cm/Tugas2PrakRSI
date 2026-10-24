
import { z } from 'zod';

// Validasi ID warung pada parameter URL, misalnya /stalls/1.
export const stallIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Validasi query untuk pencarian dan pagination.
export const getStallsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Validasi data saat membuat warung.
export const createStallSchema = z.object({
  name: z.string().trim().min(3).max(100),
  category: z.string().trim().max(50).optional(),
  location: z.string().trim().max(100).optional(),
  description: z.string().trim().max(1000).optional(),
});

// Validasi data saat memperbarui warung.
// Semua field dibuat opsional sesuai ketentuan PUT parsial tugas.
export const updateStallSchema = createStallSchema.partial();

// Validasi data saat membuat review warung.
export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});
