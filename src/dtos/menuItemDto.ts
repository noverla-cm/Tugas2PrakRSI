import { z } from 'zod';

export interface MenuItemResponseDto {
  id: number;
  stallId: number;
  name: string;
  price: number;
  isAvailable: boolean;
  stallName?: string | null;
}

// Validasi path parameter /menu-items/:id.
export const menuItemIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Validasi body POST /menu-items.
export const createMenuItemSchema = z.object({
  stallId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  price: z.coerce.number().int().min(0),
  isAvailable: z.boolean().optional(),
});

// Validasi body PUT /menu-items/:id (parsial).
export const updateMenuItemSchema = createMenuItemSchema.partial();
