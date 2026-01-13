// Enums
export enum PerfilUsuario {
  DIRETOR = 'DIRETOR',
  SECRETARIO = 'SECRETARIO',
  COORDENADOR = 'COORDENADOR',
}

export enum StatusMatricula {
  ATIVA = 'ATIVA',
  TRANCADA = 'TRANCADA',
  CANCELADA = 'CANCELADA',
  CONCLUIDA = 'CONCLUIDA',
}

export enum StatusMensalidade {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO',
}

export enum StatusDespesa {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

// Interfaces
export interface Escola {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  escolaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  salario: number;
  dataContratacao: Date;
  ativo: boolean;
  escolaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Professor extends Funcionario {
  formacao: string;
  especialidade: string;
  turmas?: Turma[];
}

export interface Responsavel {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  profissao?: string;
  escolaId: string;
  alunos?: Aluno[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Turma {
  id: string;
  nome: string;
  ano: number;
  serie: string;
  turno: string;
  capacidade: number;
  salaNumero: string;
  ativa: boolean;
  escolaId: string;
  professores?: Professor[];
  alunos?: Aluno[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: Date;
  cpf?: string;
  matriculaNumero: string;
  genero: string;
  responsavelId: string;
  turmaId: string;
  escolaId: string;
  responsavel?: Responsavel;
  turma?: Turma;
  notas?: Nota[];
  matriculas?: Matricula[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Nota {
  id: string;
  alunoId: string;
  disciplina: string;
  bimestre: number;
  valor: number;
  observacao?: string;
  dataLancamento: Date;
  professorId: string;
  aluno?: Aluno;
  professor?: Professor;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanoMensalidade {
  id: string;
  nome: string;
  valor: number;
  descricao?: string;
  ativo: boolean;
  escolaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Matricula {
  id: string;
  alunoId: string;
  planoMensalidadeId: string;
  anoLetivo: number;
  dataMatricula: Date;
  valorMatricula: number;
  desconto: number;
  status: StatusMatricula;
  observacao?: string;
  escolaId: string;
  aluno?: Aluno;
  planoMensalidade?: PlanoMensalidade;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mensalidade {
  id: string;
  matriculaId: string;
  mesReferencia: number;
  anoReferencia: number;
  valorOriginal: number;
  desconto: number;
  valorFinal: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: StatusMensalidade;
  formaPagamento?: string;
  observacao?: string;
  escolaId: string;
  matricula?: Matricula;
  createdAt: Date;
  updatedAt: Date;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: StatusDespesa;
  fornecedor?: string;
  observacao?: string;
  escolaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PagamentoFuncionario {
  id: string;
  funcionarioId: string;
  mesReferencia: number;
  anoReferencia: number;
  valorBase: number;
  bonus: number;
  descontos: number;
  valorFinal: number;
  dataPagamento?: Date;
  status: StatusDespesa;
  observacao?: string;
  escolaId: string;
  funcionario?: Funcionario;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface LoginDTO {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface DashboardMetrics {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  mensalidadesPendentes: number;
  receitaMensal: number;
  despesaMensal: number;
  alunosPorTurma: { turma: string; quantidade: number }[];
  mensalidadesPorStatus: { status: string; quantidade: number }[];
  receitaVsDespesa: { mes: string; receita: number; despesa: number }[];
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
