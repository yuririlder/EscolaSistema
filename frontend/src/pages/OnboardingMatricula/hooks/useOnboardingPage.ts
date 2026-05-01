import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Responsavel, Aluno, Turma, PlanoMensalidade, StatusMatricula } from '../../../types';
import { responsavelService } from '../../../services/responsavelService';
import { alunoService } from '../../../services/alunoService';
import { turmaService } from '../../../services/turmaService';
import { financeiroService } from '../../../services/financeiroService';
import { historicoEscolarService } from '../../../services/historicoEscolarService';
import { escolaService } from '../../../services/escolaService';
import { removeMask, formatCPF, formatPhone, formatCurrencyInput, currencyToNumber, formatCurrency } from '../../../utils/masks';
import { gerarFichaCompletaAlunoPDF, gerarTermoMatriculaPDF } from '../../../pdf';
import toast from 'react-hot-toast';

export const ONBOARDING_STEPS = [
  { id: 1, title: 'Responsável', description: 'Cadastrar ou selecionar responsável' },
  { id: 2, title: 'Aluno', description: 'Cadastrar dados do aluno' },
  { id: 3, title: 'Matrícula', description: 'Registrar matrícula' },
  { id: 4, title: 'Pagamento', description: 'Registrar pagamento da matrícula' },
  { id: 5, title: 'Turma', description: 'Vincular aluno à turma' },
];

export interface ResponsavelForm {
  nome: string; cpf: string; rg: string; data_nascimento: string;
  email: string; telefone: string; celular: string;
  endereco: string; bairro: string; complemento: string;
  cidade: string; estado: string; cep: string;
  profissao: string; local_trabalho: string;
}

export interface AlunoOnboardingForm {
  nome: string; data_nascimento: string; cpf: string; sexo: string;
  parentesco_responsavel: string;
  contato1_nome: string; contato1_telefone: string; contato1_parentesco: string;
  contato2_nome: string; contato2_telefone: string; contato2_parentesco: string;
  possui_alergia: boolean; alergia_descricao: string;
  restricao_alimentar: boolean; restricao_alimentar_descricao: string;
  uso_medicamento: boolean; medicamento_descricao: string;
  necessidade_especial: boolean; necessidade_especial_descricao: string;
  autoriza_atividades: boolean; autoriza_emergencia: boolean; autoriza_imagem: boolean;
  doc_certidao_nascimento: boolean; doc_cpf_aluno: boolean; doc_rg_cpf_responsavel: boolean;
  doc_comprovante_residencia: boolean; doc_cartao_sus: boolean; doc_carteira_vacinacao: boolean;
  consideracoes: string;
}

export interface MatriculaOnboardingForm {
  plano_id: string; ano_letivo: number; valor_matricula: string; desconto: string; observacoes: string;
}

export interface PagamentoOnboardingForm {
  forma_pagamento: string; observacao: string;
}

export interface TurmaOnboardingForm {
  turma_id: string; ano_letivo: number;
}

const emptyResponsavelForm: ResponsavelForm = {
  nome: '', cpf: '', rg: '', data_nascimento: '', email: '', telefone: '', celular: '',
  endereco: '', bairro: '', complemento: '', cidade: '', estado: '', cep: '', profissao: '', local_trabalho: '',
};

const emptyAlunoForm: AlunoOnboardingForm = {
  nome: '', data_nascimento: '', cpf: '', sexo: 'M', parentesco_responsavel: '',
  contato1_nome: '', contato1_telefone: '', contato1_parentesco: '',
  contato2_nome: '', contato2_telefone: '', contato2_parentesco: '',
  possui_alergia: false, alergia_descricao: '', restricao_alimentar: false, restricao_alimentar_descricao: '',
  uso_medicamento: false, medicamento_descricao: '', necessidade_especial: false, necessidade_especial_descricao: '',
  autoriza_atividades: true, autoriza_emergencia: true, autoriza_imagem: false,
  doc_certidao_nascimento: false, doc_cpf_aluno: false, doc_rg_cpf_responsavel: false,
  doc_comprovante_residencia: false, doc_cartao_sus: false, doc_carteira_vacinacao: false,
  consideracoes: '',
};

