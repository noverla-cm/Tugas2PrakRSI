
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

  // Detail error (pesan, stack, info database) hanya dicatat di log server di atas
  // dan tidak pernah dikirim ke klien.
  return res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan internal pada server',
  });
}
