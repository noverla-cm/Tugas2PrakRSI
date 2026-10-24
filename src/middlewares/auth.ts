
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthUser {
  userId: number;
  role: 'admin' | 'owner' | 'customer';
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET belum diatur di file .env');
  }

  return JWT_SECRET;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Token autentikasi diperlukan',
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token autentikasi diperlukan',
    });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === 'string' ||
      typeof payload.userId !== 'number' ||
      !Number.isInteger(payload.userId) ||
      payload.userId <= 0 ||
      !['admin', 'owner', 'customer'].includes(String(payload.role))
    ) {
      return res.status(401).json({
        status: 'error',
        message: 'Token tidak valid',
      });
    }

    req.authUser = {
      userId: payload.userId,
      role: payload.role as AuthUser['role'],
    };

    return next();
  } catch {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid atau sudah kedaluwarsa',
    });
  }
}

export function authorize(...allowedRoles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Autentikasi diperlukan',
      });
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Kamu tidak memiliki izin untuk mengakses fitur ini',
      });
    }

    return next();
  };
}
