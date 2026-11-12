import type { Request, Response } from 'express';
import { FlagService } from '../services/flagService.ts';

export class FlagController {
  constructor(private flagService: FlagService = new FlagService()) {}

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'FLAG_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Flag tidak ditemukan' });
    }
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  getFlags = async (req: Request, res: Response): Promise<Response> => {
    try {
      const flags = await this.flagService.getAllFlags();
      return res.status(200).json({ status: 'success', data: flags });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateFlagStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      // id dan status sudah divalidasi oleh middleware validate() di router.
      const { id } = res.locals.validated.params;
      const { status } = res.locals.validated.body;
      const flag = await this.flagService.updateFlagStatus(id, status);
      return res.status(200).json({ status: 'success', data: flag });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
