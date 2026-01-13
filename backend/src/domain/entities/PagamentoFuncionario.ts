export interface PagamentoFuncionarioProps {
  id?: string;
  funcionarioId: string;
  mesReferencia: number;
  anoReferencia: number;
  salarioBase: number;
  bonus?: number;
  descontos?: number;
  valorLiquido: number;
  dataPagamento?: Date;
  status?: string;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PagamentoFuncionario {
  private props: PagamentoFuncionarioProps;

  constructor(props: PagamentoFuncionarioProps) {
    this.validar(props);
    this.props = {
      ...props,
      bonus: props.bonus ?? 0,
      descontos: props.descontos ?? 0,
      status: props.status ?? 'PENDENTE',
    };
  }

  private validar(props: PagamentoFuncionarioProps): void {
    if (!props.funcionarioId) {
      throw new Error('Funcionário é obrigatório');
    }
    if (!props.mesReferencia || props.mesReferencia < 1 || props.mesReferencia > 12) {
      throw new Error('Mês de referência inválido');
    }
    if (!props.anoReferencia || props.anoReferencia < 2000) {
      throw new Error('Ano de referência inválido');
    }
    if (props.salarioBase === undefined || props.salarioBase < 0) {
      throw new Error('Salário base inválido');
    }
    if (props.valorLiquido === undefined || props.valorLiquido < 0) {
      throw new Error('Valor líquido inválido');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get funcionarioId(): string {
    return this.props.funcionarioId;
  }

  get mesReferencia(): number {
    return this.props.mesReferencia;
  }

  get anoReferencia(): number {
    return this.props.anoReferencia;
  }

  get salarioBase(): number {
    return this.props.salarioBase;
  }

  get valorLiquido(): number {
    return this.props.valorLiquido;
  }

  get status(): string {
    return this.props.status ?? 'PENDENTE';
  }

  static calcularValorLiquido(salarioBase: number, bonus: number, descontos: number): number {
    return salarioBase + bonus - descontos;
  }

  registrarPagamento(data: Date = new Date()): void {
    this.props.dataPagamento = data;
    this.props.status = 'PAGO';
  }

  toJSON(): PagamentoFuncionarioProps {
    return { ...this.props };
  }
}
