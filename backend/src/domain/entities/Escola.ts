export interface EscolaProps {
  id?: string;
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  diretor?: string;
  secretario?: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Escola {
  private props: EscolaProps;

  constructor(props: EscolaProps) {
    this.validar(props);
    this.props = props;
  }

  private validar(props: EscolaProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome da escola é obrigatório');
    }
    if (!props.cnpj || props.cnpj.trim().length === 0) {
      throw new Error('CNPJ é obrigatório');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get cnpj(): string {
    return this.props.cnpj;
  }

  get telefone(): string | undefined {
    return this.props.telefone;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get endereco(): string | undefined {
    return this.props.endereco;
  }

  get cidade(): string | undefined {
    return this.props.cidade;
  }

  get estado(): string | undefined {
    return this.props.estado;
  }

  get cep(): string | undefined {
    return this.props.cep;
  }

  get diretor(): string | undefined {
    return this.props.diretor;
  }

  get secretario(): string | undefined {
    return this.props.secretario;
  }

  get logo(): string | undefined {
    return this.props.logo;
  }

  toJSON(): EscolaProps {
    return { ...this.props };
  }
}
