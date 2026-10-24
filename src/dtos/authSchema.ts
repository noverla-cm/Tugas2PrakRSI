
import { z } from 'zod';

// Validasi data untuk registrasi pengguna
export const registerSchema = z.object({
  name: z.string().trim().min(3).max(100),

  email: z.string()
    .trim()
    .toLowerCase()
    .email('Format email tidak valid')
    .max(150),

  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password maksimal 72 karakter'),
});

// Validasi data untuk login
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Format email tidak valid')
    .max(150),

  password: z.string()
    .min(1, 'Password wajib diisi'),
});
