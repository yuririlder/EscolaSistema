// Interface base para repositórios
export interface IRepository<T> {
  criar(entity: T): Promise<T>;
  buscarPorId(id: string): Promise<T | null>;
  buscarTodos(): Promise<T[]>;
  atualizar(id: string, entity: Partial<T>): Promise<T>;
  deletar(id: string): Promise<void>;
}

// Interfaces específicas para cada repositório
export interface IUsuarioRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorEmail(email: string): Promise<any | null>;
  buscarTodos(): Promise<any[]>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface IEscolaRepository {
  criar(data: any): Promise<any>;
  buscarPrimeira(): Promise<any | null>;
  atualizar(id: string, data: any): Promise<any>;
}

export interface IFuncionarioRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorCpf(cpf: string): Promise<any | null>;
  buscarTodos(): Promise<any[]>;
  buscarAtivos(): Promise<any[]>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface IProfessorRepository {
  criar(funcionarioId: string, data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorFuncionarioId(funcionarioId: string): Promise<any | null>;
  buscarTodos(): Promise<any[]>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
  vincularTurma(professorId: string, turmaId: string, disciplina?: string): Promise<any>;
  desvincularTurma(professorId: string, turmaId: string): Promise<void>;
}

export interface IResponsavelRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorCpf(cpf: string): Promise<any | null>;
  buscarTodos(): Promise<any[]>;
  buscarComFilhos(id: string): Promise<any | null>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface IAlunoRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorCpf(cpf: string): Promise<any | null>;
  buscarTodos(): Promise<any[]>;
  buscarPorResponsavel(responsavelId: string): Promise<any[]>;
  buscarPorTurma(turmaId: string): Promise<any[]>;
  buscarMatriculados(): Promise<any[]>;
  vincularTurma(alunoId: string, turmaId: string): Promise<any>;
  desvincularTurma(alunoId: string): Promise<any>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface ITurmaRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarTodas(): Promise<any[]>;
  buscarAtivas(): Promise<any[]>;
  buscarComAlunos(id: string): Promise<any | null>;
  buscarComProfessores(id: string): Promise<any | null>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface INotaRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorAluno(alunoId: string): Promise<any[]>;
  buscarPorTurma(turmaId: string): Promise<any[]>;
  buscarPorAlunoEBimestre(alunoId: string, bimestre: number): Promise<any[]>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface IPlanoMensalidadeRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorNome(nome: string): Promise<any | null>;
  buscarTodos(): Promise<any[]>;
  buscarAtivos(): Promise<any[]>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface IMatriculaRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorAluno(alunoId: string): Promise<any[]>;
  buscarAtivas(): Promise<any[]>;
  buscarPorAnoLetivo(ano: number): Promise<any[]>;
  atualizar(id: string, data: any): Promise<any>;
  cancelar(id: string): Promise<any>;
}

export interface IMensalidadeRepository {
  criar(data: any): Promise<any>;
  criarVarias(data: any[]): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorAluno(alunoId: string): Promise<any[]>;
  buscarPorMatricula(matriculaId: string): Promise<any[]>;
  buscarPendentes(): Promise<any[]>;
  buscarAtrasadas(): Promise<any[]>;
  buscarPorMesAno(mes: number, ano: number): Promise<any[]>;
  registrarPagamento(id: string, data: any): Promise<any>;
  atualizar(id: string, data: any): Promise<any>;
}

export interface IDespesaRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarTodas(): Promise<any[]>;
  buscarPorCategoria(categoria: string): Promise<any[]>;
  buscarPorMesAno(mes: number, ano: number): Promise<any[]>;
  buscarPendentes(): Promise<any[]>;
  registrarPagamento(id: string, data: Date): Promise<any>;
  atualizar(id: string, data: any): Promise<any>;
  deletar(id: string): Promise<void>;
}

export interface IPagamentoFuncionarioRepository {
  criar(data: any): Promise<any>;
  buscarPorId(id: string): Promise<any | null>;
  buscarPorFuncionario(funcionarioId: string): Promise<any[]>;
  buscarPorMesAno(mes: number, ano: number): Promise<any[]>;
  buscarPendentes(): Promise<any[]>;
  registrarPagamento(id: string, data: Date): Promise<any>;
  atualizar(id: string, data: any): Promise<any>;
}
