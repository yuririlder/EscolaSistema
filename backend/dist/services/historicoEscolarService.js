"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historicoEscolarService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class HistoricoEscolarService {
    /**
     * Vincular aluno a uma turma em um ano letivo específico
     */
    async vincularAlunoTurma(data) {
        // Verificar se aluno existe
        const aluno = await (0, connection_1.queryOne)('SELECT id FROM alunos WHERE id = $1', [data.aluno_id]);
        if (!aluno) {
            throw new Error('Aluno não encontrado');
        }
        // Verificar se turma existe
        const turma = await (0, connection_1.queryOne)('SELECT id, ano FROM turmas WHERE id = $1', [data.turma_id]);
        if (!turma) {
            throw new Error('Turma não encontrada');
        }
        // Verificar se já existe vínculo para este ano letivo
        const vinculoExistente = await (0, connection_1.queryOne)('SELECT id, turma_id FROM historico_escolar WHERE aluno_id = $1 AND ano_letivo = $2', [data.aluno_id, data.ano_letivo]);
        if (vinculoExistente) {
            // Atualizar vínculo existente
            await (0, connection_1.query)(`UPDATE historico_escolar 
         SET turma_id = $1, observacoes = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`, [data.turma_id, data.observacoes, vinculoExistente.id]);
            // Atualizar turma_id na tabela alunos se for o ano atual
            const anoAtual = new Date().getFullYear();
            if (data.ano_letivo === anoAtual) {
                await (0, connection_1.query)('UPDATE alunos SET turma_id = $1 WHERE id = $2', [data.turma_id, data.aluno_id]);
            }
            logger_1.logger.info(`Vínculo aluno-turma atualizado: ${data.aluno_id} -> ${data.turma_id} (${data.ano_letivo})`);
            return this.buscarPorId(vinculoExistente.id);
        }
        // Criar novo vínculo
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO historico_escolar (id, aluno_id, turma_id, ano_letivo, status, observacoes)
       VALUES ($1, $2, $3, $4, 'CURSANDO', $5)`, [id, data.aluno_id, data.turma_id, data.ano_letivo, data.observacoes]);
        // Atualizar turma_id na tabela alunos se for o ano atual
        const anoAtual = new Date().getFullYear();
        if (data.ano_letivo === anoAtual) {
            await (0, connection_1.query)('UPDATE alunos SET turma_id = $1 WHERE id = $2', [data.turma_id, data.aluno_id]);
        }
        logger_1.logger.info(`Aluno ${data.aluno_id} vinculado à turma ${data.turma_id} no ano letivo ${data.ano_letivo}`);
        return this.buscarPorId(id);
    }
    /**
     * Desvincular aluno de uma turma
     */
    async desvincularAlunoTurma(alunoId, anoLetivo) {
        const historico = await (0, connection_1.queryOne)('SELECT id FROM historico_escolar WHERE aluno_id = $1 AND ano_letivo = $2', [alunoId, anoLetivo]);
        if (!historico) {
            throw new Error('Vínculo não encontrado');
        }
        await (0, connection_1.query)(`UPDATE historico_escolar 
       SET status = 'CANCELADO', data_saida = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`, [historico.id]);
        // Se for o ano atual, limpar turma_id do aluno
        const anoAtual = new Date().getFullYear();
        if (anoLetivo === anoAtual) {
            await (0, connection_1.query)('UPDATE alunos SET turma_id = NULL WHERE id = $1', [alunoId]);
        }
        logger_1.logger.info(`Aluno ${alunoId} desvinculado do ano letivo ${anoLetivo}`);
    }
    /**
     * Buscar histórico completo de um aluno
     */
    async buscarHistoricoAluno(alunoId) {
        const historico = await (0, connection_1.queryMany)(`SELECT he.*, 
              t.nome as turma_nome, t.serie as turma_serie, t.turno as turma_turno,
              t.ano as turma_ano
       FROM historico_escolar he
       INNER JOIN turmas t ON he.turma_id = t.id
       WHERE he.aluno_id = $1
       ORDER BY he.ano_letivo DESC`, [alunoId]);
        // Para cada registro do histórico, buscar notas e professores
        const historicoCompleto = await Promise.all(historico.map(async (h) => {
            // Buscar notas do aluno nessa turma
            const notas = await (0, connection_1.queryMany)(`SELECT n.*, 
                  COALESCE(f.nome, 'Professor não identificado') as professor_nome
           FROM notas n
           LEFT JOIN turma_professores tp ON tp.turma_id = n.turma_id AND tp.disciplina = n.disciplina
           LEFT JOIN professores p ON tp.professor_id = p.id
           LEFT JOIN funcionarios f ON p.funcionario_id = f.id
           WHERE n.aluno_id = $1 AND n.turma_id = $2
           ORDER BY n.disciplina, n.bimestre`, [alunoId, h.turma_id]);
            // Buscar professores da turma
            const professores = await (0, connection_1.queryMany)(`SELECT tp.disciplina, f.nome as professor_nome, p.id as professor_id
           FROM turma_professores tp
           INNER JOIN professores p ON tp.professor_id = p.id
           INNER JOIN funcionarios f ON p.funcionario_id = f.id
           WHERE tp.turma_id = $1`, [h.turma_id]);
            return {
                ...h,
                notas,
                professores
            };
        }));
        return historicoCompleto;
    }
    /**
     * Buscar histórico por ID
     */
    async buscarPorId(id) {
        return await (0, connection_1.queryOne)(`SELECT he.*, 
              t.nome as turma_nome, t.serie as turma_serie, t.turno as turma_turno,
              a.nome as aluno_nome
       FROM historico_escolar he
       INNER JOIN turmas t ON he.turma_id = t.id
       INNER JOIN alunos a ON he.aluno_id = a.id
       WHERE he.id = $1`, [id]);
    }
    /**
     * Buscar vínculo atual do aluno (ano corrente)
     */
    async buscarVinculoAtual(alunoId) {
        const anoAtual = new Date().getFullYear();
        return await (0, connection_1.queryOne)(`SELECT he.*, 
              t.nome as turma_nome, t.serie as turma_serie, t.turno as turma_turno
       FROM historico_escolar he
       INNER JOIN turmas t ON he.turma_id = t.id
       WHERE he.aluno_id = $1 AND he.ano_letivo = $2 AND he.status = 'CURSANDO'`, [alunoId, anoAtual]);
    }
    /**
     * Listar alunos por turma e ano letivo
     */
    async listarAlunosPorTurmaAno(turmaId, anoLetivo) {
        return await (0, connection_1.queryMany)(`SELECT he.*, a.nome as aluno_nome, a.data_nascimento, a.cpf,
              r.nome as responsavel_nome, r.telefone as responsavel_telefone
       FROM historico_escolar he
       INNER JOIN alunos a ON he.aluno_id = a.id
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       WHERE he.turma_id = $1 AND he.ano_letivo = $2 AND he.status = 'CURSANDO'
       ORDER BY a.nome`, [turmaId, anoLetivo]);
    }
    /**
     * Atualizar status do histórico (CURSANDO, APROVADO, REPROVADO, TRANSFERIDO)
     */
    async atualizarStatus(id, status, observacoes) {
        const statusValidos = ['CURSANDO', 'APROVADO', 'REPROVADO', 'TRANSFERIDO', 'CANCELADO'];
        if (!statusValidos.includes(status)) {
            throw new Error('Status inválido');
        }
        await (0, connection_1.query)(`UPDATE historico_escolar 
       SET status = $1, observacoes = COALESCE($2, observacoes), 
           data_saida = CASE WHEN $1 != 'CURSANDO' THEN CURRENT_DATE ELSE data_saida END,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`, [status, observacoes, id]);
        logger_1.logger.info(`Status do histórico ${id} atualizado para ${status}`);
        return this.buscarPorId(id);
    }
    /**
     * Buscar todos os históricos (para admin)
     */
    async buscarTodos(anoLetivo) {
        const sql = anoLetivo
            ? `SELECT he.*, 
                t.nome as turma_nome, t.serie as turma_serie, t.turno as turma_turno,
                a.nome as aluno_nome
         FROM historico_escolar he
         INNER JOIN turmas t ON he.turma_id = t.id
         INNER JOIN alunos a ON he.aluno_id = a.id
         WHERE he.ano_letivo = $1
         ORDER BY a.nome`
            : `SELECT he.*, 
                t.nome as turma_nome, t.serie as turma_serie, t.turno as turma_turno,
                a.nome as aluno_nome
         FROM historico_escolar he
         INNER JOIN turmas t ON he.turma_id = t.id
         INNER JOIN alunos a ON he.aluno_id = a.id
         ORDER BY he.ano_letivo DESC, a.nome`;
        return anoLetivo
            ? await (0, connection_1.queryMany)(sql, [anoLetivo])
            : await (0, connection_1.queryMany)(sql);
    }
}
exports.historicoEscolarService = new HistoricoEscolarService();
//# sourceMappingURL=historicoEscolarService.js.map