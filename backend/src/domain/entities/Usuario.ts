import { PerfilUsuario } from '../enums';

export interface UsuarioProps {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  ativo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Usuario {
  private props: UsuarioProps;

  constructor(props: UsuarioProps) {
    this.validar(props);
    this.props = {
      ...props,
      ativo: props.ativo ?? true,
    };
  }

  private validar(props: UsuarioProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    if (!props.email || !this.validarEmail(props.email)) {
      throw new Error('Email inválido');
    }
    if (!props.senha || props.senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    if (!Object.values(PerfilUsuario).includes(props.perfil)) {
      throw new Error('Perfil inválido');
    }
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): string {
    return this.props.email;
  }

  get senha(): string {
    return this.props.senha;
  }

  get perfil(): PerfilUsuario {
    return this.props.perfil;
  }

  get ativo(): boolean {
    return this.props.ativo ?? true;
  }

  podeGerenciarUsuarios(): boolean {
    return this.props.perfil === PerfilUsuario.DIRETOR;
  }

  podeGerenciarFinanceiro(): boolean {
    return [PerfilUsuario.DIRETOR, PerfilUsuario.SECRETARIO].includes(this.props.perfil);
  }

  podeVisualizarNotas(): boolean {
    return true; // Todos os perfis podem visualizar
  }

  toJSON(): Omit<UsuarioProps, 'senha'> {
    const { senha, ...rest } = this.props;
    return rest;
  }
}
