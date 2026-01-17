import { query, queryOne, queryMany } from '../database/connection';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class TurmaService {
  async criar(data: any) {
    const id = uuidv4();
    await query(
      `INSERT INTO turmas (id, nome, ano, turno, serie, sala_numero, capacidade, ativa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, data.nome, data.ano, data.turno, data.serie, data.sala_numero, data.capacidade || 30, data.ativa !== false]
    );
    
    logger.info(`Turma criada: ${data.nome}`);
    return this.buscarPorId(id);
  }

  async buscarTodas() {
    const turmas = await queryMany('SELECT * FROM turmas ORDER BY ano DESC, nome ASC');
    
    // Buscar professores de todas as turmas de uma vez
    const turmaIds = turmas.map((t: any) => t.id);
    if (turmaIds.length === 0) return turmas;

    const professores = await queryMany(
      `SELECT tp.turma_id, p.id, f.nome, f.email
       FROM turma_professores tp
       INNER JOIN professores p ON tp.professor_id = p.id
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE tp.turma_id IN (${turmaIds.map((_: any, i: number) => `$${i + 1}`).join(', ')})`,
      turmaIds
    );

    // Agrupar professores por turma
    const professoresPorTurma = professores.reduce((acc: any, prof: any) => {
      if (!acc[prof.turma_id]) acc[prof.turma_id] = [];
      acc[prof.turma_id].push(prof);
      return acc;
    }, {});

    // Adicionar professores a cada turma
    return turmas.map((turma: any) => ({
      ...turma,
      professores: professoresPorTurma[turma.id] || []
    }));
  }

  async buscarAtivas() {
    const turmas = await queryMany('SELECT * FROM turmas WHERE ativa = true ORDER BY ano DESC, nome ASC');
    
    const turmaIds = turmas.map((t: any) => t.id);
    if (turmaIds.length === 0) return turmas;

    const professores = await queryMany(
      `SELECT tp.turma_id, p.id, f.nome, f.email
       FROM turma_professores tp
       INNER JOIN professores p ON tp.professor_id = p.id
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE tp.turma_id IN (${turmaIds.map((_: any, i: number) => `$${i + 1}`).join(', ')})`,
      turmaIds
    );

    const professoresPorTurma = professores.reduce((acc: any, prof: any) => {
      if (!acc[prof.turma_id]) acc[prof.turma_id] = [];
      acc[prof.turma_id].push(prof);
      return acc;
    }, {});

    return turmas.map((turma: any) => ({
      ...turma,
      professores: professoresPorTurma[turma.id] || []
    }));
  }

  async buscarPorId(id: string) {
    return await queryOne('SELECT * FROM turmas WHERE id = $1', [id]);
  }

  async buscarComAlunos(id: string) {
    const turma = await this.buscarPorId(id);
    if (!turma) return null;

    const alunos = await queryMany(
      `SELECT a.*, r.nome as responsavel_nome
       FROM alunos a
       LEFT JOIN responsaveis r ON a.responsavel_id = r.id
       WHERE a.turma_id = $1
       ORDER BY a.nome ASC`,
      [id]
    );

    return { ...turma, alunos };
  }

  async buscarComProfessores(id: string) {
    const turma = await this.buscarPorId(id);
    if (!turma) return null;

    const professores = await queryMany(
      `SELECT tp.*, p.*, f.nome, f.email, f.telefone
       FROM turma_professores tp
       INNER JOIN professores p ON tp.professor_id = p.id
       INNER JOIN funcionarios f ON p.funcionario_id = f.id
       WHERE tp.turma_id = $1`,
      [id]
    );

    return { ...turma, professores };
  }

  async atualizar(id: string, data: any) {
    const turma = await this.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    const fields: string[] = [];
    const values: any[] = [];
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

    await query(
      `UPDATE turmas SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    logger.info(`Turma atualizada: ${id}`);
    return this.buscarPorId(id);
  }

  async deletar(id: string): Promise<void> {
    const turma = await this.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    // Soft delete - apenas desativa a turma para manter histórico
    await query('UPDATE turmas SET ativa = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    logger.info(`Turma desativada: ${id}`);
  }

  async reativar(id: string): Promise<any> {
    const turma = await queryOne('SELECT * FROM turmas WHERE id = $1', [id]);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    await query('UPDATE turmas SET ativa = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    logger.info(`Turma reativada: ${id}`);
    return this.buscarPorId(id);
  }

  async vincularProfessor(turmaId: string, professorId: string, disciplina?: string): Promise<void> {
    const turma = await this.buscarPorId(turmaId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    const professor = await queryOne('SELECT id FROM professores WHERE id = $1', [professorId]);
    if (!professor) {
      throw new Error('Professor não encontrado');
    }

    const id = uuidv4();
    try {
      await query(
        `INSERT INTO turma_professores (id, professor_id, turma_id, disciplina)
         VALUES ($1, $2, $3, $4)`,
        [id, professorId, turmaId, disciplina]
      );
      logger.info(`Professor ${professorId} vinculado à turma ${turmaId}`);
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed') || e.code === '23505') {
        throw new Error('Professor já está vinculado a esta turma');
      }
      throw e;
    }
  }

  async desvincularProfessor(turmaId: string, professorId: string): Promise<void> {
    const result = await query(
      'DELETE FROM turma_professores WHERE turma_id = $1 AND professor_id = $2',
      [turmaId, professorId]
    );
    logger.info(`Professor ${professorId} desvinculado da turma ${turmaId}`);
  }
}

export const turmaService = new TurmaService();
