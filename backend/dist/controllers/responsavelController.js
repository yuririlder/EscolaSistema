"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsavelController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class ResponsavelController {
    async criar(req, res) {
        try {
            const responsavel = await services_1.responsavelService.criar(req.body);
            return (0, response_1.sendCreated)(res, responsavel, 'Responsável criado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar responsável', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listar(req, res) {
        try {
            const responsaveis = await services_1.responsavelService.buscarTodos();
            return (0, response_1.sendSuccess)(res, responsaveis);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorId(req, res) {
        try {
            const responsavel = await services_1.responsavelService.buscarPorId(req.params.id);
            if (!responsavel) {
                return (0, response_1.sendNotFound)(res, 'Responsável');
            }
            return (0, response_1.sendSuccess)(res, responsavel);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarComFilhos(req, res) {
        try {
            const responsavel = await services_1.responsavelService.buscarComFilhos(req.params.id);
            if (!responsavel) {
                return (0, response_1.sendNotFound)(res, 'Responsável');
            }
            return (0, response_1.sendSuccess)(res, responsavel);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizar(req, res) {
        try {
            const responsavel = await services_1.responsavelService.atualizar(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, responsavel, 'Responsável atualizado com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletar(req, res) {
        try {
            await services_1.responsavelService.deletar(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.responsavelController = new ResponsavelController();
//# sourceMappingURL=responsavelController.js.map