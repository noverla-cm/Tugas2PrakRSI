
import { Router } from 'express';
import { UserController } from '../controllers/userController.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';

const userRouter = Router();
const userController = new UserController();

// GET /users — hanya admin yang login
userRouter.get(
  '/',
  authenticate,
  authorize('admin'),
  (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Melihat daftar pengguna'
    // #swagger.description = 'Hanya admin yang dapat melihat daftar pengguna.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.responses[200] = { description: 'Daftar user' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat mengakses endpoint ini' }

    return userController.getUsers(req, res);
  }
);

// GET /users/:id — hanya admin yang login
userRouter.get(
  '/:id',
  authenticate,
  authorize('admin'),
  (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Melihat detail pengguna'
    // #swagger.description = 'Hanya admin yang dapat melihat detail pengguna.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.responses[200] = { description: 'Detail user' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat mengakses endpoint ini' }
    // #swagger.responses[404] = { description: 'User tidak ditemukan' }

    return userController.getUserById(req, res);
  }
);

// POST /users — hanya admin yang login
userRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Membuat pengguna baru'
    // #swagger.description = 'Hanya admin yang dapat membuat pengguna baru.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.consumes = ['application/json']
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: { $ref: '#/definitions/UserInput' }
    // }
    // #swagger.responses[201] = { description: 'User dibuat' }
    // #swagger.responses[400] = { description: 'Data user tidak valid' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat mengakses endpoint ini' }

    return userController.createUser(req, res);
  }
);

export { userRouter };
