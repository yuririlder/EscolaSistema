"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class UsuarioController {
    async criar(req, res) {
        try {
            const usuario = await services_1.usuarioService.criar(req.body);
            return (0, response_1.sendCreated)(res, usuario, 'Usuário criado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar usuário', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listar(req, res) {
        try {
            const usuarios = await services_1.usuarioService.buscarTodos();
            return (0, response_1.sendSuccess)(res, usuarios);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPorId(req, res) {
        try {
            const usuario = await services_1.usuarioService.buscarPorId(req.params.id);
            if (!usuario) {
                return (0, response_1.sendNotFound)(res, 'Usuário');
            }
            return (0, response_1.sendSuccess)(res, usuario);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizar(req, res) {
        try {
            const usuario = await services_1.usuarioService.atualizar(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, usuario, 'Usuário atualizado com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletar(req, res) {
        try {
            await services_1.usuarioService.deletar(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async alterarSenha(req, res) {
        try {
            const { novaSenha } = req.body;
            await services_1.usuarioService.alterarSenha(req.params.id, novaSenha);
            return (0, response_1.sendSuccess)(res, null, 'Senha alterada com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.usuarioController = new UsuarioController();
//# sourceMappingURL=usuarioController.js.map