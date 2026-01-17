"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const connection_1 = require("../database/connection");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
class AuthService {
    async login(data) {
        const { email, senha } = data;
        const usuario = await (0, connection_1.queryOne)('SELECT * FROM usuarios WHERE email = $1 AND ativo = true', [email]);
        if (!usuario) {
            throw new Error('Credenciais inválidas');
        }
        const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new Error('Credenciais inválidas');
        }
        const signOptions = { expiresIn: '7d' };
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, email: usuario.email, perfil: usuario.perfil }, process.env.JWT_SECRET || 'secret', signOptions);
        logger_1.logger.info(`Login realizado: ${usuario.email}`);
        const { senha: _, ...usuarioSemSenha } = usuario;
        return {
            token,
            usuario: usuarioSemSenha
        };
    }
    async verificarToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            const usuario = await (0, connection_1.queryOne)('SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = $1', [decoded.id]);
            return usuario || null;
        }
        catch {
            return null;
        }
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map