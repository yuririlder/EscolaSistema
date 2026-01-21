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
  VENCIDA = 'VENCIDA',
  FUTURA = 'FUTURA',
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
  rg?: string;
  data_nascimento?: string;
  email: string;
  telefone: string;
  celular?: string;
  endereco: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  profissao?: string;
  local_trabalho?: string;
  observacoes?: string;
  escolaId: string;
  alunos?: Aluno[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContatoEmergencia {
  id?: string;
  nome: string;
  telefone: string;
  parentesco: string;
  ordem?: number;
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
  dataNascimento?: Date;
  data_nascimento?: string;
  cpf?: string;
  matriculaNumero?: string;
  matricula_numero?: string;
  genero?: string;
  sexo?: string;
  responsavelId?: string;
  responsavel_id?: string;
  parentesco_responsavel?: string;
  turmaId?: string;
  turma_id?: string;
  escolaId?: string;
  escola_id?: string;
  responsavel?: Responsavel;
  responsavel_nome?: string;
  turma?: Turma;
  turma_nome?: string;
  notas?: Nota[];
  matriculas?: Matricula[];
  // Contatos de emergência
  contatos_emergencia?: ContatoEmergencia[];
  // Informações de saúde
  possui_alergia?: boolean;
  alergia_descricao?: string;
  restricao_alimentar?: boolean;
  restricao_alimentar_descricao?: string;
  uso_medicamento?: boolean;
  medicamento_descricao?: string;
  necessidade_especial?: boolean;
  necessidade_especial_descricao?: string;
  // Autorizações
  autoriza_atividades?: boolean;
  autoriza_emergencia?: boolean;
  autoriza_imagem?: boolean;
  // Documentos entregues
  doc_certidao_nascimento?: boolean;
  doc_cpf_aluno?: boolean;
  doc_rg_cpf_responsavel?: boolean;
  doc_comprovante_residencia?: boolean;
  doc_cartao_sus?: boolean;
  doc_carteira_vacinacao?: boolean;
  // Considerações
  consideracoes?: string;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface Inadimplente {
  alunoId: string;
  alunoNome: string;
  responsavelTelefone: string;
  responsavelNome: string;
  totalDivida: number;
}

export interface DashboardMetrics {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  mensalidadesPendentes: number;
  receitaMensal: number;
  despesaMensal: number;
  despesasPendentes: number;
  alunosPorTurma: { serie: string; turno: string; quantidade: number }[];
  mensalidadesPorStatus: { status: string; quantidade: number }[];
  receitaVsDespesa: { mes: string; receita: number; despesa: number }[];
  inadimplentes: Inadimplente[];
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
