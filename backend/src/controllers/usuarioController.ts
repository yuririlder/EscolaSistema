import { Request, Response } from 'express';
import { usuarioService } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class UsuarioController {
  async criar(req: Request, res: Response) {
    try {
      const usuario = await usuarioService.criar(req.body);
      return sendCreated(res, usuario, 'Usuário criado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar usuário', error);
      return sendError(res, error.message);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarios = await usuarioService.buscarTodos();
      return sendSuccess(res, usuarios);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const usuario = await usuarioService.buscarPorId(req.params.id);
      if (!usuario) {
        return sendNotFound(res, 'Usuário');
      }
      return sendSuccess(res, usuario);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const usuario = await usuarioService.atualizar(req.params.id, req.body);
      return sendSuccess(res, usuario, 'Usuário atualizado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      await usuarioService.deletar(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async alterarSenha(req: Request, res: Response) {
    try {
      const { novaSenha } = req.body;
      await usuarioService.alterarSenha(req.params.id, novaSenha);
      return sendSuccess(res, null, 'Senha alterada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const usuarioController = new UsuarioController();
