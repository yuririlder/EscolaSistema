import { StatusMensalidade } from '../enums';

export interface MensalidadeProps {
  id?: string;
  alunoId: string;
  matriculaId: string;
  mesReferencia: number;
  anoReferencia: number;
  valor: number;
  valorPago?: number;
  desconto?: number;
  multa?: number;
  juros?: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status?: StatusMensalidade;
  formaPagamento?: string;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Mensalidade {
  private props: MensalidadeProps;

  constructor(props: MensalidadeProps) {
    this.validar(props);
    this.props = {
      ...props,
      desconto: props.desconto ?? 0,
      multa: props.multa ?? 0,
      juros: props.juros ?? 0,
      status: props.status ?? StatusMensalidade.PENDENTE,
    };
  }

  private validar(props: MensalidadeProps): void {
    if (!props.alunoId) {
      throw new Error('Aluno é obrigatório');
    }
    if (!props.matriculaId) {
      throw new Error('Matrícula é obrigatória');
    }
    if (!props.mesReferencia || props.mesReferencia < 1 || props.mesReferencia > 12) {
      throw new Error('Mês de referência inválido');
    }
    if (!props.anoReferencia || props.anoReferencia < 2000) {
      throw new Error('Ano de referência inválido');
    }
    if (props.valor === undefined || props.valor < 0) {
      throw new Error('Valor da mensalidade inválido');
    }
    if (!props.dataVencimento) {
      throw new Error('Data de vencimento é obrigatória');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get alunoId(): string {
    return this.props.alunoId;
  }

  get matriculaId(): string {
    return this.props.matriculaId;
  }

  get mesReferencia(): number {
    return this.props.mesReferencia;
  }

  get anoReferencia(): number {
    return this.props.anoReferencia;
  }

  get valor(): number {
    return this.props.valor;
  }

  get valorTotal(): number {
    return this.props.valor - (this.props.desconto ?? 0) + (this.props.multa ?? 0) + (this.props.juros ?? 0);
  }

  get dataVencimento(): Date {
    return this.props.dataVencimento;
  }

  get status(): StatusMensalidade {
    return this.props.status ?? StatusMensalidade.PENDENTE;
  }

  estaAtrasada(): boolean {
    if (this.props.status === StatusMensalidade.PAGO) return false;
    return new Date() > this.props.dataVencimento;
  }

  registrarPagamento(valor: number, formaPagamento: string, data: Date = new Date()): void {
    this.props.valorPago = valor;
    this.props.formaPagamento = formaPagamento;
    this.props.dataPagamento = data;
    this.props.status = StatusMensalidade.PAGO;
  }

  aplicarMultaJuros(multa: number, juros: number): void {
    this.props.multa = multa;
    this.props.juros = juros;
    if (this.estaAtrasada()) {
      this.props.status = StatusMensalidade.ATRASADO;
    }
  }

  toJSON(): MensalidadeProps {
    return { ...this.props };
  }
}
