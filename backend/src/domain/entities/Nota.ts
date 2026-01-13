export interface NotaProps {
  id?: string;
  alunoId: string;
  turmaId: string;
  disciplina: string;
  bimestre: number;
  nota: number;
  tipo?: string;
  observacao?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Nota {
  private props: NotaProps;

  constructor(props: NotaProps) {
    this.validar(props);
    this.props = props;
  }

  private validar(props: NotaProps): void {
    if (!props.alunoId) {
      throw new Error('Aluno é obrigatório');
    }
    if (!props.turmaId) {
      throw new Error('Turma é obrigatória');
    }
    if (!props.disciplina || props.disciplina.trim().length === 0) {
      throw new Error('Disciplina é obrigatória');
    }
    if (!props.bimestre || props.bimestre < 1 || props.bimestre > 4) {
      throw new Error('Bimestre deve ser entre 1 e 4');
    }
    if (props.nota === undefined || props.nota < 0 || props.nota > 10) {
      throw new Error('Nota deve ser entre 0 e 10');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get alunoId(): string {
    return this.props.alunoId;
  }

  get turmaId(): string {
    return this.props.turmaId;
  }

  get disciplina(): string {
    return this.props.disciplina;
  }

  get bimestre(): number {
    return this.props.bimestre;
  }

  get nota(): number {
    return this.props.nota;
  }

  get tipo(): string | undefined {
    return this.props.tipo;
  }

  atualizarNota(novaNota: number): void {
    if (novaNota < 0 || novaNota > 10) {
      throw new Error('Nota deve ser entre 0 e 10');
    }
    this.props.nota = novaNota;
  }

  toJSON(): NotaProps {
    return { ...this.props };
  }
}
