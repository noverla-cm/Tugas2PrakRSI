
import type { Request, Response } from 'express';
import { UserService } from '../services/userService.ts';

export class UserController {
  constructor(private userService: UserService = new UserService()) {}

  private handleError(res: Response, error: unknown): Response {
    const message = error instanceof Error ? error.message : '';

    if (message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'User tidak ditemukan',
      });
    }

    if (message === 'EMAIL_ALREADY_REGISTERED') {
      return res.status(409).json({
        status: 'fail',
        message: 'Email sudah terdaftar',
      });
    }

    if (message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        status: 'fail',
        message: 'Email atau password salah',
      });
    }

    if (message === 'JWT_SECRET belum diatur di file .env') {
      return res.status(500).json({
        status: 'error',
        message: 'Konfigurasi autentikasi server belum lengkap',
      });
    }

    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await this.userService.getUserById(Number(req.params.id));
      return res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await this.userService.createUser(req.body);
      return res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await this.userService.register(
        res.locals.validated.body
      );

      return res.status(201).json({
        status: 'success',
        message: 'Registrasi berhasil',
        data: user,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.userService.login(
        res.locals.validated.body
      );

      return res.status(200).json({
        status: 'success',
        message: 'Login berhasil',
        data: result,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  
getMe = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.authUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Autentikasi diperlukan',
      });
    }

    const user = await this.userService.getUserById(
      req.authUser.userId
    );

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    return this.handleError(res, error);
  }
};

}
