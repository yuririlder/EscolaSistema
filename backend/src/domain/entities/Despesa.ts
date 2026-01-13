import { StatusDespesa } from '../enums';

export interface DespesaProps {
  id?: string;
  descricao: string;
  categoria: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status?: StatusDespesa;
  fornecedor?: string;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Despesa {
  private props: DespesaProps;

  constructor(props: DespesaProps) {
    this.validar(props);
    this.props = {
      ...props,
      status: props.status ?? StatusDespesa.PENDENTE,
    };
  }

  private validar(props: DespesaProps): void {
    if (!props.descricao || props.descricao.trim().length === 0) {
      throw new Error('Descrição é obrigatória');
    }
    if (!props.categoria || props.categoria.trim().length === 0) {
      throw new Error('Categoria é obrigatória');
    }
    if (props.valor === undefined || props.valor < 0) {
      throw new Error('Valor deve ser maior ou igual a zero');
    }
    if (!props.dataVencimento) {
      throw new Error('Data de vencimento é obrigatória');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get categoria(): string {
    return this.props.categoria;
  }

  get valor(): number {
    return this.props.valor;
  }

  get dataVencimento(): Date {
    return this.props.dataVencimento;
  }

  get status(): StatusDespesa {
    return this.props.status ?? StatusDespesa.PENDENTE;
  }

  registrarPagamento(data: Date = new Date()): void {
    this.props.dataPagamento = data;
    this.props.status = StatusDespesa.PAGO;
  }

  cancelar(): void {
    this.props.status = StatusDespesa.CANCELADO;
  }

  toJSON(): DespesaProps {
    return { ...this.props };
  }
}
