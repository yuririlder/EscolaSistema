import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
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
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar perfis específicos
export const requirePerfil = (...perfisPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
    }

    return next();
  };
};

// Middleware para verificar se é Diretor
export const requireDiretor = requirePerfil('DIRETOR');

// Middleware para verificar se é Diretor ou Secretário
export const requireDiretorOuSecretario = requirePerfil('DIRETOR', 'SECRETARIO');

// Middleware para qualquer perfil autenticado
export const requireAnyPerfil = requirePerfil('DIRETOR', 'SECRETARIO', 'COORDENADOR');
