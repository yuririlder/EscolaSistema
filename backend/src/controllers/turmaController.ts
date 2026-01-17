import { Request, Response } from 'express';
import { turmaService } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class TurmaController {
  async criar(req: Request, res: Response) {
    try {
      const turma = await turmaService.criar(req.body);
      return sendCreated(res, turma, 'Turma criada com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar turma', error);
      return sendError(res, error.message);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { ativas } = req.query;
      const turmas = ativas === 'true' 
        ? await turmaService.buscarAtivas()
        : await turmaService.buscarTodas();
      return sendSuccess(res, turmas);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const turma = await turmaService.buscarPorId(req.params.id);
      if (!turma) {
        return sendNotFound(res, 'Turma');
      }
      return sendSuccess(res, turma);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarComAlunos(req: Request, res: Response) {
    try {
      const turma = await turmaService.buscarComAlunos(req.params.id);
      if (!turma) {
        return sendNotFound(res, 'Turma');
      }
      return sendSuccess(res, turma);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarComProfessores(req: Request, res: Response) {
    try {
      const turma = await turmaService.buscarComProfessores(req.params.id);
      if (!turma) {
        return sendNotFound(res, 'Turma');
      }
      return sendSuccess(res, turma);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const turma = await turmaService.atualizar(req.params.id, req.body);
      return sendSuccess(res, turma, 'Turma atualizada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      await turmaService.deletar(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const turmaController = new TurmaController();
