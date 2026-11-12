
import { Router } from 'express';
import { LikeController } from '../controllers/likeController.ts';
import { authenticate } from '../middlewares/auth.ts';
import { validate } from '../middlewares/validate.ts';
import { createLikeSchema, idParamSchema } from '../dtos/likeDto.ts';

const likeRouter = Router();
const likeController = new LikeController();

// POST /likes — semua role yang sudah login dapat membuat like
likeRouter.post(
  '/',
  authenticate,
  validate(createLikeSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Likes']
    // #swagger.summary = 'Membuat like'
    // #swagger.description = 'Semua pengguna yang sudah login dapat memberikan like. Identitas pengguna diambil dari token JWT.'
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
    // #swagger.responses[404] = { description: 'Review tidak ditemukan' }
    // #swagger.responses[409] = { description: 'Pengguna sudah memberi like pada review ini' }

    return likeController.createLike(req, res);
  }
);

// DELETE /likes/:id — semua role yang sudah login
likeRouter.delete(
  '/:id',
  authenticate,
  validate(idParamSchema, 'params'),
  (req, res) => {
    // #swagger.tags = ['Likes']
    // #swagger.summary = 'Menghapus like'
    // #swagger.description = 'Admin dapat menghapus like apa pun; pengguna lain hanya like miliknya sendiri.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.responses[200] = { description: 'Like berhasil dihapus' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Bukan like milik pengguna ini' }
    // #swagger.responses[404] = { description: 'Like tidak ditemukan' }

    return likeController.deleteLike(req, res);
  }
);

export { likeRouter };
