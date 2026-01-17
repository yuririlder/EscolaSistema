"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notaController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class NotaController {
    async criar(req, res) {
        try {
            const nota = await services_1.notaService.criar(req.body);
            return (0, response_1.sendCreated)(res, nota, 'Nota lançada com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao lançar nota', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listar(req, res) {
        try {
            const { alunoId, turmaId } = req.query;
            let notas;
            if (alunoId) {
                notas = await services_1.notaService.buscarPorAluno(alunoId);
            }
            else if (turmaId) {
                notas = await services_1.notaService.buscarPorTurma(turmaId);
            }
            else {
                notas = await services_1.notaService.buscarTodas();
            }
            return (0, response_1.sendSuccess)(res, notas);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorId(req, res) {
        try {
            const nota = await services_1.notaService.buscarPorId(req.params.id);
            if (!nota) {
                return (0, response_1.sendNotFound)(res, 'Nota');
            }
            return (0, response_1.sendSuccess)(res, nota);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorAluno(req, res) {
        try {
            const notas = await services_1.notaService.buscarPorAluno(req.params.alunoId);
            return (0, response_1.sendSuccess)(res, notas);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorTurma(req, res) {
        try {
            const notas = await services_1.notaService.buscarPorTurma(req.params.turmaId);
            return (0, response_1.sendSuccess)(res, notas);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async obterBoletim(req, res) {
        try {
            const boletim = await services_1.notaService.obterBoletim(req.params.alunoId);
            return (0, response_1.sendSuccess)(res, boletim);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizar(req, res) {
        try {
            const nota = await services_1.notaService.atualizar(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, nota, 'Nota atualizada com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletar(req, res) {
        try {
            await services_1.notaService.deletar(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.notaController = new NotaController();
//# sourceMappingURL=notaController.js.map