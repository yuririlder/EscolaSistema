import { useState, useEffect } from 'react';
import { Aluno, Responsavel, Turma, ContatoEmergencia } from '../../../types';
import { alunoService } from '../../../services/alunoService';
import { responsavelService } from '../../../services/responsavelService';
import { turmaService } from '../../../services/turmaService';
import { historicoEscolarService } from '../../../services/historicoEscolarService';
import { removeMask } from '../../../utils/masks';
import { usePainelAluno } from '../../../hooks/usePainelAluno';
import toast from 'react-hot-toast';

export type AlunoTab = 'dados' | 'saude' | 'autorizacoes' | 'documentos';

export interface AlunoFormData {
  nome: string; data_nascimento: string; cpf: string; sexo: string;
  responsavel_id: string; parentesco_responsavel: string; turma_id: string;
  nome_pai: string; nome_mae: string;
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

const emptyForm: AlunoFormData = {
  nome: '', data_nascimento: '', cpf: '', sexo: 'M',
  responsavel_id: '', parentesco_responsavel: '', turma_id: '',
  nome_pai: '', nome_mae: '',
  contato1_nome: '', contato1_telefone: '', contato1_parentesco: '',
  contato2_nome: '', contato2_telefone: '', contato2_parentesco: '',
  possui_alergia: false, alergia_descricao: '',
  restricao_alimentar: false, restricao_alimentar_descricao: '',
  uso_medicamento: false, medicamento_descricao: '',
  necessidade_especial: false, necessidade_especial_descricao: '',
  autoriza_atividades: true, autoriza_emergencia: true, autoriza_imagem: false,
  doc_certidao_nascimento: false, doc_cpf_aluno: false, doc_rg_cpf_responsavel: false,
  doc_comprovante_residencia: false, doc_cartao_sus: false, doc_carteira_vacinacao: false,
  consideracoes: '',
};

export function useAlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'ativos' | 'inativos'>('ativos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [selectedAlunoForTurma, setSelectedAlunoForTurma] = useState<Aluno | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AlunoTab>('dados');
  const [painelRefreshKey, setPainelRefreshKey] = useState(0);
  const [formData, setFormData] = useState<AlunoFormData>(emptyForm);
  const [turmaFormData, setTurmaFormData] = useState({ turma_id: '', ano_letivo: new Date().getFullYear() });

  const { alunoId, openPainel, closePainel } = usePainelAluno();

  useEffect(() => { loadData(); }, [filtroAtivo]);

  async function loadData() {
    try {
      const [alunosData, responsaveisData, turmasData] = await Promise.all([
        filtroAtivo === 'inativos' ? alunoService.listarInativos() : alunoService.listar(),
        responsavelService.listar(),
        turmaService.listar(),
      ]);
      setAlunos(alunosData);
      setResponsaveis(responsaveisData);
      setTurmas(turmasData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOpenModal(aluno?: Aluno) {
    if (aluno) {
      setEditingAluno(aluno);
      try {
        const a = (await alunoService.obterPorId(aluno.id) || aluno) as any;
        const contatos = a.contatos_emergencia || [];
        const dataNasc = a.data_nascimento || a.dataNascimento;
        setFormData({
          nome: a.nome,
          data_nascimento: dataNasc ? new Date(dataNasc).toISOString().split('T')[0] : '',
          cpf: a.cpf || '', sexo: a.sexo || a.genero || 'M',
          responsavel_id: a.responsavel_id || a.responsavelId || '',
          parentesco_responsavel: a.parentesco_responsavel || '',
          turma_id: a.turma_id || a.turmaId || '',
          nome_pai: a.nome_pai || '', nome_mae: a.nome_mae || '',
          contato1_nome: contatos[0]?.nome || '', contato1_telefone: contatos[0]?.telefone || '',
          contato1_parentesco: contatos[0]?.parentesco || '',
          contato2_nome: contatos[1]?.nome || '', contato2_telefone: contatos[1]?.telefone || '',
          contato2_parentesco: contatos[1]?.parentesco || '',
          possui_alergia: a.possui_alergia || false,
          alergia_descricao: a.alergia_descricao || '',
          restricao_alimentar: a.restricao_alimentar || false,
          restricao_alimentar_descricao: a.restricao_alimentar_descricao || '',
          uso_medicamento: a.uso_medicamento || false,
          medicamento_descricao: a.medicamento_descricao || '',
          necessidade_especial: a.necessidade_especial || false,
          necessidade_especial_descricao: a.necessidade_especial_descricao || '',
          autoriza_atividades: a.autoriza_atividades !== false,
          autoriza_emergencia: a.autoriza_emergencia !== false,
          autoriza_imagem: a.autoriza_imagem || false,
          doc_certidao_nascimento: a.doc_certidao_nascimento || false,
          doc_cpf_aluno: a.doc_cpf_aluno || false,
          doc_rg_cpf_responsavel: a.doc_rg_cpf_responsavel || false,
          doc_comprovante_residencia: a.doc_comprovante_residencia || false,
          doc_cartao_sus: a.doc_cartao_sus || false,
          doc_carteira_vacinacao: a.doc_carteira_vacinacao || false,
          consideracoes: a.consideracoes || '',
        });
      } catch {
        const a = aluno as any;
        const dataNasc = a.data_nascimento || a.dataNascimento;
        setFormData({ ...emptyForm, nome: a.nome,
          data_nascimento: dataNasc ? new Date(dataNasc).toISOString().split('T')[0] : '',
          cpf: a.cpf || '', sexo: a.sexo || 'M',
          responsavel_id: a.responsavel_id || a.responsavelId || '',
          turma_id: a.turma_id || a.turmaId || '',
        });
      }
    } else {
      setEditingAluno(null);
      setFormData(emptyForm);
    }
    setActiveTab('dados');
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingAluno(null);
    setFormData(emptyForm);
    setActiveTab('dados');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.contato1_nome || !formData.contato1_telefone || !formData.contato1_parentesco) {
      toast.error('O primeiro contato de emergência é obrigatório'); setActiveTab('dados'); return;
    }
    if (!formData.contato2_nome || !formData.contato2_telefone || !formData.contato2_parentesco) {
      toast.error('O segundo contato de emergência é obrigatório'); setActiveTab('dados'); return;
    }
    setIsSaving(true);
    try {
      const contatos_emergencia: ContatoEmergencia[] = [
        { nome: formData.contato1_nome, telefone: removeMask(formData.contato1_telefone), parentesco: formData.contato1_parentesco },
        { nome: formData.contato2_nome, telefone: removeMask(formData.contato2_telefone), parentesco: formData.contato2_parentesco },
      ];
      const payload: any = {
        nome: formData.nome, data_nascimento: formData.data_nascimento,
        cpf: removeMask(formData.cpf) || undefined, sexo: formData.sexo,
        responsavel_id: formData.responsavel_id, parentesco_responsavel: formData.parentesco_responsavel,
        turma_id: formData.turma_id || undefined,
        nome_pai: formData.nome_pai || undefined, nome_mae: formData.nome_mae || undefined,
        contatos_emergencia,
        possui_alergia: formData.possui_alergia,
        alergia_descricao: formData.possui_alergia ? formData.alergia_descricao : null,
        restricao_alimentar: formData.restricao_alimentar,
        restricao_alimentar_descricao: formData.restricao_alimentar ? formData.restricao_alimentar_descricao : null,
        uso_medicamento: formData.uso_medicamento,
        medicamento_descricao: formData.uso_medicamento ? formData.medicamento_descricao : null,
        necessidade_especial: formData.necessidade_especial,
        necessidade_especial_descricao: formData.necessidade_especial ? formData.necessidade_especial_descricao : null,
        autoriza_atividades: formData.autoriza_atividades, autoriza_emergencia: formData.autoriza_emergencia, autoriza_imagem: formData.autoriza_imagem,
        doc_certidao_nascimento: formData.doc_certidao_nascimento, doc_cpf_aluno: formData.doc_cpf_aluno,
        doc_rg_cpf_responsavel: formData.doc_rg_cpf_responsavel, doc_comprovante_residencia: formData.doc_comprovante_residencia,
        doc_cartao_sus: formData.doc_cartao_sus, doc_carteira_vacinacao: formData.doc_carteira_vacinacao,
        consideracoes: formData.consideracoes,
      };
      if (editingAluno) {
        await alunoService.atualizar(editingAluno.id, payload);
        toast.success('Aluno atualizado com sucesso!');
        setPainelRefreshKey((k) => k + 1);
      } else {
        await alunoService.criar(payload);
        toast.success('Aluno criado com sucesso!');
      }
      handleCloseModal(); loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.details?.[0]?.msg || 'Erro ao salvar aluno');
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenTurmaModal(aluno: Aluno) {
    setSelectedAlunoForTurma(aluno);
    const a = aluno as any;
    setTurmaFormData({ turma_id: a.turma_id || a.turmaId || '', ano_letivo: new Date().getFullYear() });
    setIsTurmaModalOpen(true);
  }

  function handleCloseTurmaModal() {
    setIsTurmaModalOpen(false);
    setSelectedAlunoForTurma(null);
  }

  async function handleVincularTurma(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAlunoForTurma || !turmaFormData.turma_id) return;
    setIsSaving(true);
    try {
      await historicoEscolarService.vincularAlunoTurma({
        aluno_id: selectedAlunoForTurma.id,
        turma_id: turmaFormData.turma_id,
        ano_letivo: turmaFormData.ano_letivo,
      });
      toast.success('Aluno vinculado à turma com sucesso!');
      handleCloseTurmaModal(); loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao vincular aluno à turma');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await alunoService.excluir(id);
      toast.success('Aluno desativado com sucesso!');
      closePainel(); loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar aluno');
    }
  }

  const turmasFiltradas = turmas.filter((t) => t.ano === turmaFormData.ano_letivo && t.ativa);

  const filteredAlunos = alunos.filter((a) => {
    const searchLower = searchTerm.toLowerCase();
    const al = a as any;
    return (
      al.nome?.toLowerCase().includes(searchLower) ||
      al.matricula_numero?.includes(searchTerm) ||
      al.matriculaNumero?.includes(searchTerm)
    );
  });

  const responsavelOptions = responsaveis.map((r) => ({
    value: r.id, label: `${r.nome} - CPF: ${r.cpf || 'N/A'}`,
  }));

  return {
    alunos: filteredAlunos, responsaveis, turmas, isLoading,
    searchTerm, setSearchTerm, filtroAtivo, setFiltroAtivo,
    isModalOpen, editingAluno, isSaving, activeTab, setActiveTab,
    formData, setFormData, responsavelOptions,
    isTurmaModalOpen, selectedAlunoForTurma, turmaFormData, setTurmaFormData,
    turmasFiltradas, painelRefreshKey,
    alunoId, openPainel, closePainel,
    handleOpenModal, handleCloseModal, handleSubmit,
    handleOpenTurmaModal, handleCloseTurmaModal, handleVincularTurma, handleDelete,
  };
}
