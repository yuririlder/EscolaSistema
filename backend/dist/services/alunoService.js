"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alunoService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class AlunoService {
    async criar(data) {
        // Verificar CPF único se fornecido
        if (data.cpf) {
            const cpfExists = await (0, connection_1.queryOne)('SELECT id FROM alunos WHERE cpf = $1', [data.cpf]);
            if (cpfExists) {
                throw new Error('CPF já cadastrado');
            }
        }
        // Verificar se responsável existe
        const responsavel = await (0, connection_1.queryOne)('SELECT id FROM responsaveis WHERE id = $1', [data.responsavel_id]);
        if (!responsavel) {
            throw new Error('Responsável não encontrado');
        }
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO alunos (id, nome, cpf, rg, data_nascimento, sexo, telefone, email, endereco, cidade, estado, cep, responsavel_id, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [id, data.nome, data.cpf, data.rg, data.data_nascimento, data.sexo, data.telefone, data.email, data.endereco, data.cidade, data.estado, data.cep, data.responsavel_id, data.observacoes]);
        logger_1.logger.info(`Aluno criado: ${data.nome}`);
        return this.buscarPorId(id);
    }
    async buscarTodos(incluirInativos = false) {
        const whereClause = incluirInativos ? '' : 'WHERE (a.ativo = true OR a.ativo IS NULL)';
        return await (0, connection_1.queryMany)(`SELECT a.*, r.nome as responsavel_nome, r.telefone as responsavel_telefone, t.nome as turma_nome,
              m.id as matricula_id, 
              COALESCE(SUBSTRING(a.id::text, 1, 8), '') as matricula_numero
       FROM alunos a
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       LEFT JOIN turmas t ON a.turma_id = t.id
       LEFT JOIN matriculas m ON m.aluno_id = a.id AND m.status = 'ATIVA'
       ${whereClause}
       ORDER BY a.nome ASC`);
    }
    async buscarMatriculados() {
        return await (0, connection_1.queryMany)(`SELECT a.*, r.nome as responsavel_nome, t.nome as turma_nome
       FROM alunos a
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       LEFT JOIN turmas t ON a.turma_id = t.id
       WHERE a.matricula_ativa = true AND (a.ativo = true OR a.ativo IS NULL)
       ORDER BY a.nome ASC`);
    }
    async buscarPorResponsavel(responsavelId) {
        return await (0, connection_1.queryMany)(`SELECT a.*, t.nome as turma_nome
       FROM alunos a
       LEFT JOIN turmas t ON a.turma_id = t.id
       WHERE a.responsavel_id = $1
       ORDER BY a.nome ASC`, [responsavelId]);
    }
    async buscarPorTurma(turmaId) {
        return await (0, connection_1.queryMany)(`SELECT a.*, r.nome as responsavel_nome
       FROM alunos a
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       WHERE a.turma_id = $1
       ORDER BY a.nome ASC`, [turmaId]);
    }
    async buscarPorId(id) {
        return await (0, connection_1.queryOne)(`SELECT a.*, r.nome as responsavel_nome, r.telefone as responsavel_telefone, r.email as responsavel_email, t.nome as turma_nome
       FROM alunos a
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       LEFT JOIN turmas t ON a.turma_id = t.id
       WHERE a.id = $1`, [id]);
    }
    async atualizar(id, data) {
        const aluno = await this.buscarPorId(id);
        if (!aluno) {
            throw new Error('Aluno não encontrado');
        }
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const campos = ['nome', 'cpf', 'rg', 'data_nascimento', 'sexo', 'telefone', 'email', 'endereco', 'cidade', 'estado', 'cep', 'responsavel_id', 'turma_id', 'matricula_ativa', 'data_matricula', 'observacoes'];
        for (const campo of campos) {
            if (data[campo] !== undefined) {
                fields.push(`${campo} = $${paramIndex++}`);
                values.push(data[campo]);
            }
        }
        if (fields.length === 0) {
            return aluno;
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await (0, connection_1.query)(`UPDATE alunos SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
        logger_1.logger.info(`Aluno atualizado: ${id}`);
        return this.buscarPorId(id);
    }
    async deletar(id) {
        const aluno = await this.buscarPorId(id);
        if (!aluno) {
            throw new Error('Aluno não encontrado');
        }
        // Soft delete - apenas desativa o aluno para manter histórico
        await (0, connection_1.query)('UPDATE alunos SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        logger_1.logger.info(`Aluno desativado: ${id}`);
    }
    async reativar(id) {
        const aluno = await (0, connection_1.queryOne)('SELECT * FROM alunos WHERE id = $1', [id]);
        if (!aluno) {
            throw new Error('Aluno não encontrado');
        }
        await (0, connection_1.query)('UPDATE alunos SET ativo = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        logger_1.logger.info(`Aluno reativado: ${id}`);
        return this.buscarPorId(id);
    }
    async vincularTurma(alunoId, turmaId) {
        // Verificar se turma existe
        const turma = await (0, connection_1.queryOne)('SELECT id FROM turmas WHERE id = $1', [turmaId]);
        if (!turma) {
            throw new Error('Turma não encontrada');
        }
        await (0, connection_1.query)("UPDATE alunos SET turma_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [turmaId, alunoId]);
        logger_1.logger.info(`Aluno ${alunoId} vinculado à turma ${turmaId}`);
        return this.buscarPorId(alunoId);
    }
    async desvincularTurma(alunoId) {
        await (0, connection_1.query)("UPDATE alunos SET turma_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [alunoId]);
        logger_1.logger.info(`Aluno ${alunoId} desvinculado da turma`);
        return this.buscarPorId(alunoId);
    }
}
exports.alunoService = new AlunoService();
//# sourceMappingURL=alunoService.js.map