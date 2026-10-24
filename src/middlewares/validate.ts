
import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

// Memvalidasi bagian request sesuai schema yang diberikan.
export function validate(
  schema: ZodType,
  source: 'body' | 'query' | 'params'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Validasi gagal',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    // Simpan hasil validasi yang sudah dibersihkan untuk dipakai controller.
    res.locals.validated = res.locals.validated ?? {};
    res.locals.validated[source] = result.data;

    return next();
  };
}
