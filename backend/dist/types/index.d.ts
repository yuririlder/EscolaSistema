export interface BaseEntity {
    id: string;
    created_at?: Date;
    updated_at?: Date;
}
export declare enum PerfilUsuario {
    ADMIN = "ADMIN",
    DIRETOR = "DIRETOR",
    SECRETARIO = "SECRETARIO",
    COORDENADOR = "COORDENADOR"
}
export declare enum StatusMatricula {
    ATIVA = "ATIVA",
    CANCELADA = "CANCELADA",
    CONCLUIDA = "CONCLUIDA",
    TRANCADA = "TRANCADA"
}
export declare enum StatusMensalidade {
    PENDENTE = "PENDENTE",
    PAGO = "PAGO",
    ATRASADO = "ATRASADO",
    CANCELADO = "CANCELADO"
}
export declare enum StatusDespesa {
    PENDENTE = "PENDENTE",
    PAGO = "PAGO",
    CANCELADO = "CANCELADO"
}
export declare enum StatusPagamento {
    PENDENTE = "PENDENTE",
    PAGO = "PAGO"
}
export declare enum Turno {
    MATUTINO = "MATUTINO",
    VESPERTINO = "VESPERTINO",
    INTEGRAL = "INTEGRAL"
}
export interface Escola extends BaseEntity {
    nome: string;
    cnpj: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    diretor?: string;
    secretario?: string;
    logo?: string;
}
export interface Usuario extends BaseEntity {
    nome: string;
    email: string;
    senha?: string;
    perfil: PerfilUsuario;
    ativo: boolean;
}
export interface Funcionario extends BaseEntity {
    nome: string;
    cpf: string;
    rg?: string;
    data_nascimento?: Date;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cargo: string;
    salario: number;
    data_contratacao: Date;
    data_desligamento?: Date;
    ativo: boolean;
    observacoes?: string;
}
export interface Professor extends BaseEntity {
    funcionario_id: string;
    formacao?: string;
    especialidade?: string;
    funcionario?: Funcionario;
}
export interface Responsavel extends BaseEntity {
    nome: string;
    cpf: string;
    rg?: string;
    data_nascimento?: Date;
    telefone?: string;
    celular?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    profissao?: string;
    local_trabalho?: string;
    observacoes?: string;
}
export interface Turma extends BaseEntity {
    nome: string;
    ano: number;
    turno: Turno;
    serie?: string;
    sala_numero?: string;
    capacidade: number;
    ativa: boolean;
}
export interface Aluno extends BaseEntity {
    nome: string;
    cpf?: string;
    rg?: string;
    data_nascimento: Date;
    sexo?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    responsavel_id: string;
    turma_id?: string;
    matricula_ativa: boolean;
    data_matricula?: Date;
    observacoes?: string;
    responsavel?: Responsavel;
    turma?: Turma;
}
export interface Nota extends BaseEntity {
    aluno_id: string;
    turma_id: string;
    disciplina: string;
    bimestre: number;
    nota: number;
    tipo?: string;
    observacao?: string;
    aluno?: Aluno;
}
export interface PlanoMensalidade extends BaseEntity {
    nome: string;
    descricao?: string;
    valor: number;
    ativo: boolean;
}
export interface Matricula extends BaseEntity {
    aluno_id: string;
    plano_id: string;
    ano_letivo: number;
    valor_matricula: number;
    valor_mensalidade: number;
    dia_vencimento: number;
    data_matricula: Date;
    status: StatusMatricula;
    observacoes?: string;
    desconto: number;
    aluno?: Aluno;
    plano?: PlanoMensalidade;
}
export interface Mensalidade extends BaseEntity {
    aluno_id: string;
    matricula_id: string;
    mes_referencia: number;
    ano_referencia: number;
    valor: number;
    valor_pago?: number;
    desconto: number;
    multa: number;
    juros: number;
    data_vencimento: Date;
    data_pagamento?: Date;
    status: StatusMensalidade;
    forma_pagamento?: string;
    observacoes?: string;
    aluno?: Aluno;
}
export interface Despesa extends BaseEntity {
    descricao: string;
    categoria: string;
    valor: number;
    data_vencimento: Date;
    data_pagamento?: Date;
    status: StatusDespesa;
    fornecedor?: string;
    observacoes?: string;
}
export interface PagamentoFuncionario extends BaseEntity {
    funcionario_id: string;
    mes_referencia: number;
    ano_referencia: number;
    salario_base: number;
    bonus: number;
    descontos: number;
    valor_liquido: number;
    data_pagamento?: Date;
    status: StatusPagamento;
    observacoes?: string;
    funcionario?: Funcionario;
}
export interface LoginDTO {
    email: string;
    senha: string;
}
export interface LoginResponse {
    token: string;
    usuario: Omit<Usuario, 'senha'>;
}
export interface CreateUsuarioDTO {
    nome: string;
    email: string;
    senha: string;
    perfil: PerfilUsuario;
}
export interface CreateAlunoDTO {
    nome: string;
    cpf?: string;
    rg?: string;
    data_nascimento: Date;
    sexo?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    responsavel_id: string;
    observacoes?: string;
}
export interface CreateProfessorDTO {
    nome: string;
    cpf: string;
    rg?: string;
    data_nascimento?: Date;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cargo?: string;
    salario: number;
    data_contratacao: Date;
    formacao?: string;
    especialidade?: string;
}
export interface CreateMatriculaDTO {
    aluno_id: string;
    plano_id: string;
    ano_letivo: number;
    valor_matricula: number;
    dia_vencimento?: number;
    desconto?: number;
    observacoes?: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface DashboardData {
    totalAlunos: number;
    alunosMatriculados: number;
    totalProfessores: number;
    totalTurmas: number;
    receitaMes: number;
    despesasMes: number;
    mensalidadesPendentes: number;
    mensalidadesAtrasadas: number;
}
//# sourceMappingURL=index.d.ts.map