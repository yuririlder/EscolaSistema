import { Request, Response } from 'express';
import { notaService } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class NotaController {
  async criar(req: Request, res: Response) {
    try {
      const nota = await notaService.criar(req.body);
      return sendCreated(res, nota, 'Nota lançada com sucesso');
    } catch (error: any) {
      logger.error('Erro ao lançar nota', error);
      return sendError(res, error.message);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { alunoId, turmaId } = req.query;

      let notas;
      if (alunoId) {
        notas = await notaService.buscarPorAluno(alunoId as string);
      } else if (turmaId) {
        notas = await notaService.buscarPorTurma(turmaId as string);
      } else {
        notas = await notaService.buscarTodas();
      }

      return sendSuccess(res, notas);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const nota = await notaService.buscarPorId(req.params.id);
      if (!nota) {
        return sendNotFound(res, 'Nota');
      }
      return sendSuccess(res, nota);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorAluno(req: Request, res: Response) {
    try {
      const notas = await notaService.buscarPorAluno(req.params.alunoId);
      return sendSuccess(res, notas);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPorTurma(req: Request, res: Response) {
    try {
      const notas = await notaService.buscarPorTurma(req.params.turmaId);
      return sendSuccess(res, notas);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async obterBoletim(req: Request, res: Response) {
    try {
      const boletim = await notaService.obterBoletim(req.params.alunoId);
      return sendSuccess(res, boletim);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const nota = await notaService.atualizar(req.params.id, req.body);
      return sendSuccess(res, nota, 'Nota atualizada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      await notaService.deletar(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const notaController = new NotaController();
