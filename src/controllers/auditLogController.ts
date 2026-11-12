import type { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLogService.ts';

export class AuditLogController {
  constructor(private auditLogService: AuditLogService = new AuditLogService()) {}

  // Detail error hanya dicatat di log server; respons API tidak membocorkan informasi internal.
  private handleError(res: Response, error: unknown): Response {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  getLogs = async (req: Request, res: Response): Promise<Response> => {
    try {
      const logs = await this.auditLogService.getAllLogs();
      return res.status(200).json({ status: 'success', data: logs });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createLog = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Autentikasi diperlukan',
        });
      }

      // userId pelaku diambil dari JWT, bukan dari body request.
      const { action, targetTable, targetId, metadata } = res.locals.validated.body;

      const log = await this.auditLogService.createLog({
        userId: req.authUser.userId,
        action,
        targetTable,
        targetId,
        metadata: metadata ?? null,
      });
      return res.status(201).json({ status: 'success', data: log });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
