"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professorService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class ProfessorService {
    async criar(data) {
        const client = await connection_1.pool.connect();
        try {
            await client.query('BEGIN');
            const funcionarioId = (0, uuid_1.v4)();
            const professorId = (0, uuid_1.v4)();
            // Usar data atual se não informada
            const dataContratacao = data.data_contratacao || new Date().toISOString().split('T')[0];
            // Criar funcionário primeiro
            await client.query(`INSERT INTO funcionarios (id, nome, cpf, rg, data_nascimento, telefone, email, endereco, cidade, estado, cep, cargo, salario, data_contratacao, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, [funcionarioId, data.nome, data.cpf, data.rg, data.data_nascimento, data.telefone, data.email, data.endereco, data.cidade, data.estado, data.cep, data.cargo || 'Professor', data.salario || 0, dataContratacao, data.observacoes]);
            // Criar professor
            await client.query(`INSERT INTO professores (id, funcionario_id, formacao, especialidade)
         VALUES ($1, $2, $3, $4)`, [professorId, funcionarioId, data.formacao, data.especialidade]);
            await client.query('COMMIT');
            logger_1.logger.info(`Professor criado: ${data.nome}`);
            return this.buscarPorId(professorId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async buscarTodos() {
        return await (0, connection_1.queryMany)(`SELECT p.*, 
              f.nome, f.cpf, f.rg, f.data_nascimento, f.telefone, f.email, f.endereco, 
              f.cidade, f.estado, f.cep, f.cargo, f.salario, f.data_contratacao, f.ativo, f.observacoes
       FROM professores p
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       ORDER BY f.nome ASC`);
    }
    async buscarAtivos() {
        return await (0, connection_1.queryMany)(`SELECT p.*, 
              f.nome, f.cpf, f.rg, f.data_nascimento, f.telefone, f.email, f.endereco, 
              f.cidade, f.estado, f.cep, f.cargo, f.salario, f.data_contratacao, f.ativo, f.observacoes
       FROM professores p
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE f.ativo = true
       ORDER BY f.nome ASC`);
    }
    async buscarPorId(id) {
        const professor = await (0, connection_1.queryOne)(`SELECT p.*, 
              f.nome, f.cpf, f.rg, f.data_nascimento, f.telefone, f.email, f.endereco, 
              f.cidade, f.estado, f.cep, f.cargo, f.salario, f.data_contratacao, f.ativo, f.observacoes
       FROM professores p
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE p.id = $1`, [id]);
        if (professor) {
            // Buscar turmas do professor
            const turmas = await (0, connection_1.queryMany)(`SELECT tp.*, t.nome as turma_nome, t.ano, t.turno, t.serie
         FROM turma_professores tp
         INNER JOIN turmas t ON tp.turma_id = t.id
         WHERE tp.professor_id = $1`, [id]);
            return { ...professor, turmas };
        }
        return professor;
    }
    async atualizar(id, data) {
        const professor = await this.buscarPorId(id);
        if (!professor) {
            throw new Error('Professor não encontrado');
        }
        const client = await connection_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Atualizar funcionário
            const funcFields = [];
            const funcValues = [];
            let paramIndex = 1;
            const funcCampos = ['nome', 'cpf', 'rg', 'data_nascimento', 'telefone', 'email', 'endereco', 'cidade', 'estado', 'cep', 'cargo', 'salario', 'data_contratacao', 'ativo', 'observacoes'];
            for (const campo of funcCampos) {
                if (data[campo] !== undefined) {
                    funcFields.push(`${campo} = $${paramIndex++}`);
                    funcValues.push(data[campo]);
                }
            }
            if (funcFields.length > 0) {
                funcFields.push(`updated_at = CURRENT_TIMESTAMP`);
                funcValues.push(professor.funcionario_id);
                await client.query(`UPDATE funcionarios SET ${funcFields.join(', ')} WHERE id = $${paramIndex}`, funcValues);
            }
            // Atualizar professor
            const profFields = [];
            const profValues = [];
            paramIndex = 1;
            if (data.formacao !== undefined) {
                profFields.push(`formacao = $${paramIndex++}`);
                profValues.push(data.formacao);
            }
            if (data.especialidade !== undefined) {
                profFields.push(`especialidade = $${paramIndex++}`);
                profValues.push(data.especialidade);
            }
            if (profFields.length > 0) {
                profFields.push(`updated_at = CURRENT_TIMESTAMP`);
                profValues.push(id);
                await client.query(`UPDATE professores SET ${profFields.join(', ')} WHERE id = $${paramIndex}`, profValues);
            }
            await client.query('COMMIT');
            logger_1.logger.info(`Professor atualizado: ${id}`);
            return this.buscarPorId(id);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deletar(id) {
        const professor = await this.buscarPorId(id);
        if (!professor) {
            throw new Error('Professor não encontrado');
        }
        // Deletar professor e funcionário
        await (0, connection_1.query)('DELETE FROM professores WHERE id = $1', [id]);
        await (0, connection_1.query)('DELETE FROM funcionarios WHERE id = $1', [professor.funcionario_id]);
        logger_1.logger.info(`Professor deletado: ${id}`);
    }
    async vincularTurma(professorId, turmaId, disciplina) {
        const id = (0, uuid_1.v4)();
        try {
            await (0, connection_1.query)(`INSERT INTO turma_professores (id, professor_id, turma_id, disciplina)
         VALUES ($1, $2, $3, $4)`, [id, professorId, turmaId, disciplina]);
            logger_1.logger.info(`Professor ${professorId} vinculado à turma ${turmaId}`);
        }
        catch (e) {
            if (!e.message.includes('duplicate key') && e.code !== '23505') {
                throw e;
            }
        }
    }
    async desvincularTurma(professorId, turmaId) {
        await (0, connection_1.query)('DELETE FROM turma_professores WHERE professor_id = $1 AND turma_id = $2', [professorId, turmaId]);
        logger_1.logger.info(`Professor ${professorId} desvinculado da turma ${turmaId}`);
    }
}
exports.professorService = new ProfessorService();
//# sourceMappingURL=professorService.js.map