import type { Request, Response } from 'express';
import { MenuItemService, type MenuActor } from '../services/menuItemService.ts';

export class MenuItemController {
  constructor(private menuItemService: MenuItemService = new MenuItemService()) {}

  private handleError(res: Response, error: unknown): Response {
    const message = error instanceof Error ? error.message : '';

    if (message === 'MENU_ITEM_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Menu item tidak ditemukan' });
    }
    if (message === 'STALL_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Data warung tidak ditemukan' });
    }
    if (message === 'FORBIDDEN_MENU_ACCESS') {
      return res.status(403).json({
        status: 'error',
        message: 'Kamu tidak memiliki izin mengelola menu warung ini',
      });
    }

    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  // Identitas dan role pengguna selalu berasal dari JWT (req.authUser).
  private getActor(req: Request): MenuActor | null {
    return req.authUser ? { userId: req.authUser.userId, role: req.authUser.role } : null;
  }

  private unauthorized(res: Response): Response {
    return res.status(401).json({ status: 'error', message: 'Autentikasi diperlukan' });
  }

  getMenuItems = async (req: Request, res: Response): Promise<Response> => {
    try {
      const items = await this.menuItemService.getAllMenuItems();
      return res.status(200).json({ status: 'success', data: items });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getMenuItemById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = res.locals.validated.params;
      const item = await this.menuItemService.getMenuItemById(id);
      return res.status(200).json({ status: 'success', data: item });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createMenuItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const actor = this.getActor(req);
      if (!actor) return this.unauthorized(res);

      const item = await this.menuItemService.createMenuItem(res.locals.validated.body, actor);
      return res.status(201).json({ status: 'success', data: item });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateMenuItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const actor = this.getActor(req);
      if (!actor) return this.unauthorized(res);

      const { id } = res.locals.validated.params;
      const item = await this.menuItemService.updateMenuItem(id, res.locals.validated.body, actor);
      return res.status(200).json({ status: 'success', data: item });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteMenuItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const actor = this.getActor(req);
      if (!actor) return this.unauthorized(res);

      const { id } = res.locals.validated.params;
      const item = await this.menuItemService.deleteMenuItem(id, actor);
      return res.status(200).json({ status: 'success', data: item });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
