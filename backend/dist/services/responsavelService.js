"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsavelService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class ResponsavelService {
    async criar(data) {
        // Verificar se CPF foi informado
        if (!data.cpf) {
            throw new Error('CPF é obrigatório');
        }
        // Verificar CPF único
        const cpfExists = await (0, connection_1.queryOne)('SELECT id FROM responsaveis WHERE cpf = $1', [data.cpf]);
        if (cpfExists) {
            throw new Error('CPF já cadastrado');
        }
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO responsaveis (id, nome, cpf, rg, data_nascimento, telefone, celular, email, endereco, bairro, complemento, cidade, estado, cep, profissao, local_trabalho, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`, [id, data.nome, data.cpf, data.rg, data.data_nascimento, data.telefone, data.celular, data.email, data.endereco, data.bairro, data.complemento, data.cidade, data.estado, data.cep, data.profissao, data.local_trabalho, data.observacoes]);
        logger_1.logger.info(`Responsável criado: ${data.nome}`);
        return this.buscarPorId(id);
    }
    async buscarTodos(incluirInativos = false) {
        const whereClause = incluirInativos ? '' : 'WHERE (ativo = true OR ativo IS NULL)';
        return await (0, connection_1.queryMany)(`SELECT * FROM responsaveis ${whereClause} ORDER BY nome ASC`);
    }
    async buscarPorId(id) {
        return await (0, connection_1.queryOne)('SELECT * FROM responsaveis WHERE id = $1', [id]);
    }
    async buscarComFilhos(id) {
        const responsavel = await this.buscarPorId(id);
        if (!responsavel)
            return null;
        const filhos = await (0, connection_1.queryMany)(`SELECT a.*, t.nome as turma_nome
       FROM alunos a
       LEFT JOIN turmas t ON a.turma_id = t.id
       WHERE a.responsavel_id = $1
       ORDER BY a.nome ASC`, [id]);
        return { ...responsavel, filhos };
    }
    async atualizar(id, data) {
        const responsavel = await this.buscarPorId(id);
        if (!responsavel) {
            throw new Error('Responsável não encontrado');
        }
        // Verificar CPF único se estiver sendo atualizado
        if (data.cpf && data.cpf !== responsavel.cpf) {
            const cpfExists = await (0, connection_1.queryOne)('SELECT id FROM responsaveis WHERE cpf = $1 AND id != $2', [data.cpf, id]);
            if (cpfExists) {
                throw new Error('CPF já cadastrado para outro responsável');
            }
        }
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const campos = ['nome', 'cpf', 'rg', 'data_nascimento', 'telefone', 'celular', 'email', 'endereco', 'bairro', 'complemento', 'cidade', 'estado', 'cep', 'profissao', 'local_trabalho', 'observacoes'];
        for (const campo of campos) {
            if (data[campo] !== undefined) {
                fields.push(`${campo} = $${paramIndex++}`);
                values.push(data[campo]);
            }
        }
        if (fields.length === 0) {
            return responsavel;
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await (0, connection_1.query)(`UPDATE responsaveis SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
        logger_1.logger.info(`Responsável atualizado: ${id}`);
        return this.buscarPorId(id);
    }
    async deletar(id) {
        const responsavel = await this.buscarPorId(id);
        if (!responsavel) {
            throw new Error('Responsável não encontrado');
        }
        // Soft delete - apenas desativa para manter histórico dos alunos
        await (0, connection_1.query)('UPDATE responsaveis SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        logger_1.logger.info(`Responsável desativado: ${id}`);
    }
    async reativar(id) {
        const responsavel = await (0, connection_1.queryOne)('SELECT * FROM responsaveis WHERE id = $1', [id]);
        if (!responsavel) {
            throw new Error('Responsável não encontrado');
        }
        await (0, connection_1.query)('UPDATE responsaveis SET ativo = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        logger_1.logger.info(`Responsável reativado: ${id}`);
        return this.buscarPorId(id);
    }
}
exports.responsavelService = new ResponsavelService();
//# sourceMappingURL=responsavelService.js.map