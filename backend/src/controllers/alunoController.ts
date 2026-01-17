import { Request, Response } from 'express';
import { alunoService } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class AlunoController {
  async criar(req: Request, res: Response) {
    try {
      const aluno = await alunoService.criar(req.body);
      return sendCreated(res, aluno, 'Aluno criado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar aluno', error);
      return sendError(res, error.message);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { matriculados, responsavelId, turmaId } = req.query;

      let alunos;
      if (matriculados === 'true') {
        alunos = await alunoService.buscarMatriculados();
      } else if (responsavelId) {
        alunos = await alunoService.buscarPorResponsavel(responsavelId as string);
      } else if (turmaId) {
        alunos = await alunoService.buscarPorTurma(turmaId as string);
      } else {
        alunos = await alunoService.buscarTodos();
      }

      return sendSuccess(res, alunos);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const aluno = await alunoService.buscarPorId(req.params.id);
      if (!aluno) {
        return sendNotFound(res, 'Aluno');
      }
      return sendSuccess(res, aluno);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const aluno = await alunoService.atualizar(req.params.id, req.body);
      return sendSuccess(res, aluno, 'Aluno atualizado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      await alunoService.deletar(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async vincularTurma(req: Request, res: Response) {
    try {
      const { turmaId } = req.body;
      const aluno = await alunoService.vincularTurma(req.params.id, turmaId);
      return sendSuccess(res, aluno, 'Aluno vinculado à turma');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async desvincularTurma(req: Request, res: Response) {
    try {
      const aluno = await alunoService.desvincularTurma(req.params.id);
      return sendSuccess(res, aluno, 'Aluno desvinculado da turma');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const alunoController = new AlunoController();
