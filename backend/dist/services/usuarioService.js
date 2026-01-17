"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioService = void 0;
const connection_1 = require("../database/connection");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class UsuarioService {
    async criar(data) {
        // Verificar se email já existe
        const emailExists = await (0, connection_1.queryOne)('SELECT id FROM usuarios WHERE email = $1', [data.email]);
        if (emailExists) {
            throw new Error('E-mail já cadastrado');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.senha, 10);
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO usuarios (id, nome, email, senha, perfil, ativo)
       VALUES ($1, $2, $3, $4, $5, true)`, [id, data.nome, data.email, hashedPassword, data.perfil]);
        logger_1.logger.info(`Usuário criado: ${data.email}`);
        return this.buscarPorId(id);
    }
    async buscarTodos() {
        return await (0, connection_1.queryMany)(`SELECT id, nome, email, perfil, ativo, created_at, updated_at
       FROM usuarios ORDER BY nome ASC`);
    }
    async buscarPorId(id) {
        return await (0, connection_1.queryOne)(`SELECT id, nome, email, perfil, ativo, created_at, updated_at
       FROM usuarios WHERE id = $1`, [id]);
    }
    async buscarPorEmail(email) {
        return await (0, connection_1.queryOne)(`SELECT id, nome, email, perfil, ativo, created_at, updated_at
       FROM usuarios WHERE email = $1`, [email]);
    }
    async atualizar(id, data) {
        const usuario = await this.buscarPorId(id);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (data.nome) {
            fields.push(`nome = $${paramIndex++}`);
            values.push(data.nome);
        }
        if (data.email) {
            fields.push(`email = $${paramIndex++}`);
            values.push(data.email);
        }
        if (data.perfil) {
            fields.push(`perfil = $${paramIndex++}`);
            values.push(data.perfil);
        }
        if (data.ativo !== undefined) {
            fields.push(`ativo = $${paramIndex++}`);
            values.push(data.ativo);
        }
        if (fields.length === 0) {
            return usuario;
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await (0, connection_1.query)(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
        logger_1.logger.info(`Usuário atualizado: ${id}`);
        return this.buscarPorId(id);
    }
    async alterarSenha(id, novaSenha) {
        const hashedPassword = await bcryptjs_1.default.hash(novaSenha, 10);
        await (0, connection_1.query)("UPDATE usuarios SET senha = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [hashedPassword, id]);
        logger_1.logger.info(`Senha alterada para usuário: ${id}`);
    }
    async deletar(id) {
        const usuario = await this.buscarPorId(id);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        await (0, connection_1.query)('DELETE FROM usuarios WHERE id = $1', [id]);
        logger_1.logger.info(`Usuário deletado: ${id}`);
    }
}
exports.usuarioService = new UsuarioService();
//# sourceMappingURL=usuarioService.js.map