"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class AuthController {
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                return (0, response_1.sendError)(res, 'E-mail e senha são obrigatórios', 400);
            }
            const result = await services_1.authService.login({ email, senha });
            return (0, response_1.sendSuccess)(res, result, 'Login realizado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro no login', error);
            return (0, response_1.sendUnauthorized)(res, error.message || 'Credenciais inválidas');
        }
    }
    async me(req, res) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return (0, response_1.sendUnauthorized)(res);
            }
            const usuario = await services_1.usuarioService.buscarPorId(usuarioId);
            if (!usuario) {
                return (0, response_1.sendUnauthorized)(res, 'Usuário não encontrado');
            }
            return (0, response_1.sendSuccess)(res, {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            });
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message, 400);
        }
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map