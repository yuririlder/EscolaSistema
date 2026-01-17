import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendUnauthorized, sendForbidden } from '../utils/response';

interface TokenPayload {
  id: string;
  email: string;
  perfil: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        perfil: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendUnauthorized(res, 'Token não fornecido');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return sendUnauthorized(res, 'Token mal formatado');
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return sendUnauthorized(res, 'Token mal formatado');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as TokenPayload;

    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      perfil: decoded.perfil,
    };

    return next();
  } catch {
    return sendUnauthorized(res, 'Token inválido');
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.usuario?.perfil !== 'ADMIN') {
    return sendForbidden(res, 'Acesso restrito a administradores');
  }
  return next();
};

export const requireDiretor = (req: Request, res: Response, next: NextFunction) => {
  if (!['ADMIN', 'DIRETOR'].includes(req.usuario?.perfil || '')) {
    return sendForbidden(res, 'Acesso restrito a diretores');
  }
  return next();
};

export const requireDiretorOuSecretario = (req: Request, res: Response, next: NextFunction) => {
  if (!['ADMIN', 'DIRETOR', 'SECRETARIO'].includes(req.usuario?.perfil || '')) {
    return sendForbidden(res, 'Acesso negado');
  }
  return next();
};

export const requireAnyAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.usuario) {
    return sendUnauthorized(res);
  }
  return next();
};