export function useOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [planos, setPlanos] = useState<PlanoMensalidade[]>([]);
  const [escola, setEscola] = useState<any>(null);

  const [useExistingResponsavel, setUseExistingResponsavel] = useState(false);
  const [selectedResponsavelId, setSelectedResponsavelId] = useState('');

  const [createdResponsavel, setCreatedResponsavel] = useState<Responsavel | null>(null);
  const [createdAluno, setCreatedAluno] = useState<Aluno | null>(null);
  const [createdMatricula, setCreatedMatricula] = useState<any>(null);
  const [matriculaPaga, setMatriculaPaga] = useState(false);
  const [alunoVinculado, setAlunoVinculado] = useState(false);

  const [responsavelForm, setResponsavelForm] = useState<ResponsavelForm>(emptyResponsavelForm);
  const [alunoForm, setAlunoForm] = useState<AlunoOnboardingForm>(emptyAlunoForm);
  const [matriculaForm, setMatriculaForm] = useState<MatriculaOnboardingForm>({
    plano_id: '', ano_letivo: new Date().getFullYear(), valor_matricula: '', desconto: '0', observacoes: '',
  });
  const [pagamentoForm, setPagamentoForm] = useState<PagamentoOnboardingForm>({
    forma_pagamento: 'DINHEIRO', observacao: '',
  });
  const [turmaForm, setTurmaForm] = useState<TurmaOnboardingForm>({
    turma_id: '', ano_letivo: new Date().getFullYear(),
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [responsaveisData, turmasData, planosData, escolaData] = await Promise.all([
        responsavelService.listar(),
        turmaService.listar(),
        financeiroService.listarPlanos(),
        escolaService.obter().catch(() => null),
      ]);
      setResponsaveis(responsaveisData);
      setTurmas(turmasData);
      setPlanos(planosData.filter((p: PlanoMensalidade) => p.ativo));
      if (escolaData) setEscola(escolaData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateResponsavel() {
    setIsSaving(true);
    try {
      const payload = {
        ...responsavelForm,
        cpf: removeMask(responsavelForm.cpf),
        telefone: removeMask(responsavelForm.telefone),
        celular: removeMask(responsavelForm.celular),
        cep: removeMask(responsavelForm.cep),
      };
      const novoResponsavel = await responsavelService.criar(payload);
      setCreatedResponsavel(novoResponsavel);
      setResponsaveis([...responsaveis, novoResponsavel]);
      toast.success('Responsável cadastrado com sucesso!');
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar responsável');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSelectExistingResponsavel() {
    const responsavel = responsaveis.find((r) => r.id === selectedResponsavelId);
    if (responsavel) { setCreatedResponsavel(responsavel); setCurrentStep(2); }
    else toast.error('Selecione um responsável');
  }

  async function handleCreateAluno() {
    if (!createdResponsavel) return;
    if (!alunoForm.contato1_nome || !alunoForm.contato1_telefone || !alunoForm.contato1_parentesco) {
      toast.error('O primeiro contato de emergência é obrigatório'); return;
    }
    if (!alunoForm.contato2_nome || !alunoForm.contato2_telefone || !alunoForm.contato2_parentesco) {
      toast.error('O segundo contato de emergência é obrigatório'); return;
    }
    setIsSaving(true);
    try {
      const contatos_emergencia = [
        { nome: alunoForm.contato1_nome, telefone: removeMask(alunoForm.contato1_telefone), parentesco: alunoForm.contato1_parentesco },
        { nome: alunoForm.contato2_nome, telefone: removeMask(alunoForm.contato2_telefone), parentesco: alunoForm.contato2_parentesco },
      ];
      const payload: any = {
        nome: alunoForm.nome, data_nascimento: alunoForm.data_nascimento,
        cpf: removeMask(alunoForm.cpf) || undefined, sexo: alunoForm.sexo,
        responsavel_id: createdResponsavel.id, parentesco_responsavel: alunoForm.parentesco_responsavel,
        contatos_emergencia,
        possui_alergia: alunoForm.possui_alergia, alergia_descricao: alunoForm.possui_alergia ? alunoForm.alergia_descricao : undefined,
        restricao_alimentar: alunoForm.restricao_alimentar, restricao_alimentar_descricao: alunoForm.restricao_alimentar ? alunoForm.restricao_alimentar_descricao : undefined,
        uso_medicamento: alunoForm.uso_medicamento, medicamento_descricao: alunoForm.uso_medicamento ? alunoForm.medicamento_descricao : undefined,
        necessidade_especial: alunoForm.necessidade_especial, necessidade_especial_descricao: alunoForm.necessidade_especial ? alunoForm.necessidade_especial_descricao : undefined,
        autoriza_atividades: alunoForm.autoriza_atividades, autoriza_emergencia: alunoForm.autoriza_emergencia, autoriza_imagem: alunoForm.autoriza_imagem,
        doc_certidao_nascimento: alunoForm.doc_certidao_nascimento, doc_cpf_aluno: alunoForm.doc_cpf_aluno,
        doc_rg_cpf_responsavel: alunoForm.doc_rg_cpf_responsavel, doc_comprovante_residencia: alunoForm.doc_comprovante_residencia,
        doc_cartao_sus: alunoForm.doc_cartao_sus, doc_carteira_vacinacao: alunoForm.doc_carteira_vacinacao,
        consideracoes: alunoForm.consideracoes,
      };
      const novoAluno = await alunoService.criar(payload);
      setCreatedAluno(novoAluno);
      toast.success('Aluno cadastrado com sucesso!');
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar aluno');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateMatricula() {
    if (!createdAluno) return;
    setIsSaving(true);
    try {
      const payload = {
        aluno_id: createdAluno.id, plano_id: matriculaForm.plano_id,
        ano_letivo: matriculaForm.ano_letivo,
        valor_matricula: currencyToNumber(matriculaForm.valor_matricula),
        desconto: parseInt(matriculaForm.desconto, 10) || 0,
        status: StatusMatricula.ATIVA, observacoes: matriculaForm.observacoes,
      };
      const novaMatricula = await financeiroService.criarMatricula(payload);
      setCreatedMatricula(novaMatricula);
      toast.success('Matrícula criada com sucesso!');
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar matrícula');
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePagarMatricula() {
    setIsSaving(true);
    try {
      setMatriculaPaga(true);
      toast.success('Pagamento registrado com sucesso!');
      setCurrentStep(5);
    } catch {
      toast.error('Erro ao registrar pagamento');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSkipPagamento() { setCurrentStep(5); }

  async function handleVincularTurma(e?: React.FormEvent) {
    e?.preventDefault();
    if (!createdAluno || !turmaForm.turma_id) return;
    setIsSaving(true);
    try {
      await historicoEscolarService.vincularAlunoTurma({
        aluno_id: createdAluno.id, turma_id: turmaForm.turma_id, ano_letivo: turmaForm.ano_letivo,
      });
      setAlunoVinculado(true);
      toast.success('Aluno vinculado à turma com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao vincular aluno à turma');
    } finally {
      setIsSaving(false);
    }
  }

  function handleImprimirFichaCompleta() {
    if (!createdAluno || !createdResponsavel) { toast.error('Dados incompletos para gerar a ficha'); return; }
    const turmaSelecionada = turmas.find((t) => t.id === turmaForm.turma_id);
    const planoSelecionado = planos.find((p) => p.id === matriculaForm.plano_id);
    const contatosEmergencia: any[] = [];
    if (alunoForm.contato1_nome) contatosEmergencia.push({ nome: alunoForm.contato1_nome, telefone: alunoForm.contato1_telefone, parentesco: alunoForm.contato1_parentesco });
    if (alunoForm.contato2_nome) contatosEmergencia.push({ nome: alunoForm.contato2_nome, telefone: alunoForm.contato2_telefone, parentesco: alunoForm.contato2_parentesco });

    gerarFichaCompletaAlunoPDF({
      aluno: { nome: createdAluno.nome, data_nascimento: alunoForm.data_nascimento, cpf: alunoForm.cpf, sexo: alunoForm.sexo, matricula_numero: (createdAluno as any).matricula_numero || (createdAluno as any).matriculaNumero, parentesco_responsavel: alunoForm.parentesco_responsavel },
      responsavel: { nome: createdResponsavel.nome, cpf: responsavelForm.cpf || formatCPF(createdResponsavel.cpf), rg: responsavelForm.rg || createdResponsavel.rg, data_nascimento: responsavelForm.data_nascimento || createdResponsavel.data_nascimento, email: createdResponsavel.email, telefone: responsavelForm.telefone || formatPhone(createdResponsavel.telefone), celular: responsavelForm.celular || createdResponsavel.celular, endereco: responsavelForm.endereco || createdResponsavel.endereco, bairro: responsavelForm.bairro || (createdResponsavel as any).bairro, complemento: responsavelForm.complemento || (createdResponsavel as any).complemento, cidade: responsavelForm.cidade || createdResponsavel.cidade, estado: responsavelForm.estado || createdResponsavel.estado, cep: responsavelForm.cep || createdResponsavel.cep, profissao: createdResponsavel.profissao, local_trabalho: createdResponsavel.local_trabalho },
      contatosEmergencia: contatosEmergencia.length > 0 ? contatosEmergencia : undefined,
      saude: { possui_alergia: alunoForm.possui_alergia, alergia_descricao: alunoForm.alergia_descricao, restricao_alimentar: alunoForm.restricao_alimentar, restricao_alimentar_descricao: alunoForm.restricao_alimentar_descricao, uso_medicamento: alunoForm.uso_medicamento, medicamento_descricao: alunoForm.medicamento_descricao, necessidade_especial: alunoForm.necessidade_especial, necessidade_especial_descricao: alunoForm.necessidade_especial_descricao },
      autorizacoes: { autoriza_atividades: alunoForm.autoriza_atividades, autoriza_emergencia: alunoForm.autoriza_emergencia, autoriza_imagem: alunoForm.autoriza_imagem },
      documentos: { doc_certidao_nascimento: alunoForm.doc_certidao_nascimento, doc_cpf_aluno: alunoForm.doc_cpf_aluno, doc_rg_cpf_responsavel: alunoForm.doc_rg_cpf_responsavel, doc_comprovante_residencia: alunoForm.doc_comprovante_residencia, doc_cartao_sus: alunoForm.doc_cartao_sus, doc_carteira_vacinacao: alunoForm.doc_carteira_vacinacao },
      consideracoes: alunoForm.consideracoes,
      matricula: createdMatricula ? { ano_letivo: matriculaForm.ano_letivo, data_matricula: createdMatricula.data_matricula || createdMatricula.dataMatricula || new Date().toISOString(), valor_matricula: currencyToNumber(matriculaForm.valor_matricula), desconto: parseInt(matriculaForm.desconto, 10) || 0, status: createdMatricula.status, pago: matriculaPaga } : undefined,
      turma: turmaSelecionada ? { nome: turmaSelecionada.nome, serie: turmaSelecionada.serie, turno: turmaSelecionada.turno, ano: turmaSelecionada.ano } : undefined,
      plano: planoSelecionado ? { nome: planoSelecionado.nome, valor: planoSelecionado.valor } : undefined,
    }, escola || undefined);
  }

  function handleImprimirTermoMatricula() {
    if (!createdAluno || !createdResponsavel || !createdMatricula) { toast.error('Dados incompletos para gerar o termo de matrícula'); return; }
    const planoSelecionado = planos.find((p) => p.id === matriculaForm.plano_id);
    const turmaSelecionada = turmas.find((t) => t.id === turmaForm.turma_id);
    gerarTermoMatriculaPDF({
      alunoNome: createdAluno.nome, alunoDataNascimento: alunoForm.data_nascimento,
      responsavelNome: createdResponsavel.nome, responsavelCpf: responsavelForm.cpf || createdResponsavel.cpf,
      responsavelTelefone: responsavelForm.telefone || createdResponsavel.telefone,
      anoLetivo: matriculaForm.ano_letivo, planoNome: planoSelecionado?.nome || '-',
      valorMensalidade: planoSelecionado?.valor || 0, valorMatricula: currencyToNumber(matriculaForm.valor_matricula),
      desconto: parseInt(matriculaForm.desconto, 10) || 0,
      dataMatricula: createdMatricula.data_matricula || createdMatricula.dataMatricula || new Date().toISOString(),
      turmaNome: turmaSelecionada ? `${turmaSelecionada.nome} - ${turmaSelecionada.serie || ''} (${turmaSelecionada.turno})` : undefined,
    }, escola || undefined);
  }

  function handleFinalizar() {
    handleImprimirFichaCompleta();
    setTimeout(() => { handleImprimirTermoMatricula(); }, 500);
    toast.success('Matrícula concluída com sucesso! Documentos gerados.');
    setTimeout(() => { navigate('/alunos'); }, 1000);
  }

  function handleNovaMatricula() {
    setCurrentStep(1); setUseExistingResponsavel(false); setSelectedResponsavelId('');
    setCreatedResponsavel(null); setCreatedAluno(null); setCreatedMatricula(null);
    setMatriculaPaga(false); setAlunoVinculado(false);
    setResponsavelForm(emptyResponsavelForm); setAlunoForm(emptyAlunoForm);
    setMatriculaForm({ plano_id: '', ano_letivo: new Date().getFullYear(), valor_matricula: '', desconto: '0', observacoes: '' });
    setPagamentoForm({ forma_pagamento: 'DINHEIRO', observacao: '' });
    setTurmaForm({ turma_id: '', ano_letivo: new Date().getFullYear() });
  }

  const turmasFiltradas = turmas.filter((t) => t.ano === turmaForm.ano_letivo && t.ativa);
  const responsavelOptions = responsaveis.map((r) => ({ value: r.id, label: `${r.nome} - CPF: ${formatCPF(r.cpf) || 'N/A'}` }));

  return {
    currentStep, setCurrentStep, isLoading, isSaving,
    planos, turmas, turmasFiltradas, responsavelOptions,
    useExistingResponsavel, setUseExistingResponsavel,
    selectedResponsavelId, setSelectedResponsavelId,
    createdResponsavel, createdAluno, createdMatricula, matriculaPaga, alunoVinculado,
    responsavelForm, setResponsavelForm,
    alunoForm, setAlunoForm,
    matriculaForm, setMatriculaForm,
    pagamentoForm, setPagamentoForm,
    turmaForm, setTurmaForm,
    handleCreateResponsavel, handleSelectExistingResponsavel, handleCreateAluno,
    handleCreateMatricula, handlePagarMatricula, handleSkipPagamento,
    handleVincularTurma, handleImprimirFichaCompleta, handleImprimirTermoMatricula,
    handleFinalizar, handleNovaMatricula,
    formatCurrency, formatCurrencyInput,
  };
}
