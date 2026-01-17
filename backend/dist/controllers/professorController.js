"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class ProfessorController {
    async criar(req, res) {
        try {
            const professor = await services_1.professorService.criar(req.body);
            return (0, response_1.sendCreated)(res, professor, 'Professor criado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar professor', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listar(req, res) {
        try {
            const { ativos } = req.query;
            const professores = ativos === 'true'
                ? await services_1.professorService.buscarAtivos()
                : await services_1.professorService.buscarTodos();
            return (0, response_1.sendSuccess)(res, professores);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorId(req, res) {
        try {
            const professor = await services_1.professorService.buscarPorId(req.params.id);
            if (!professor) {
                return (0, response_1.sendNotFound)(res, 'Professor');
            }
            return (0, response_1.sendSuccess)(res, professor);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizar(req, res) {
        try {
            const professor = await services_1.professorService.atualizar(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, professor, 'Professor atualizado com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletar(req, res) {
        try {
            await services_1.professorService.deletar(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async vincularTurma(req, res) {
        try {
            const { turmaId, disciplina } = req.body;
            await services_1.professorService.vincularTurma(req.params.id, turmaId, disciplina);
            return (0, response_1.sendSuccess)(res, null, 'Professor vinculado à turma');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async desvincularTurma(req, res) {
        try {
            const { turmaId } = req.body;
            await services_1.professorService.desvincularTurma(req.params.id, turmaId);
            return (0, response_1.sendSuccess)(res, null, 'Professor desvinculado da turma');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.professorController = new ProfessorController();
//# sourceMappingURL=professorController.js.map