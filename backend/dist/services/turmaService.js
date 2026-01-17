"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turmaService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class TurmaService {
    async criar(data) {
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO turmas (id, nome, ano, turno, serie, sala_numero, capacidade, ativa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, data.nome, data.ano, data.turno, data.serie, data.sala_numero, data.capacidade || 30, data.ativa !== false]);
        logger_1.logger.info(`Turma criada: ${data.nome}`);
        return this.buscarPorId(id);
    }
    async buscarTodas() {
        const turmas = await (0, connection_1.queryMany)('SELECT * FROM turmas ORDER BY ano DESC, nome ASC');
        // Buscar professores de todas as turmas de uma vez
        const turmaIds = turmas.map((t) => t.id);
        if (turmaIds.length === 0)
            return turmas;
        const professores = await (0, connection_1.queryMany)(`SELECT tp.turma_id, p.id, f.nome, f.email
       FROM turma_professores tp
       INNER JOIN professores p ON tp.professor_id = p.id
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE tp.turma_id IN (${turmaIds.map((_, i) => `$${i + 1}`).join(', ')})`, turmaIds);
        // Agrupar professores por turma
        const professoresPorTurma = professores.reduce((acc, prof) => {
            if (!acc[prof.turma_id])
                acc[prof.turma_id] = [];
            acc[prof.turma_id].push(prof);
            return acc;
        }, {});
        // Adicionar professores a cada turma
        return turmas.map((turma) => ({
            ...turma,
            professores: professoresPorTurma[turma.id] || []
        }));
    }
    async buscarAtivas() {
        const turmas = await (0, connection_1.queryMany)('SELECT * FROM turmas WHERE ativa = true ORDER BY ano DESC, nome ASC');
        const turmaIds = turmas.map((t) => t.id);
        if (turmaIds.length === 0)
            return turmas;
        const professores = await (0, connection_1.queryMany)(`SELECT tp.turma_id, p.id, f.nome, f.email
       FROM turma_professores tp
       INNER JOIN professores p ON tp.professor_id = p.id
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE tp.turma_id IN (${turmaIds.map((_, i) => `$${i + 1}`).join(', ')})`, turmaIds);
        const professoresPorTurma = professores.reduce((acc, prof) => {
            if (!acc[prof.turma_id])
                acc[prof.turma_id] = [];
            acc[prof.turma_id].push(prof);
            return acc;
        }, {});
        return turmas.map((turma) => ({
            ...turma,
            professores: professoresPorTurma[turma.id] || []
        }));
    }
    async buscarPorId(id) {
        return await (0, connection_1.queryOne)('SELECT * FROM turmas WHERE id = $1', [id]);
    }
    async buscarComAlunos(id) {
        const turma = await this.buscarPorId(id);
        if (!turma)
            return null;
        const alunos = await (0, connection_1.queryMany)(`SELECT a.*, r.nome as responsavel_nome
       FROM alunos a
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       WHERE a.turma_id = $1
       ORDER BY a.nome ASC`, [id]);
        return { ...turma, alunos };
    }
    async buscarComProfessores(id) {
        const turma = await this.buscarPorId(id);
        if (!turma)
            return null;
        const professores = await (0, connection_1.queryMany)(`SELECT tp.*, p.*, f.nome, f.email, f.telefone
       FROM turma_professores tp
       INNER JOIN professores p ON tp.professor_id = p.id
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE tp.turma_id = $1`, [id]);
        return { ...turma, professores };
    }
    async atualizar(id, data) {
        const turma = await this.buscarPorId(id);
        if (!turma) {
            throw new Error('Turma não encontrada');
        }
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const campos = ['nome', 'ano', 'turno', 'serie', 'sala_numero', 'capacidade', 'ativa'];
        for (const campo of campos) {
            if (data[campo] !== undefined) {
                fields.push(`${campo} = $${paramIndex++}`);
                values.push(data[campo]);
            }
        }
        if (fields.length === 0) {
            return turma;
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await (0, connection_1.query)(`UPDATE turmas SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
        logger_1.logger.info(`Turma atualizada: ${id}`);
        return this.buscarPorId(id);
    }
    async deletar(id) {
        const turma = await this.buscarPorId(id);
        if (!turma) {
            throw new Error('Turma não encontrada');
        }
        // Soft delete - apenas desativa a turma para manter histórico
        await (0, connection_1.query)('UPDATE turmas SET ativa = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        logger_1.logger.info(`Turma desativada: ${id}`);
    }
    async reativar(id) {
        const turma = await (0, connection_1.queryOne)('SELECT * FROM turmas WHERE id = $1', [id]);
        if (!turma) {
            throw new Error('Turma não encontrada');
        }
        await (0, connection_1.query)('UPDATE turmas SET ativa = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        logger_1.logger.info(`Turma reativada: ${id}`);
        return this.buscarPorId(id);
    }
    async vincularProfessor(turmaId, professorId, disciplina) {
        const turma = await this.buscarPorId(turmaId);
        if (!turma) {
            throw new Error('Turma não encontrada');
        }
        const professor = await (0, connection_1.queryOne)('SELECT id FROM professores WHERE id = $1', [professorId]);
        if (!professor) {
            throw new Error('Professor não encontrado');
        }
        const id = (0, uuid_1.v4)();
        try {
            await (0, connection_1.query)(`INSERT INTO turma_professores (id, professor_id, turma_id, disciplina)
         VALUES ($1, $2, $3, $4)`, [id, professorId, turmaId, disciplina]);
            logger_1.logger.info(`Professor ${professorId} vinculado à turma ${turmaId}`);
        }
        catch (e) {
            if (e.message.includes('UNIQUE constraint failed') || e.code === '23505') {
                throw new Error('Professor já está vinculado a esta turma');
            }
            throw e;
        }
    }
    async desvincularProfessor(turmaId, professorId) {
        const result = await (0, connection_1.query)('DELETE FROM turma_professores WHERE turma_id = $1 AND professor_id = $2', [turmaId, professorId]);
        logger_1.logger.info(`Professor ${professorId} desvinculado da turma ${turmaId}`);
    }
}
exports.turmaService = new TurmaService();
//# sourceMappingURL=turmaService.js.map