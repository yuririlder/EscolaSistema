export interface TurmaProps {
  id?: string;
  nome: string;
  ano: number;
  turno: string;
  serie?: string;
  salaNumero?: string;
  capacidade?: number;
  ativa?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Turma {
  private props: TurmaProps;

  constructor(props: TurmaProps) {
    this.validar(props);
    this.props = {
      ...props,
      capacidade: props.capacidade ?? 30,
      ativa: props.ativa ?? true,
    };
  }

  private validar(props: TurmaProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome da turma é obrigatório');
    }
    if (!props.ano || props.ano < 2000) {
      throw new Error('Ano letivo inválido');
    }
    if (!props.turno || props.turno.trim().length === 0) {
      throw new Error('Turno é obrigatório');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get ano(): number {
    return this.props.ano;
  }

  get turno(): string {
    return this.props.turno;
  }

  get serie(): string | undefined {
    return this.props.serie;
  }

  get capacidade(): number {
    return this.props.capacidade ?? 30;
  }

  get ativa(): boolean {
    return this.props.ativa ?? true;
  }

  desativar(): void {
    this.props.ativa = false;
  }

  ativar(): void {
    this.props.ativa = true;
  }

  toJSON(): TurmaProps {
    return { ...this.props };
  }
}
