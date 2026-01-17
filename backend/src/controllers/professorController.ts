import { Request, Response } from 'express';
import { professorService } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class ProfessorController {
  async criar(req: Request, res: Response) {
    try {
      const professor = await professorService.criar(req.body);
      return sendCreated(res, professor, 'Professor criado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar professor', error);
      return sendError(res, error.message);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { ativos } = req.query;
      const professores = ativos === 'true'
        ? await professorService.buscarAtivos()
        : await professorService.buscarTodos();
      return sendSuccess(res, professores);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const professor = await professorService.buscarPorId(req.params.id);
      if (!professor) {
        return sendNotFound(res, 'Professor');
      }
      return sendSuccess(res, professor);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const professor = await professorService.atualizar(req.params.id, req.body);
      return sendSuccess(res, professor, 'Professor atualizado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      await professorService.deletar(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async vincularTurma(req: Request, res: Response) {
    try {
      const { turmaId, disciplina } = req.body;
      await professorService.vincularTurma(req.params.id, turmaId, disciplina);
      return sendSuccess(res, null, 'Professor vinculado à turma');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async desvincularTurma(req: Request, res: Response) {
    try {
      const { turmaId } = req.body;
      await professorService.desvincularTurma(req.params.id, turmaId);
      return sendSuccess(res, null, 'Professor desvinculado da turma');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const professorController = new ProfessorController();
