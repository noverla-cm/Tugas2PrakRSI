
import { Router } from 'express';
import { StallController } from '../controllers/stallController.ts';
import { validate } from '../middlewares/validate.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';
import {
  stallIdSchema,
  getStallsQuerySchema,
  createStallSchema,
  updateStallSchema,
  createReviewSchema,
} from '../dtos/stallSchema.ts';

const stallRouter = Router();
const stallController = new StallController();

// GET /stalls — publik, pencarian dan pagination
stallRouter.get(
  '/',
  validate(getStallsQuerySchema, 'query'),
  (req, res) => {
    
  // #swagger.tags = ['Stalls']
  // #swagger.summary = 'Melihat daftar warung'
  // #swagger.description = 'Melihat daftar warung dengan pencarian, kategori, dan pagination.'

  // #swagger.parameters['search'] = {
  //   in: 'query',
  //   description: 'Kata kunci pencarian nama warung',
  //   required: false,
  //   type: 'string'
  // }

  // #swagger.parameters['category'] = {
  //   in: 'query',
  //   description: 'Filter berdasarkan kategori warung',
  //   required: false,
  //   type: 'string'
  // }

  // #swagger.parameters['page'] = {
  //   in: 'query',
  //   description: 'Nomor halaman, minimal 1',
  //   required: false,
  //   type: 'integer',
  //   example: 1
  // }

  // #swagger.parameters['limit'] = {
  //   in: 'query',
  //   description: 'Jumlah data per halaman, minimal 1 dan maksimal 100',
  //   required: false,
  //   type: 'integer',
  //   example: 10
  // }

  // #swagger.responses[200] = {
  //   description: 'Daftar warung berhasil diambil'
  // }

  // #swagger.responses[400] = {
  //   description: 'Parameter query tidak valid'
  // }

    return stallController.getStalls(req, res);
  }
);

// GET /stalls/:id — publik
stallRouter.get(
  '/:id',
  validate(stallIdSchema, 'params'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.summary = 'Melihat detail warung'
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.responses[200] = { description: 'Detail warung' }
    // #swagger.responses[400] = { description: 'ID warung tidak valid' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }

    return stallController.getStallById(req, res);
  }
);



stallRouter.post(
  '/',
  authenticate,
  authorize('admin', 'owner'),
  validate(createStallSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.summary = 'Membuat warung baru'
    // #swagger.description = 'Hanya admin dan owner yang dapat membuat warung.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.consumes = ['application/json']
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: { $ref: '#/definitions/StallInput' }
    // }
    // #swagger.responses[201] = { description: 'Warung dibuat' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Role tidak memiliki izin' }

    return stallController.createStall(req, res);
  }
);



// POST /stalls/:id/reviews — membuat review
stallRouter.post(
  '/:id/reviews',
  authenticate,
  validate(stallIdSchema, 'params'),
  validate(createReviewSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.summary = 'Membuat review untuk warung'
    // #swagger.description = 'Pengguna yang sudah login dapat memberikan rating dan komentar untuk warung.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.consumes = ['application/json']
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: {
    //     type: 'object',
    //     required: ['rating'],
    //     properties: {
    //       rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
    //       comment: { type: 'string', example: 'Makanan enak dan pelayanan ramah.' }
    //     }
    //   }
    // }
    // #swagger.responses[201] = { description: 'Review berhasil dibuat' }
    // #swagger.responses[400] = { description: 'Data review tidak valid' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }

    return stallController.createReview(req, res);
  }
);

// PUT /stalls/:id — admin atau owner yang berwenang
stallRouter.put(
  '/:id',
  authenticate,
  authorize('admin', 'owner'),
  validate(stallIdSchema, 'params'),
  validate(updateStallSchema, 'body'),
  (req, res) => {
    
    // #swagger.tags = ['Stalls']
    // #swagger.summary = 'Mengubah data warung'
    // #swagger.description = 'Mengubah data warung berdasarkan ID.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'string',
    //   description: 'ID warung yang akan diubah'
    // }
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       name: { type: 'string', example: 'Diubah owner2' }
    //     },
    //     required: ['name']
    //   }
    // }
    // #swagger.responses[200] = { description: 'Warung berhasil diubah' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Role tidak memiliki izin' }


    return stallController.updateStall(req, res);
  }
);

// DELETE /stalls/:id — khusus admin yang login
stallRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(stallIdSchema, 'params'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.summary = 'Menghapus warung'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.responses[200] = { description: 'Warung dihapus' }
    // #swagger.responses[400] = { description: 'ID warung tidak valid' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat menghapus warung' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }

    return stallController.deleteStall(req, res);
  }
);

export { stallRouter };
