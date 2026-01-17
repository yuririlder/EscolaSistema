"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsavelService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class ResponsavelService {
    async criar(data) {
        // Verificar CPF único
        const cpfExists = await (0, connection_1.queryOne)('SELECT id FROM responsaveis WHERE cpf = $1', [data.cpf]);
        if (cpfExists) {
            throw new Error('CPF já cadastrado');
        }
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO responsaveis (id, nome, cpf, rg, data_nascimento, telefone, celular, email, endereco, cidade, estado, cep, profissao, local_trabalho, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, [id, data.nome, data.cpf, data.rg, data.data_nascimento, data.telefone, data.celular, data.email, data.endereco, data.cidade, data.estado, data.cep, data.profissao, data.local_trabalho, data.observacoes]);
        logger_1.logger.info(`Responsável criado: ${data.nome}`);
        return this.buscarPorId(id);
    }
    async buscarTodos() {
        return await (0, connection_1.queryMany)('SELECT * FROM responsaveis ORDER BY nome ASC');
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
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const campos = ['nome', 'cpf', 'rg', 'data_nascimento', 'telefone', 'celular', 'email', 'endereco', 'cidade', 'estado', 'cep', 'profissao', 'local_trabalho', 'observacoes'];
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
        // Verificar se há alunos vinculados
        const alunos = await (0, connection_1.queryMany)('SELECT id FROM alunos WHERE responsavel_id = $1', [id]);
        if (alunos.length > 0) {
            throw new Error('Não é possível excluir responsável com alunos vinculados');
        }
        await (0, connection_1.query)('DELETE FROM responsaveis WHERE id = $1', [id]);
        logger_1.logger.info(`Responsável deletado: ${id}`);
    }
}
exports.responsavelService = new ResponsavelService();
//# sourceMappingURL=responsavelService.js.map