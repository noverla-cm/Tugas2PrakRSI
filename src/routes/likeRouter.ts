
import { Router } from 'express';
import { LikeController } from '../controllers/likeController.ts';
import { authenticate } from '../middlewares/auth.ts';

const likeRouter = Router();
const likeController = new LikeController();

// POST /likes — semua role yang sudah login dapat membuat like
likeRouter.post(
  '/',
  authenticate,
  (req, res) => {
    // #swagger.tags = ['Likes']
    // #swagger.summary = 'Membuat like'
    // #swagger.description = 'Semua pengguna yang sudah login dapat memberikan like.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.consumes = ['application/json']
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: { $ref: '#/definitions/LikeInput' }
    // }
    // #swagger.responses[201] = { description: 'Like dibuat' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[400] = { description: 'Data like tidak valid' }

    return likeController.createLike(req, res);
  }
);

// DELETE /likes/:id — semua role yang sudah login
likeRouter.delete(
  '/:id',
  authenticate,
  (req, res) => {
    // #swagger.tags = ['Likes']
    // #swagger.summary = 'Menghapus like'
    // #swagger.description = 'Pengguna yang sudah login dapat meminta penghapusan like.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.responses[200] = { description: 'Like berhasil dihapus' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[404] = { description: 'Like tidak ditemukan' }

    return likeController.deleteLike(req, res);
  }
);

export { likeRouter };
