export interface FuncionarioProps {
  id?: string;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cargo: string;
  salario: number;
  dataContratacao: Date;
  dataDesligamento?: Date;
  ativo?: boolean;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Funcionario {
  private props: FuncionarioProps;

  constructor(props: FuncionarioProps) {
    this.validar(props);
    this.props = {
      ...props,
      ativo: props.ativo ?? true,
    };
  }

  private validar(props: FuncionarioProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    if (!props.cpf || !this.validarCPF(props.cpf)) {
      throw new Error('CPF inválido');
    }
    if (!props.cargo || props.cargo.trim().length === 0) {
      throw new Error('Cargo é obrigatório');
    }
    if (props.salario === undefined || props.salario < 0) {
      throw new Error('Salário deve ser maior ou igual a zero');
    }
    if (!props.dataContratacao) {
      throw new Error('Data de contratação é obrigatória');
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

  get cargo(): string {
    return this.props.cargo;
  }

  get salario(): number {
    return this.props.salario;
  }

  get dataContratacao(): Date {
    return this.props.dataContratacao;
  }

  get ativo(): boolean {
    return this.props.ativo ?? true;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get telefone(): string | undefined {
    return this.props.telefone;
  }

  desligar(data: Date): void {
    this.props.dataDesligamento = data;
    this.props.ativo = false;
  }

  toJSON(): FuncionarioProps {
    return { ...this.props };
  }
}
