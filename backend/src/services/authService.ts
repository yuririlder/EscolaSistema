import { queryOne } from '../database/connection';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { LoginDTO, LoginResponse } from '../types';
import { logger } from '../utils/logger';

class AuthService {
  async login(data: LoginDTO): Promise<LoginResponse> {
    const { email, senha } = data;

    const usuario = await queryOne(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
      [email]
    );

    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const signOptions: SignOptions = { expiresIn: '7d' };
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET || 'secret',
      signOptions
    );

    logger.info(`Login realizado: ${usuario.email}`);

    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      token,
      usuario: usuarioSemSenha
    };
  }

  async verificarToken(token: string): Promise<any | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      
      const usuario = await queryOne(
        'SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = $1',
        [decoded.id]
      );

      return usuario || null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
