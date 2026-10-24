
import type { Request, Response } from 'express';
import { StallService } from '../services/stallService.ts';

export class StallController {
  private stallService: StallService;

  constructor(stallService: StallService = new StallService()) {
    this.stallService = stallService;
  }

  private handleError(res: Response, error: unknown): Response {
    const message = error instanceof Error ? error.message : '';

    if (message === 'STALL_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Data warung tidak ditemukan',
      });
    }

    if (message === 'FORBIDDEN_STALL_ACCESS') {
      return res.status(403).json({
        status: 'error',
        message: 'Kamu tidak memiliki izin mengubah warung ini',
      });
    }

    console.error(error);

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  getStalls = async (req: Request, res: Response): Promise<Response> => {
    try {
      const query = res.locals.validated.query;

      const { data, total } = await this.stallService.getAllStalls(query);

      return res.status(200).json({
        status: 'success',
        meta: {
          page: query.page,
          limit: query.limit,
          total,
        },
        data,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getStallById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = res.locals.validated.params;
      const stall = await this.stallService.getStallById(id);

      return res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createStall = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Autentikasi diperlukan',
        });
      }

      const input = res.locals.validated.body;
      const stall = await this.stallService.createStall(
        req.authUser.userId,
        input
      );

      return res.status(201).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateStall = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Autentikasi diperlukan',
        });
      }

      const { id } = res.locals.validated.params;
      const input = res.locals.validated.body;

      const stall = await this.stallService.updateStall(
        id,
        input,
        req.authUser.userId,
        req.authUser.role
      );

      return res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteStall = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = res.locals.validated.params;
      const stall = await this.stallService.deleteStall(id);

      return res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // Membuat review untuk warung
  createReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Autentikasi diperlukan',
        });
      }

      const { id } = res.locals.validated.params;
      const input = res.locals.validated.body;

      const review = await this.stallService.createReview(
        id,
        req.authUser.userId,
        input
      );

      return res.status(201).json({
        status: 'success',
        data: review,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
