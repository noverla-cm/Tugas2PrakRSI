
import { Router } from 'express';
import { MenuItemController } from '../controllers/menuItemController.ts';
import { authenticate, authorize } from '../middlewares/auth.ts';
import { validate } from '../middlewares/validate.ts';
import {
  menuItemIdSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from '../dtos/menuItemDto.ts';

const menuItemRouter = Router();
const menuItemController = new MenuItemController();

// GET /menu-items — publik, tidak perlu login
menuItemRouter.get('/', (req, res) => {
  // #swagger.tags = ['Menu Items']
  // #swagger.summary = 'Melihat daftar menu'
  // #swagger.description = 'Publik dapat melihat daftar menu beserta nama warung.'
  // #swagger.responses[200] = { description: 'Daftar menu (JOIN nama warung)' }

  return menuItemController.getMenuItems(req, res);
});

// POST /menu-items — hanya owner dan admin yang login
menuItemRouter.post(
  '/',
  authenticate,
  authorize('owner', 'admin'),
  validate(createMenuItemSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Menu Items']
    // #swagger.summary = 'Membuat menu baru'
    // #swagger.description = 'Admin dapat membuat menu di semua warung; Owner hanya di warung miliknya.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.consumes = ['application/json']
    // #swagger.parameters['body'] = {
    //   in: 'body',
    //   name: 'body',
    //   required: true,
    //   schema: { $ref: '#/definitions/MenuItemInput' }
    // }
    // #swagger.responses[201] = { description: 'Menu item dibuat' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Role tidak memiliki izin / bukan warung miliknya' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }

    return menuItemController.createMenuItem(req, res);
  }
);

// GET /menu-items/:id — publik, tidak perlu login
menuItemRouter.get('/:id', validate(menuItemIdSchema, 'params'), (req, res) => {
  // #swagger.tags = ['Menu Items']
  // #swagger.summary = 'Melihat detail menu'
  // #swagger.parameters['id'] = {
  //   in: 'path',
  //   name: 'id',
  //   required: true,
  //   type: 'integer'
  // }

  return menuItemController.getMenuItemById(req, res);
});

// PUT /menu-items/:id — hanya owner dan admin yang login
menuItemRouter.put(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate(menuItemIdSchema, 'params'),
  validate(updateMenuItemSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Menu Items']
    // #swagger.summary = 'Memperbarui menu'
    // #swagger.description = 'Admin dapat mengubah semua menu; Owner hanya menu di warung miliknya.'
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
    //   schema: { $ref: '#/definitions/MenuItemInput' }
    // }
    // #swagger.responses[200] = { description: 'Menu berhasil diperbarui' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Role tidak memiliki izin / bukan menu warung miliknya' }
    // #swagger.responses[404] = { description: 'Menu atau warung tidak ditemukan' }

    return menuItemController.updateMenuItem(req, res);
  }
);

// DELETE /menu-items/:id — hanya owner dan admin yang login
menuItemRouter.delete(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate(menuItemIdSchema, 'params'),
  (req, res) => {
    // #swagger.tags = ['Menu Items']
    // #swagger.summary = 'Menghapus menu'
    // #swagger.description = 'Admin dapat menghapus semua menu; Owner hanya menu di warung miliknya.'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = {
    //   in: 'path',
    //   name: 'id',
    //   required: true,
    //   type: 'integer'
    // }
    // #swagger.responses[200] = { description: 'Menu berhasil dihapus' }
    // #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
    // #swagger.responses[403] = { description: 'Role tidak memiliki izin / bukan menu warung miliknya' }
    // #swagger.responses[404] = { description: 'Menu tidak ditemukan' }

    return menuItemController.deleteMenuItem(req, res);
  }
);

export { menuItemRouter };
