import { z } from 'zod';

export interface LikeResponseDto {
  id: number;
  reviewId: number;
  userId: number;
  createdAt: Date | null;
}

// Validasi body POST /likes.
// userId SENGAJA tidak ada: identitas pengguna diambil dari JWT (req.authUser).
export const createLikeSchema = z.object({
  reviewId: z.coerce.number().int().positive(),
});

// Validasi path parameter /likes/:id dan /reviews/:id.
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
