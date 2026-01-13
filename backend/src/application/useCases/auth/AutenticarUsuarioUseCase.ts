import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../../../infrastructure/repositories';

interface LoginDTO {
  email: string;
  senha: string;
}

interface LoginResponse {
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
  };
  token: string;
}

export class AutenticarUsuarioUseCase {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  async executar(dados: LoginDTO): Promise<LoginResponse> {
    const usuario = await this.usuarioRepository.buscarPorEmail(dados.email);

    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
      token,
    };
  }
}
