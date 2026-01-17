import { Request, Response } from 'express';
import { responsavelService } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class ResponsavelController {
  async criar(req: Request, res: Response) {
    try {
      const responsavel = await responsavelService.criar(req.body);
      return sendCreated(res, responsavel, 'Responsável criado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar responsável', error);
      return sendError(res, error.message);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const responsaveis = await responsavelService.buscarTodos();
      return sendSuccess(res, responsaveis);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const responsavel = await responsavelService.buscarPorId(req.params.id);
      if (!responsavel) {
        return sendNotFound(res, 'Responsável');
      }
      return sendSuccess(res, responsavel);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarComFilhos(req: Request, res: Response) {
    try {
      const responsavel = await responsavelService.buscarComFilhos(req.params.id);
      if (!responsavel) {
        return sendNotFound(res, 'Responsável');
      }
      return sendSuccess(res, responsavel);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const responsavel = await responsavelService.atualizar(req.params.id, req.body);
      return sendSuccess(res, responsavel, 'Responsável atualizado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      await responsavelService.deletar(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const responsavelController = new ResponsavelController();
