import { z } from 'zod';

export interface ReviewResponseDto {
  id: number;
  stallId: number;
  userId: number;
  rating: number;
  comment: string | null;
  likeCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  userName?: string | null;
}

// Validasi query GET /reviews?stallId=1.
// Middleware validate() memvalidasi req.query secara langsung,
// jadi schema langsung berisi field query (tanpa pembungkus "query").
export const listReviewsSchema = z.object({
  stallId: z.coerce.number().int().positive().optional(),
});

// Validasi body POST /reviews.
// userId SENGAJA tidak ada: identitas pengguna diambil dari JWT (req.authUser).
export const createReviewBodySchema = z.object({
  stallId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).nullish(),
});
