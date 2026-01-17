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

  async buscarTodos() {
    return await queryMany('SELECT * FROM responsaveis ORDER BY nome ASC');
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

    // Verificar se há alunos vinculados
    const alunos = await queryMany('SELECT id FROM alunos WHERE responsavel_id = $1', [id]);
    if (alunos.length > 0) {
      throw new Error('Não é possível excluir responsável com alunos vinculados');
    }

    await query('DELETE FROM responsaveis WHERE id = $1', [id]);
    logger.info(`Responsável deletado: ${id}`);
  }
}

export const responsavelService = new ResponsavelService();
