
import { Router } from 'express';
import { FlagController } from '../controllers/flagController.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';
import { validate } from '../middlewares/validate.ts';
import { flagIdSchema, updateFlagStatusSchema } from '../dtos/flagDto.ts';

const flagRouter = Router();
const flagController = new FlagController();

// GET /flags — hanya admin yang sudah login
flagRouter.get(
  '/',
  authenticate,
  authorize('admin'),
  (req, res) => {
    // #swagger.tags = ['Flags']
    // #swagger.summary = 'Melihat daftar flag'
    // #swagger.description = 'Hanya admin yang dapat melihat daftar flag.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.responses[200] = { description: 'Daftar flag' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat mengakses endpoint ini' }

    return flagController.getFlags(req, res);
  }
);

// PUT /flags/:id — hanya admin yang sudah login
flagRouter.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(flagIdSchema, 'params'),
  validate(updateFlagStatusSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Flags']
    // #swagger.summary = 'Memperbarui status flag'
    // #swagger.description = 'Hanya admin yang dapat memperbarui status flag.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: { $ref: '#/definitions/FlagStatusInput' }
    // }
    // #swagger.responses[200] = { description: 'Status flag ter-update' }
    // #swagger.responses[400] = { description: 'ID atau status tidak valid' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat mengakses endpoint ini' }
    // #swagger.responses[404] = { description: 'Flag tidak ditemukan' }

    return flagController.updateFlagStatus(req, res);
  }
);

export { flagRouter };
