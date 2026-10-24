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

import { z } from 'zod';

export const listReviewsSchema = z.object({
  query: z.object({
    stallId: z.coerce.number().int().positive().optional(),
  }),
});