import { StatusMatricula } from '../enums';

export interface MatriculaProps {
  id?: string;
  alunoId: string;
  planoId: string;
  anoLetivo: number;
  valorMatricula: number;
  valorMensalidade: number;
  diaVencimento?: number;
  dataMatricula?: Date;
  status?: StatusMatricula;
  observacoes?: string;
  desconto?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Matricula {
  private props: MatriculaProps;

  constructor(props: MatriculaProps) {
    this.validar(props);
    this.props = {
      ...props,
      diaVencimento: props.diaVencimento ?? 10,
      dataMatricula: props.dataMatricula ?? new Date(),
      status: props.status ?? StatusMatricula.ATIVA,
      desconto: props.desconto ?? 0,
    };
  }

  private validar(props: MatriculaProps): void {
    if (!props.alunoId) {
      throw new Error('Aluno é obrigatório');
    }
    if (!props.planoId) {
      throw new Error('Plano é obrigatório');
    }
    if (!props.anoLetivo || props.anoLetivo < 2000) {
      throw new Error('Ano letivo inválido');
    }
    if (props.valorMatricula === undefined || props.valorMatricula < 0) {
      throw new Error('Valor da matrícula inválido');
    }
    if (props.valorMensalidade === undefined || props.valorMensalidade < 0) {
      throw new Error('Valor da mensalidade inválido');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get alunoId(): string {
    return this.props.alunoId;
  }

  get planoId(): string {
    return this.props.planoId;
  }

  get anoLetivo(): number {
    return this.props.anoLetivo;
  }

  get valorMatricula(): number {
    return this.props.valorMatricula;
  }

  get valorMensalidade(): number {
    return this.props.valorMensalidade;
  }

  get valorMensalidadeComDesconto(): number {
    return this.props.valorMensalidade - (this.props.desconto ?? 0);
  }

  get diaVencimento(): number {
    return this.props.diaVencimento ?? 10;
  }

  get status(): StatusMatricula {
    return this.props.status ?? StatusMatricula.ATIVA;
  }

  get desconto(): number {
    return this.props.desconto ?? 0;
  }

  cancelar(): void {
    this.props.status = StatusMatricula.CANCELADA;
  }

  trancar(): void {
    this.props.status = StatusMatricula.TRANCADA;
  }

  concluir(): void {
    this.props.status = StatusMatricula.CONCLUIDA;
  }

  toJSON(): MatriculaProps {
    return { ...this.props };
  }
}
