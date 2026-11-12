
import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';
import { validate } from '../middlewares/validate.ts';
import { listReviewsSchema, createReviewBodySchema } from '../dtos/reviewDto.ts';
import { idParamSchema } from '../dtos/likeDto.ts';

const reviewRouter = Router();
const reviewController = new ReviewController();

// GET /reviews — publik, tidak perlu login
reviewRouter.get(
  '/',
  validate(listReviewsSchema, 'query'),
  (req, res) => {
    // #swagger.tags = ['Reviews']
    // #swagger.summary = 'Melihat daftar review'
    // #swagger.description = 'Publik dapat melihat daftar review, termasuk nama pengguna.'
    // #swagger.parameters['stallId'] = {
    //   in: 'query',
    //   name: 'stallId',
    //   type: 'integer',
    //   required: false,
    //   description: 'Filter review berdasarkan ID kantin'
    // }
    // #swagger.responses[200] = {
    //   description: 'Daftar review berhasil diambil'
    // }
    // #swagger.responses[400] = {
    //   description: 'Parameter stallId tidak valid'
    // }

    return reviewController.getReviews(req, res);
  }
);

// POST /reviews — semua role yang sudah login
reviewRouter.post(
  '/',
  authenticate,
  validate(createReviewBodySchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Reviews']
    // #swagger.summary = 'Membuat review'
    // #swagger.description = 'Semua pengguna yang sudah login dapat membuat review. Identitas pengguna diambil dari token JWT.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.consumes = ['application/json']
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: { $ref: '#/definitions/ReviewInput' }
    // }
    // #swagger.responses[201] = { description: 'Review dibuat' }
    // #swagger.responses[400] = { description: 'Data review tidak valid' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }
    // #swagger.responses[409] = { description: 'Pengguna sudah mereview warung ini' }

    return reviewController.createReview(req, res);
  }
);

// DELETE /reviews/:id — hanya admin yang login
reviewRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(idParamSchema, 'params'),
  (req, res) => {
    // #swagger.tags = ['Reviews']
    // #swagger.summary = 'Menghapus review'
    // #swagger.description = 'Hanya admin yang dapat menghapus review.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.responses[200] = { description: 'Review berhasil dihapus' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat menghapus review' }
    // #swagger.responses[404] = { description: 'Review tidak ditemukan' }

    return reviewController.deleteReview(req, res);
  }
);

export { reviewRouter };
