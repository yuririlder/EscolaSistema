import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authService, usuarioService } from '../services';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';
import { logger } from '../utils/logger';
import { query, queryOne } from '../database/connection';

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return sendError(res, 'E-mail e senha são obrigatórios', 400);
      }

      const result = await authService.login({ email, senha });
      return sendSuccess(res, result, 'Login realizado com sucesso');
    } catch (error: any) {
      logger.error('Erro no login', error);
      return sendUnauthorized(res, error.message || 'Credenciais inválidas');
    }
  }

  async me(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        return sendUnauthorized(res);
      }
      const usuario = await usuarioService.buscarPorId(usuarioId);
      if (!usuario) {
        return sendUnauthorized(res, 'Usuário não encontrado');
      }
      return sendSuccess(res, {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      });
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async setup(req: Request, res: Response) {
    try {
      // Verificar se já existe algum usuário
      const existingUser = await queryOne('SELECT id FROM usuarios LIMIT 1');
      
      if (existingUser) {
        return sendError(res, 'Setup já foi realizado. Sistema já possui usuários cadastrados.', 400);
      }

      // Verificar se já existe escola, senão criar
      let escola = await queryOne('SELECT * FROM escolas LIMIT 1');
      
      if (!escola) {
        const escolaResult = await query(
          `INSERT INTO escolas (nome, cnpj, telefone, email, endereco, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
          ['Escola Padrão', '00.000.000/0001-00', '(00) 0000-0000', 'escola@exemplo.com', 'Endereço da Escola']
        );
        escola = escolaResult.rows[0];
      }

      // Criar usuário admin
      const senhaHash = await bcrypt.hash('admin123', 10);
      await query(
        `INSERT INTO usuarios (nome, email, senha, perfil, ativo, escola_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
        ['Administrador', 'admin@escola.com', senhaHash, 'Diretor', true, escola.id]
      );

      // Verificar se já existem planos, senão criar
      const existingPlanos = await queryOne('SELECT id FROM planos_mensalidade LIMIT 1');
      
      if (!existingPlanos) {
        await query(
          `INSERT INTO planos_mensalidade (nome, valor, descricao, ativo, escola_id, created_at, updated_at)
           VALUES 
             ($1, $2, $3, $4, $5, NOW(), NOW()),
             ($6, $7, $8, $9, $10, NOW(), NOW()),
             ($11, $12, $13, $14, $15, NOW(), NOW())`,
          [
            'Plano Básico', 500.00, 'Plano básico de mensalidade', true, escola.id,
            'Plano Intermediário', 750.00, 'Plano intermediário de mensalidade', true, escola.id,
            'Plano Premium', 1000.00, 'Plano premium de mensalidade', true, escola.id
          ]
        );
      }

      logger.info('Setup inicial realizado com sucesso');

      return sendSuccess(res, {
        message: 'Setup realizado com sucesso!',
        admin: {
          email: 'admin@escola.com',
          senha: 'admin123'
        }
      }, 'Setup inicial concluído');
    } catch (error: any) {
      logger.error('Erro no setup inicial', error);
      return sendError(res, error.message || 'Erro ao realizar setup inicial', 500);
    }
  }
}

export const authController = new AuthController();
