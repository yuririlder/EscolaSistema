"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const connection_1 = require("../database/connection");
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
    async setup(req, res) {
        try {
            // Verificar se já existe algum usuário
            const existingUser = await (0, connection_1.queryOne)('SELECT id FROM usuarios LIMIT 1');
            if (existingUser) {
                return (0, response_1.sendError)(res, 'Setup já foi realizado. Sistema já possui usuários cadastrados.', 400);
            }
            // Verificar se já existe escola, senão criar
            let escola = await (0, connection_1.queryOne)('SELECT * FROM escolas LIMIT 1');
            if (!escola) {
                const escolaResult = await (0, connection_1.query)(`INSERT INTO escolas (nome, cnpj, telefone, email, endereco, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`, ['Escola Padrão', '00.000.000/0001-00', '(00) 0000-0000', 'escola@exemplo.com', 'Endereço da Escola']);
                escola = escolaResult.rows[0];
            }
            // Criar usuário admin
            const senhaHash = await bcryptjs_1.default.hash('admin123', 10);
            await (0, connection_1.query)(`INSERT INTO usuarios (nome, email, senha, perfil, ativo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`, ['Administrador', 'admin@escola.com', senhaHash, 'Diretor', true]);
            // Verificar se já existem planos, senão criar
            const existingPlanos = await (0, connection_1.queryOne)('SELECT id FROM planos_mensalidade LIMIT 1');
            if (!existingPlanos) {
                await (0, connection_1.query)(`INSERT INTO planos_mensalidade (nome, valor, descricao, ativo, escola_id, created_at, updated_at)
           VALUES 
             ($1, $2, $3, $4, $5, NOW(), NOW()),
             ($6, $7, $8, $9, $10, NOW(), NOW()),
             ($11, $12, $13, $14, $15, NOW(), NOW())`, [
                    'Plano Básico', 500.00, 'Plano básico de mensalidade', true, escola.id,
                    'Plano Intermediário', 750.00, 'Plano intermediário de mensalidade', true, escola.id,
                    'Plano Premium', 1000.00, 'Plano premium de mensalidade', true, escola.id
                ]);
            }
            logger_1.logger.info('Setup inicial realizado com sucesso');
            return (0, response_1.sendSuccess)(res, {
                message: 'Setup realizado com sucesso!',
                admin: {
                    email: 'admin@escola.com',
                    senha: 'admin123'
                }
            }, 'Setup inicial concluído');
        }
        catch (error) {
            logger_1.logger.error('Erro no setup inicial', error);
            return (0, response_1.sendError)(res, error.message || 'Erro ao realizar setup inicial', 500);
        }
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map