"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notaService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class NotaService {
    async criar(data) {
        // Verificar se aluno existe
        const aluno = await (0, connection_1.queryOne)('SELECT id, turma_id FROM alunos WHERE id = $1', [data.aluno_id]);
        if (!aluno) {
            throw new Error('Aluno não encontrado');
        }
        const turmaId = data.turma_id || aluno.turma_id;
        if (!turmaId) {
            throw new Error('Aluno não está vinculado a uma turma');
        }
        // Verificar se já existe nota para atualizar
        const notaExistente = await (0, connection_1.queryOne)('SELECT id FROM notas WHERE aluno_id = $1 AND turma_id = $2 AND disciplina = $3 AND bimestre = $4 AND tipo = $5', [data.aluno_id, turmaId, data.disciplina, data.bimestre, data.tipo]);
        if (notaExistente) {
            await (0, connection_1.query)("UPDATE notas SET nota = $1, observacao = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3", [data.nota, data.observacao, notaExistente.id]);
            logger_1.logger.info(`Nota atualizada para aluno ${data.aluno_id}`);
            return this.buscarPorId(notaExistente.id);
        }
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO notas (id, aluno_id, turma_id, disciplina, bimestre, nota, tipo, observacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, data.aluno_id, turmaId, data.disciplina, data.bimestre, data.nota, data.tipo, data.observacao]);
        logger_1.logger.info(`Nota lançada para aluno ${data.aluno_id}`);
        return this.buscarPorId(id);
    }
    async buscarTodas() {
        return await (0, connection_1.queryMany)(`SELECT n.*, a.nome as aluno_nome, t.nome as turma_nome
       FROM notas n
       INNER JOIN alunos a ON n.aluno_id = a.id
       INNER JOIN turmas t ON n.turma_id = t.id
       ORDER BY a.nome ASC, n.disciplina ASC, n.bimestre ASC`);
    }
    async buscarPorId(id) {
        return await (0, connection_1.queryOne)(`SELECT n.*, a.nome as aluno_nome, t.nome as turma_nome
       FROM notas n
       INNER JOIN alunos a ON n.aluno_id = a.id
       INNER JOIN turmas t ON n.turma_id = t.id
       WHERE n.id = $1`, [id]);
    }
    async buscarPorAluno(alunoId) {
        return await (0, connection_1.queryMany)(`SELECT n.*, t.nome as turma_nome
       FROM notas n
       INNER JOIN turmas t ON n.turma_id = t.id
       WHERE n.aluno_id = $1
       ORDER BY n.disciplina ASC, n.bimestre ASC`, [alunoId]);
    }
    async buscarPorTurma(turmaId) {
        return await (0, connection_1.queryMany)(`SELECT n.*, a.nome as aluno_nome
       FROM notas n
       INNER JOIN alunos a ON n.aluno_id = a.id
       WHERE n.turma_id = $1
       ORDER BY a.nome ASC, n.disciplina ASC, n.bimestre ASC`, [turmaId]);
    }
    async obterBoletim(alunoId) {
        const aluno = await (0, connection_1.queryOne)(`SELECT a.*, t.nome as turma_nome
       FROM alunos a
       LEFT JOIN turmas t ON a.turma_id = t.id
       WHERE a.id = $1`, [alunoId]);
        if (!aluno) {
            throw new Error('Aluno não encontrado');
        }
        const notas = await this.buscarPorAluno(alunoId);
        // Agrupar notas por disciplina
        const disciplinas = {};
        for (const nota of notas) {
            if (!disciplinas[nota.disciplina]) {
                disciplinas[nota.disciplina] = {
                    disciplina: nota.disciplina,
                    notas: [],
                    media: 0
                };
            }
            disciplinas[nota.disciplina].notas.push({
                bimestre: nota.bimestre,
                nota: nota.nota,
                tipo: nota.tipo
            });
        }
        // Calcular médias
        for (const disc of Object.values(disciplinas)) {
            if (disc.notas.length > 0) {
                const soma = disc.notas.reduce((acc, n) => acc + parseFloat(n.nota), 0);
                disc.media = soma / disc.notas.length;
            }
        }
        return {
            aluno,
            disciplinas: Object.values(disciplinas)
        };
    }
    async atualizar(id, data) {
        const nota = await this.buscarPorId(id);
        if (!nota) {
            throw new Error('Nota não encontrada');
        }
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const campos = ['disciplina', 'bimestre', 'nota', 'tipo', 'observacao'];
        for (const campo of campos) {
            if (data[campo] !== undefined) {
                fields.push(`${campo} = $${paramIndex++}`);
                values.push(data[campo]);
            }
        }
        if (fields.length === 0) {
            return nota;
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await (0, connection_1.query)(`UPDATE notas SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
        logger_1.logger.info(`Nota atualizada: ${id}`);
        return this.buscarPorId(id);
    }
    async deletar(id) {
        const nota = await this.buscarPorId(id);
        if (!nota) {
            throw new Error('Nota não encontrada');
        }
        await (0, connection_1.query)('DELETE FROM notas WHERE id = $1', [id]);
        logger_1.logger.info(`Nota deletada: ${id}`);
    }
}
exports.notaService = new NotaService();
//# sourceMappingURL=notaService.js.map