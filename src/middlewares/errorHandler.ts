
import type { Request, Response, NextFunction } from 'express';

// Format error yang digunakan bersama oleh endpoint API.
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);

  // Jika respons sudah mulai dikirim, teruskan error ke Express.
  if (res.headersSent) {
    return next(error);
  }

  // Error validasi Zod akan ditangani di middleware validasi.
  // Di sini kita menangani error umum yang belum ditangani.
  const message =
    error instanceof Error
      ? error.message
      : 'Terjadi kesalahan pada server';

  return res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan internal pada server',
    detail: message
  });
}
