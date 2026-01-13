export interface PlanoMensalidadeProps {
  id?: string;
  nome: string;
  descricao?: string;
  valor: number;
  ativo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PlanoMensalidade {
  private props: PlanoMensalidadeProps;

  constructor(props: PlanoMensalidadeProps) {
    this.validar(props);
    this.props = {
      ...props,
      ativo: props.ativo ?? true,
    };
  }

  private validar(props: PlanoMensalidadeProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome do plano é obrigatório');
    }
    if (props.valor === undefined || props.valor < 0) {
      throw new Error('Valor deve ser maior ou igual a zero');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string | undefined {
    return this.props.descricao;
  }

  get valor(): number {
    return this.props.valor;
  }

  get ativo(): boolean {
    return this.props.ativo ?? true;
  }

  atualizarValor(novoValor: number): void {
    if (novoValor < 0) {
      throw new Error('Valor deve ser maior ou igual a zero');
    }
    this.props.valor = novoValor;
  }

  toJSON(): PlanoMensalidadeProps {
    return { ...this.props };
  }
}
