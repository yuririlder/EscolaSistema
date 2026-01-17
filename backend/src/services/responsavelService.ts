import { query, queryOne, queryMany } from '../database/connection';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class ResponsavelService {
  async criar(data: any) {
    // Verificar CPF único
    const cpfExists = await queryOne('SELECT id FROM responsaveis WHERE cpf = $1', [data.cpf]);
    if (cpfExists) {
      throw new Error('CPF já cadastrado');
    }

    const id = uuidv4();
    await query(
      `INSERT INTO responsaveis (id, nome, cpf, rg, data_nascimento, telefone, celular, email, endereco, cidade, estado, cep, profissao, local_trabalho, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [id, data.nome, data.cpf, data.rg, data.data_nascimento, data.telefone, data.celular, data.email, data.endereco, data.cidade, data.estado, data.cep, data.profissao, data.local_trabalho, data.observacoes]
    );
    
    logger.info(`Responsável criado: ${data.nome}`);
    return this.buscarPorId(id);
  }

  async buscarTodos(incluirInativos = false) {
    const whereClause = incluirInativos ? '' : 'WHERE (ativo = true OR ativo IS NULL)';
    return await queryMany(`SELECT * FROM responsaveis ${whereClause} ORDER BY nome ASC`);
  }

  async buscarPorId(id: string) {
    return await queryOne('SELECT * FROM responsaveis WHERE id = $1', [id]);
  }

  async buscarComFilhos(id: string) {
    const responsavel = await this.buscarPorId(id);
    if (!responsavel) return null;

    const filhos = await queryMany(
      `SELECT a.*, t.nome as turma_nome
       FROM alunos a
       LEFT JOIN turmas t ON a.turma_id = t.id
       WHERE a.responsavel_id = $1
       ORDER BY a.nome ASC`,
      [id]
    );

    return { ...responsavel, filhos };
  }

  async atualizar(id: string, data: any) {
    const responsavel = await this.buscarPorId(id);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }

    const fields: string[] = [];
    const values: any[] = [];
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

    await query(
      `UPDATE responsaveis SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    logger.info(`Responsável atualizado: ${id}`);
    return this.buscarPorId(id);
  }

  async deletar(id: string): Promise<void> {
    const responsavel = await this.buscarPorId(id);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }

    // Soft delete - apenas desativa para manter histórico dos alunos
    await query('UPDATE responsaveis SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    logger.info(`Responsável desativado: ${id}`);
  }

  async reativar(id: string): Promise<any> {
    const responsavel = await queryOne('SELECT * FROM responsaveis WHERE id = $1', [id]);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }

    await query('UPDATE responsaveis SET ativo = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    logger.info(`Responsável reativado: ${id}`);
    return this.buscarPorId(id);
  }
}

export const responsavelService = new ResponsavelService();
