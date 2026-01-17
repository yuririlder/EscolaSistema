import { Request, Response } from 'express';
import { historicoEscolarService } from '../services/historicoEscolarService';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class HistoricoEscolarController {
  async vincularAlunoTurma(req: Request, res: Response) {
    try {
      const { aluno_id, turma_id, ano_letivo, observacoes } = req.body;
      
      if (!aluno_id || !turma_id || !ano_letivo) {
        return sendError(res, 'Aluno, turma e ano letivo são obrigatórios', 400);
      }

      const historico = await historicoEscolarService.vincularAlunoTurma({
        aluno_id,
        turma_id,
        ano_letivo: parseInt(ano_letivo),
        observacoes
      });
      
      return sendCreated(res, historico, 'Aluno vinculado à turma com sucesso');
    } catch (error: any) {
      logger.error('Erro ao vincular aluno à turma', error);
      return sendError(res, error.message);
    }
  }

  async desvincularAlunoTurma(req: Request, res: Response) {
    try {
      const { alunoId, anoLetivo } = req.params;
      
      await historicoEscolarService.desvincularAlunoTurma(alunoId, parseInt(anoLetivo));
      return sendNoContent(res);
    } catch (error: any) {
      logger.error('Erro ao desvincular aluno da turma', error);
      return sendError(res, error.message);
    }
  }

  async buscarHistoricoAluno(req: Request, res: Response) {
    try {
      const { alunoId } = req.params;
      const historico = await historicoEscolarService.buscarHistoricoAluno(alunoId);
      return sendSuccess(res, historico);
    } catch (error: any) {
      logger.error('Erro ao buscar histórico do aluno', error);
      return sendError(res, error.message);
    }
  }

  async buscarVinculoAtual(req: Request, res: Response) {
    try {
      const { alunoId } = req.params;
      const vinculo = await historicoEscolarService.buscarVinculoAtual(alunoId);
      return sendSuccess(res, vinculo);
    } catch (error: any) {
      logger.error('Erro ao buscar vínculo atual', error);
      return sendError(res, error.message);
    }
  }

  async listarAlunosPorTurmaAno(req: Request, res: Response) {
    try {
      const { turmaId, anoLetivo } = req.params;
      const alunos = await historicoEscolarService.listarAlunosPorTurmaAno(turmaId, parseInt(anoLetivo));
      return sendSuccess(res, alunos);
    } catch (error: any) {
      logger.error('Erro ao listar alunos da turma', error);
      return sendError(res, error.message);
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;
      
      const historico = await historicoEscolarService.atualizarStatus(id, status, observacoes);
      return sendSuccess(res, historico, 'Status atualizado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao atualizar status', error);
      return sendError(res, error.message);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { ano_letivo } = req.query;
      const historicos = await historicoEscolarService.buscarTodos(
        ano_letivo ? parseInt(ano_letivo as string) : undefined
      );
      return sendSuccess(res, historicos);
    } catch (error: any) {
      logger.error('Erro ao listar históricos', error);
      return sendError(res, error.message);
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const historico = await historicoEscolarService.buscarPorId(id);
      if (!historico) {
        return sendNotFound(res, 'Histórico');
      }
      return sendSuccess(res, historico);
    } catch (error: any) {
      logger.error('Erro ao buscar histórico', error);
      return sendError(res, error.message);
    }
  }
}

export const historicoEscolarController = new HistoricoEscolarController();
