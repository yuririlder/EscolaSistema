"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alunoController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class AlunoController {
    async criar(req, res) {
        try {
            const aluno = await services_1.alunoService.criar(req.body);
            return (0, response_1.sendCreated)(res, aluno, 'Aluno criado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar aluno', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listar(req, res) {
        try {
            const { matriculados, responsavelId, turmaId } = req.query;
            let alunos;
            if (matriculados === 'true') {
                alunos = await services_1.alunoService.buscarMatriculados();
            }
            else if (responsavelId) {
                alunos = await services_1.alunoService.buscarPorResponsavel(responsavelId);
            }
            else if (turmaId) {
                alunos = await services_1.alunoService.buscarPorTurma(turmaId);
            }
            else {
                alunos = await services_1.alunoService.buscarTodos();
            }
            return (0, response_1.sendSuccess)(res, alunos);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorId(req, res) {
        try {
            const aluno = await services_1.alunoService.buscarPorId(req.params.id);
            if (!aluno) {
                return (0, response_1.sendNotFound)(res, 'Aluno');
            }
            return (0, response_1.sendSuccess)(res, aluno);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizar(req, res) {
        try {
            const aluno = await services_1.alunoService.atualizar(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, aluno, 'Aluno atualizado com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletar(req, res) {
        try {
            await services_1.alunoService.deletar(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async vincularTurma(req, res) {
        try {
            const { turmaId } = req.body;
            const aluno = await services_1.alunoService.vincularTurma(req.params.id, turmaId);
            return (0, response_1.sendSuccess)(res, aluno, 'Aluno vinculado à turma');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async desvincularTurma(req, res) {
        try {
            const aluno = await services_1.alunoService.desvincularTurma(req.params.id);
            return (0, response_1.sendSuccess)(res, aluno, 'Aluno desvinculado da turma');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.alunoController = new AlunoController();
//# sourceMappingURL=alunoController.js.map