import bcrypt from 'bcryptjs';
import { UsuarioRepository } from '../../../infrastructure/repositories';
import { PerfilUsuario } from '../../../domain/enums';

interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

interface AtualizarUsuarioDTO {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: PerfilUsuario;
  ativo?: boolean;
}

export class GerenciarUsuariosUseCase {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  async criar(dados: CriarUsuarioDTO) {
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(dados.email);

    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    return this.usuarioRepository.criar({
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      perfil: dados.perfil,
    });
  }

  async buscarTodos() {
    const usuarios = await this.usuarioRepository.buscarTodos();
    return usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      ativo: u.ativo,
      createdAt: u.createdAt,
    }));
  }

  async buscarPorId(id: string) {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
      createdAt: usuario.createdAt,
    };
  }

  async atualizar(id: string, dados: AtualizarUsuarioDTO) {
    const usuario = await this.usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (dados.email && dados.email !== usuario.email) {
      const emailExistente = await this.usuarioRepository.buscarPorEmail(dados.email);
      if (emailExistente) {
        throw new Error('Email já cadastrado');
      }
    }

    const dadosAtualizados: any = { ...dados };

    if (dados.senha) {
      dadosAtualizados.senha = await bcrypt.hash(dados.senha, 10);
    }

    return this.usuarioRepository.atualizar(id, dadosAtualizados);
  }

  async deletar(id: string) {
    const usuario = await this.usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    await this.usuarioRepository.deletar(id);
  }

  async alterarSenha(id: string, senhaAtual: string, novaSenha: string) {
    const usuario = await this.usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.usuarioRepository.atualizar(id, { senha: senhaHash });
  }
}
