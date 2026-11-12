import { z } from 'zod';

export interface AuditLogResponseDto {
  id: number;
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: string | null;
  createdAt: Date | null;
}

// Validasi body POST /audit-logs.
// userId SENGAJA tidak ada: pelaku dicatat dari JWT admin yang sedang login (req.authUser).
export const createAuditLogSchema = z.object({
  action: z.string().trim().min(1).max(50),
  targetTable: z.string().trim().min(1).max(50),
  targetId: z.coerce.number().int().positive(),
  metadata: z.string().max(5000).nullish(),
});
