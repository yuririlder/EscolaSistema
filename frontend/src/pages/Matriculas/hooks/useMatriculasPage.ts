import { useState, useEffect } from 'react';
import { Matricula, Aluno, PlanoMensalidade, StatusMatricula } from '../../../types';
import { financeiroService } from '../../../services/financeiroService';
import { alunoService } from '../../../services/alunoService';
import { escolaService } from '../../../services/escolaService';
import { gerarTermoMatriculaPDF } from '../../../pdf';
import { formatCurrencyInput, currencyToNumber, formatNumberInput } from '../../../utils/masks';
import toast from 'react-hot-toast';

interface MatriculaFormData {
  alunoId: string; planoMensalidadeId: string; anoLetivo: string;
  valorMatricula: string; status: StatusMatricula; observacao: string;
}

interface DadosEscola {
  nome?: string; cnpj?: string; endereco?: string; telefone?: string; email?: string;
}

const initialForm: MatriculaFormData = {
  alunoId: '', planoMensalidadeId: '', anoLetivo: new Date().getFullYear().toString(),
  valorMatricula: '', status: StatusMatricula.ATIVA, observacao: '',
};

export function useMatriculasPage() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<PlanoMensalidade[]>([]);
  const [escola, setEscola] = useState<DadosEscola | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [matriculaToCancel, setMatriculaToCancel] = useState<Matricula | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [formData, setFormData] = useState<MatriculaFormData>(initialForm);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [matriculasData, alunosData, planosData, escolaData] = await Promise.all([
        financeiroService.listarMatriculas(),
        alunoService.listar(),
        financeiroService.listarPlanos(),
        escolaService.obter().catch(() => null),
      ]);
      setMatriculas(matriculasData);
      setAlunos(alunosData);
      setPlanos(planosData);
      if (escolaData) setEscola(escolaData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(matricula?: Matricula) {
    if (matricula) {
      const mat = matricula as any;
      setEditingMatricula(matricula);
      setFormData({
        alunoId: mat.alunoId || mat.aluno_id || '',
        planoMensalidadeId: mat.planoMensalidadeId || mat.plano_id || '',
        anoLetivo: (mat.anoLetivo || mat.ano_letivo || new Date().getFullYear()).toString(),
        valorMatricula: formatCurrencyInput(((mat.valorMatricula || mat.valor_matricula || 0) * 100).toString()),
        status: mat.status || StatusMatricula.ATIVA,
        observacao: mat.observacao || mat.observacoes || '',
      });
    } else {
      setEditingMatricula(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingMatricula(null);
  }

  function handleOpenConfirmCancel(matricula: Matricula) {
    setMatriculaToCancel(matricula);
    setIsConfirmModalOpen(true);
  }

  function handleCloseConfirmModal() {
    setIsConfirmModalOpen(false);
    setMatriculaToCancel(null);
  }

  async function handleCancelarMatricula() {
    if (!matriculaToCancel) return;
    setIsCanceling(true);
    try {
      await financeiroService.cancelarMatricula(matriculaToCancel.id);
      toast.success('Matrícula cancelada com sucesso! O histórico escolar foi preservado.');
      handleCloseConfirmModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cancelar matrícula');
    } finally {
      setIsCanceling(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      aluno_id: formData.alunoId, plano_id: formData.planoMensalidadeId,
      ano_letivo: parseInt(formData.anoLetivo, 10),
      valor_matricula: currencyToNumber(formData.valorMatricula),
      status: formData.status, observacoes: formData.observacao,
    };
    try {
      if (editingMatricula) {
        await financeiroService.atualizarMatricula(editingMatricula.id, payload);
        toast.success('Matrícula atualizada com sucesso!');
      } else {
        await financeiroService.criarMatricula(payload);
        toast.success('Matrícula criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar matrícula');
    } finally {
      setIsSaving(false);
    }
  }

  function handlePrint(matricula: Matricula) {
    const mat = matricula as any;
    const alunoData = alunos.find((a) => a.id === (mat.aluno_id || mat.alunoId)) as any;
    gerarTermoMatriculaPDF({
      alunoNome: mat.aluno?.nome || mat.aluno_nome || '-',
      alunoDataNascimento: alunoData?.data_nascimento || alunoData?.dataNascimento,
      responsavelNome: alunoData?.responsavel?.nome || '',
      responsavelCpf: alunoData?.responsavel?.cpf || '',
      responsavelTelefone: alunoData?.responsavel?.celular || alunoData?.responsavel?.telefone || '',
      anoLetivo: mat.anoLetivo || mat.ano_letivo || '-',
      planoNome: mat.planoMensalidade?.nome || mat.plano_nome || '-',
      valorMensalidade: mat.valorMensalidade || mat.valor_mensalidade || 0,
      valorMatricula: mat.valorMatricula || mat.valor_matricula || 0,
      desconto: mat.desconto || 0,
      dataMatricula: mat.dataMatricula || mat.data_matricula,
      turmaNome: alunoData?.turma?.nome || '',
    }, escola || undefined);
  }

  const alunoOptions = alunos.map((a) => ({
    value: a.id,
    label: `${a.nome}${(a as any).matricula_numero ? ` - Mat: ${(a as any).matricula_numero}` : ''}`,
  }));

  const filteredMatriculas = matriculas.filter((m) => {
    const mat = m as any;
    const alunoNome = mat.aluno?.nome || mat.aluno_nome || '';
    const anoLetivo = mat.anoLetivo || mat.ano_letivo || '';
    return (
      alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anoLetivo.toString().includes(searchTerm)
    );
  });

  return {
    matriculas: filteredMatriculas, alunos, planos, isLoading, searchTerm, setSearchTerm,
    isModalOpen, editingMatricula, isSaving, formData, setFormData,
    isConfirmModalOpen, matriculaToCancel, isCanceling,
    alunoOptions, loadData, handleOpenModal, handleCloseModal,
    handleOpenConfirmCancel, handleCloseConfirmModal,
    handleCancelarMatricula, handleSubmit, handlePrint,
    formatCurrencyInput, currencyToNumber, formatNumberInput,
  };
}
