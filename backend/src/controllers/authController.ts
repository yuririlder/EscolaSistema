import { Request, Response } from 'express';
import { authService, usuarioService } from '../services';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';
import { logger } from '../utils/logger';

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return sendError(res, 'E-mail e senha são obrigatórios', 400);
      }

      const result = await authService.login({ email, senha });
      return sendSuccess(res, result, 'Login realizado com sucesso');
    } catch (error: any) {
      logger.error('Erro no login', error);
      return sendUnauthorized(res, error.message || 'Credenciais inválidas');
    }
  }

  async me(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        return sendUnauthorized(res);
      }
      const usuario = await usuarioService.buscarPorId(usuarioId);
      if (!usuario) {
        return sendUnauthorized(res, 'Usuário não encontrado');
      }
      return sendSuccess(res, {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const authController = new AuthController();
