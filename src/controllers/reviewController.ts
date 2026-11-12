
import type { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService.ts';
import { isUniqueViolation } from '../utils/dbErrors.ts';

export class ReviewController {
  constructor(private reviewService: ReviewService = new ReviewService()) {}

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'REVIEW_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Review tidak ditemukan',
      });
    }

    if (error instanceof Error && error.message === 'STALL_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Data warung tidak ditemukan',
      });
    }

    if (isUniqueViolation(error)) {
      return res.status(409).json({
        status: 'fail',
        message: 'Kamu sudah pernah mereview warung ini',
      });
    }

    console.error(error);

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  // GET /reviews — publik, dengan filter stallId opsional
  // Query sudah divalidasi oleh middleware validate(listReviewsSchema, 'query').
  getReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { stallId } = res.locals.validated.query as { stallId?: number };

      const reviews = await this.reviewService.getAllReviews(stallId);

      return res.status(200).json({
        status: 'success',
        data: reviews,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // POST /reviews — pengguna yang sudah login
  createReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Autentikasi diperlukan',
        });
      }

      // userId diambil dari JWT, bukan dari body request.
      const { stallId, rating, comment } = res.locals.validated.body;

      const review = await this.reviewService.createReview({
        stallId,
        rating,
        comment: comment ?? null,
        userId: req.authUser.userId,
      });

      return res.status(201).json({
        status: 'success',
        data: review,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // DELETE /reviews/:id — admin
  deleteReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = res.locals.validated.params;
      const review = await this.reviewService.deleteReview(id);

      return res.status(200).json({
        status: 'success',
        data: review,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
