export interface ResponsavelProps {
  id?: string;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: Date;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  profissao?: string;
  localTrabalho?: string;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Responsavel {
  private props: ResponsavelProps;

  constructor(props: ResponsavelProps) {
    this.validar(props);
    this.props = props;
  }

  private validar(props: ResponsavelProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    if (!props.cpf || !this.validarCPF(props.cpf)) {
      throw new Error('CPF inválido');
    }
  }

  private validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get cpf(): string {
    return this.props.cpf;
  }

  get telefone(): string | undefined {
    return this.props.telefone;
  }

  get celular(): string | undefined {
    return this.props.celular;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get endereco(): string | undefined {
    return this.props.endereco;
  }

  toJSON(): ResponsavelProps {
    return { ...this.props };
  }
}
