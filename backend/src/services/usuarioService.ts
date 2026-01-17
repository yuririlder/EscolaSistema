import { query, queryOne, queryMany } from '../database/connection';
import bcrypt from 'bcryptjs';
import { CreateUsuarioDTO } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class UsuarioService {
  async criar(data: CreateUsuarioDTO) {
    // Verificar se email já existe
    const emailExists = await queryOne(
      'SELECT id FROM usuarios WHERE email = $1',
      [data.email]
    );

    if (emailExists) {
      throw new Error('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);
    const id = uuidv4();

    await query(
      `INSERT INTO usuarios (id, nome, email, senha, perfil, ativo)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [id, data.nome, data.email, hashedPassword, data.perfil]
    );

    logger.info(`Usuário criado: ${data.email}`);
    return this.buscarPorId(id);
  }

  async buscarTodos() {
    return await queryMany(
      `SELECT id, nome, email, perfil, ativo, created_at, updated_at
       FROM usuarios ORDER BY nome ASC`
    );
  }

  async buscarPorId(id: string) {
    return await queryOne(
      `SELECT id, nome, email, perfil, ativo, created_at, updated_at
       FROM usuarios WHERE id = $1`,
      [id]
    );
  }

  async buscarPorEmail(email: string) {
    return await queryOne(
      `SELECT id, nome, email, perfil, ativo, created_at, updated_at
       FROM usuarios WHERE email = $1`,
      [email]
    );
  }

  async atualizar(id: string, data: any) {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nome) {
      fields.push(`nome = $${paramIndex++}`);
      values.push(data.nome);
    }
    if (data.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.perfil) {
      fields.push(`perfil = $${paramIndex++}`);
      values.push(data.perfil);
    }
    if (data.ativo !== undefined) {
      fields.push(`ativo = $${paramIndex++}`);
      values.push(data.ativo);
    }

    if (fields.length === 0) {
      return usuario;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    logger.info(`Usuário atualizado: ${id}`);
    return this.buscarPorId(id);
  }

  async alterarSenha(id: string, novaSenha: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    await query(
      "UPDATE usuarios SET senha = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedPassword, id]
    );

    logger.info(`Senha alterada para usuário: ${id}`);
  }

  async deletar(id: string): Promise<void> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    await query('DELETE FROM usuarios WHERE id = $1', [id]);
    logger.info(`Usuário deletado: ${id}`);
  }
}

export const usuarioService = new UsuarioService();
