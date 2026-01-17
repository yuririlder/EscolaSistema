"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historicoEscolarController = void 0;
const historicoEscolarService_1 = require("../services/historicoEscolarService");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class HistoricoEscolarController {
    async vincularAlunoTurma(req, res) {
        try {
            const { aluno_id, turma_id, ano_letivo, observacoes } = req.body;
            if (!aluno_id || !turma_id || !ano_letivo) {
                return (0, response_1.sendError)(res, 'Aluno, turma e ano letivo são obrigatórios', 400);
            }
            const historico = await historicoEscolarService_1.historicoEscolarService.vincularAlunoTurma({
                aluno_id,
                turma_id,
                ano_letivo: parseInt(ano_letivo),
                observacoes
            });
            return (0, response_1.sendCreated)(res, historico, 'Aluno vinculado à turma com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao vincular aluno à turma', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async desvincularAlunoTurma(req, res) {
        try {
            const { alunoId, anoLetivo } = req.params;
            await historicoEscolarService_1.historicoEscolarService.desvincularAlunoTurma(alunoId, parseInt(anoLetivo));
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            logger_1.logger.error('Erro ao desvincular aluno da turma', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarHistoricoAluno(req, res) {
        try {
            const { alunoId } = req.params;
            const historico = await historicoEscolarService_1.historicoEscolarService.buscarHistoricoAluno(alunoId);
            return (0, response_1.sendSuccess)(res, historico);
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar histórico do aluno', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarVinculoAtual(req, res) {
        try {
            const { alunoId } = req.params;
            const vinculo = await historicoEscolarService_1.historicoEscolarService.buscarVinculoAtual(alunoId);
            return (0, response_1.sendSuccess)(res, vinculo);
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar vínculo atual', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listarAlunosPorTurmaAno(req, res) {
        try {
            const { turmaId, anoLetivo } = req.params;
            const alunos = await historicoEscolarService_1.historicoEscolarService.listarAlunosPorTurmaAno(turmaId, parseInt(anoLetivo));
            return (0, response_1.sendSuccess)(res, alunos);
        }
        catch (error) {
            logger_1.logger.error('Erro ao listar alunos da turma', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, observacoes } = req.body;
            const historico = await historicoEscolarService_1.historicoEscolarService.atualizarStatus(id, status, observacoes);
            return (0, response_1.sendSuccess)(res, historico, 'Status atualizado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao atualizar status', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listar(req, res) {
        try {
            const { ano_letivo } = req.query;
            const historicos = await historicoEscolarService_1.historicoEscolarService.buscarTodos(ano_letivo ? parseInt(ano_letivo) : undefined);
            return (0, response_1.sendSuccess)(res, historicos);
        }
        catch (error) {
            logger_1.logger.error('Erro ao listar históricos', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const historico = await historicoEscolarService_1.historicoEscolarService.buscarPorId(id);
            if (!historico) {
                return (0, response_1.sendNotFound)(res, 'Histórico');
            }
            return (0, response_1.sendSuccess)(res, historico);
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar histórico', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.historicoEscolarController = new HistoricoEscolarController();
//# sourceMappingURL=historicoEscolarController.js.map