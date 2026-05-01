export interface ContatoEmergencia {
  nome: string;
  telefone: string;
  parentesco: string;
}

export interface DadosFichaCompletaAluno {
  aluno: {
    nome: string;
    data_nascimento?: string;
    cpf?: string;
    sexo?: string;
    matricula_numero?: string;
    parentesco_responsavel?: string;
  };
  responsavel: {
    nome: string;
    cpf?: string;
    rg?: string;
    data_nascimento?: string;
    email?: string;
    telefone?: string;
    celular?: string;
    endereco?: string;
    bairro?: string;
    complemento?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    profissao?: string;
    local_trabalho?: string;
  };
  contatosEmergencia?: ContatoEmergencia[];
  saude?: {
    possui_alergia?: boolean;
    alergia_descricao?: string;
    restricao_alimentar?: boolean;
    restricao_alimentar_descricao?: string;
    uso_medicamento?: boolean;
    medicamento_descricao?: string;
    necessidade_especial?: boolean;
    necessidade_especial_descricao?: string;
  };
  autorizacoes?: {
    autoriza_atividades?: boolean;
    autoriza_emergencia?: boolean;
    autoriza_imagem?: boolean;
  };
  documentos?: {
    doc_certidao_nascimento?: boolean;
    doc_cpf_aluno?: boolean;
    doc_rg_cpf_responsavel?: boolean;
    doc_comprovante_residencia?: boolean;
    doc_cartao_sus?: boolean;
    doc_carteira_vacinacao?: boolean;
  };
  consideracoes?: string;
  matricula?: {
    ano_letivo: number;
    data_matricula?: string;
    valor_matricula: number;
    desconto: number;
    status: string;
    pago?: boolean;
  };
  turma?: {
    nome: string;
    serie?: string;
    turno?: string;
    ano?: number;
  };
  plano?: {
    nome: string;
    valor: number;
  };
}
