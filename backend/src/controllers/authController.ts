import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authService, usuarioService } from '../services';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';
import { logger } from '../utils/logger';
import db from '../database/connection';

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
      const existingUsers = await db('usuarios').select('id').limit(1);
      
      if (existingUsers.length > 0) {
        return sendError(res, 'Setup já foi realizado. Sistema já possui usuários cadastrados.', 400);
      }

      // Criar escola padrão
      const [escola] = await db('escolas').insert({
        nome: 'Escola Padrão',
        cnpj: '00.000.000/0001-00',
        telefone: '(00) 0000-0000',
        email: 'escola@exemplo.com',
        endereco: 'Endereço da Escola',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      // Criar usuário admin
      const senhaHash = await bcrypt.hash('admin123', 10);
      const [admin] = await db('usuarios').insert({
        nome: 'Administrador',
        email: 'admin@escola.com',
        senha: senhaHash,
        perfil: 'Diretor',
        ativo: true,
        escola_id: escola.id,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      // Criar planos de mensalidade padrão
      await db('planos_mensalidade').insert([
        {
          nome: 'Plano Básico',
          valor: 500.00,
          descricao: 'Plano básico de mensalidade',
          ativo: true,
          escola_id: escola.id,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nome: 'Plano Intermediário',
          valor: 750.00,
          descricao: 'Plano intermediário de mensalidade',
          ativo: true,
          escola_id: escola.id,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nome: 'Plano Premium',
          valor: 1000.00,
          descricao: 'Plano premium de mensalidade',
          ativo: true,
          escola_id: escola.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

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
