import type { Request, Response } from 'express';
import { LikeService } from '../services/likeService.ts';
import { isUniqueViolation } from '../utils/dbErrors.ts';

export class LikeController {
  constructor(private likeService: LikeService = new LikeService()) {}

  private handleError(res: Response, error: unknown): Response {
    const message = error instanceof Error ? error.message : '';

    if (message === 'LIKE_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Like tidak ditemukan' });
    }
    if (message === 'REVIEW_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Review tidak ditemukan' });
    }
    if (message === 'FORBIDDEN_LIKE_ACCESS') {
      return res.status(403).json({
        status: 'error',
        message: 'Kamu tidak memiliki izin menghapus like ini',
      });
    }
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        status: 'fail',
        message: 'Kamu sudah memberi like pada review ini',
      });
    }

    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  createLike = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.authUser) {
        return res.status(401).json({ status: 'error', message: 'Autentikasi diperlukan' });
      }

      // userId diambil dari JWT, bukan dari body request.
      const { reviewId } = res.locals.validated.body;
      const like = await this.likeService.createLike({
        reviewId,
        userId: req.authUser.userId,
      });
      return res.status(201).json({ status: 'success', data: like });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteLike = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.authUser) {
        return res.status(401).json({ status: 'error', message: 'Autentikasi diperlukan' });
      }

      const { id } = res.locals.validated.params;
      const like = await this.likeService.deleteLike(id, req.authUser.userId, req.authUser.role);
      return res.status(200).json({ status: 'success', data: like });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
