export interface AlunoProps {
  id?: string;
  nome: string;
  cpf?: string;
  rg?: string;
  dataNascimento: Date;
  sexo?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  responsavelId: string;
  turmaId?: string;
  matriculaAtiva?: boolean;
  dataMatricula?: Date;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Aluno {
  private props: AlunoProps;

  constructor(props: AlunoProps) {
    this.validar(props);
    this.props = {
      ...props,
      matriculaAtiva: props.matriculaAtiva ?? false,
    };
  }

  private validar(props: AlunoProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    if (!props.dataNascimento) {
      throw new Error('Data de nascimento é obrigatória');
    }
    if (!props.responsavelId) {
      throw new Error('Responsável é obrigatório');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get nome(): string {
    return this.props.nome;
  }

  get cpf(): string | undefined {
    return this.props.cpf;
  }

  get dataNascimento(): Date {
    return this.props.dataNascimento;
  }

  get responsavelId(): string {
    return this.props.responsavelId;
  }

  get turmaId(): string | undefined {
    return this.props.turmaId;
  }

  get matriculaAtiva(): boolean {
    return this.props.matriculaAtiva ?? false;
  }

  vincularTurma(turmaId: string): void {
    this.props.turmaId = turmaId;
  }

  desvincularTurma(): void {
    this.props.turmaId = undefined;
  }

  ativarMatricula(data: Date): void {
    this.props.matriculaAtiva = true;
    this.props.dataMatricula = data;
  }

  cancelarMatricula(): void {
    this.props.matriculaAtiva = false;
  }

  toJSON(): AlunoProps {
    return { ...this.props };
  }
}
