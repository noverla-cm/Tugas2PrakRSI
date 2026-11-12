import { z } from 'zod';

export interface FlagResponseDto {
  id: number;
  reviewId: number;
  reportedBy: number;
  reason: string | null;
  status: string;
  createdAt: Date | null;
}

export const FLAG_STATUSES = ['pending', 'resolved', 'dismissed'] as const;

// Validasi path parameter PUT /flags/:id.
export const flagIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Validasi body PUT /flags/:id. Status harus salah satu dari nilai yang diizinkan database.
export const updateFlagStatusSchema = z.object({
  status: z.enum(FLAG_STATUSES, {
    error: 'Status harus salah satu dari: pending, resolved, dismissed',
  }),
});
