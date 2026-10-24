
import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';

const auditLogRouter = Router();
const auditLogController = new AuditLogController();

// GET /audit-logs — hanya admin yang sudah login
auditLogRouter.get(
  '/',
  authenticate,
  authorize('admin'),
  (req, res) => {
    // #swagger.tags = ['Audit Logs']
    // #swagger.summary = 'Melihat daftar audit log'
    // #swagger.description = 'Hanya admin yang dapat melihat riwayat aktivitas sistem.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.responses[200] = { description: 'Daftar audit log' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat mengakses endpoint ini' }

    return auditLogController.getLogs(req, res);
  }
);

// POST /audit-logs — hanya admin yang sudah login
auditLogRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  (req, res) => {
    // #swagger.tags = ['Audit Logs']
    // #swagger.summary = 'Membuat audit log'
    // #swagger.description = 'Hanya admin yang dapat membuat audit log melalui endpoint ini.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.consumes = ['application/json']
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: { $ref: '#/definitions/AuditLogInput' }
    // }
    // #swagger.responses[201] = { description: 'Audit log berhasil dibuat' }
    // #swagger.responses[400] = { description: 'Data audit log tidak valid' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat mengakses endpoint ini' }

    return auditLogController.createLog(req, res);
  }
);

export { auditLogRouter };
