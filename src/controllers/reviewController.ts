
import type { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService.ts';

export class ReviewController {
  constructor(private reviewService: ReviewService = new ReviewService()) {}

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'REVIEW_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Review tidak ditemukan',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // GET /reviews — publik, dengan filter stallId opsional
  getReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      const rawStallId = req.query.stallId;
      let stallId: number | undefined;

      // Validasi hanya dilakukan jika stallId dikirim
      if (rawStallId !== undefined) {
        if (
          typeof rawStallId !== 'string' ||
          rawStallId.trim() === ''
        ) {
          return res.status(400).json({
            status: 'fail',
            message: 'stallId harus berupa bilangan bulat positif',
          });
        }

        const parsedStallId = Number(rawStallId);

        if (
          !Number.isInteger(parsedStallId) ||
          parsedStallId <= 0
        ) {
          return res.status(400).json({
            status: 'fail',
            message: 'stallId harus berupa bilangan bulat positif',
          });
        }

        stallId = parsedStallId;
      }

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
      const review = await this.reviewService.createReview(req.body);

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
      const review = await this.reviewService.deleteReview(
        Number(req.params.id),
      );

      return res.status(200).json({
        status: 'success',
        data: review,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
