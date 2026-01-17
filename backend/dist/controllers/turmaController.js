"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turmaController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class TurmaController {
    async criar(req, res) {
        try {
            const turma = await services_1.turmaService.criar(req.body);
            return (0, response_1.sendCreated)(res, turma, 'Turma criada com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar turma', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listar(req, res) {
        try {
            const { ativas } = req.query;
            const turmas = ativas === 'true'
                ? await services_1.turmaService.buscarAtivas()
                : await services_1.turmaService.buscarTodas();
            return (0, response_1.sendSuccess)(res, turmas);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorId(req, res) {
        try {
            const turma = await services_1.turmaService.buscarPorId(req.params.id);
            if (!turma) {
                return (0, response_1.sendNotFound)(res, 'Turma');
            }
            return (0, response_1.sendSuccess)(res, turma);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarComAlunos(req, res) {
        try {
            const turma = await services_1.turmaService.buscarComAlunos(req.params.id);
            if (!turma) {
                return (0, response_1.sendNotFound)(res, 'Turma');
            }
            return (0, response_1.sendSuccess)(res, turma);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarComProfessores(req, res) {
        try {
            const turma = await services_1.turmaService.buscarComProfessores(req.params.id);
            if (!turma) {
                return (0, response_1.sendNotFound)(res, 'Turma');
            }
            return (0, response_1.sendSuccess)(res, turma);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizar(req, res) {
        try {
            const turma = await services_1.turmaService.atualizar(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, turma, 'Turma atualizada com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletar(req, res) {
        try {
            await services_1.turmaService.deletar(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.turmaController = new TurmaController();
//# sourceMappingURL=turmaController.js.map