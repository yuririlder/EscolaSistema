import { useState } from 'react';
import { Turma, Professor } from '../../../types';
import { turmaService } from '../../../services/turmaService';
import { professorService } from '../../../services/professorService';
import toast from 'react-hot-toast';

interface TurmaFormData {
  nome: string;
  ano: number;
  serie: string;
  turno: string;
  capacidade: number;
  salaNumero: string;
  ativa: boolean;
}

const initialForm: TurmaFormData = {
  nome: '', ano: new Date().getFullYear(), serie: '', turno: 'MATUTINO', capacidade: 30, salaNumero: '', ativa: true,
};

export function useTurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfessorModalOpen, setIsProfessorModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [selectedProfessorId, setSelectedProfessorId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TurmaFormData>(initialForm);

  async function loadData() {
    try {
      const [turmasData, professoresData] = await Promise.all([
        turmaService.listar(),
        professorService.listar(),
      ]);
      setTurmas(turmasData);
      setProfessores(professoresData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(turma?: Turma) {
    if (turma) {
      setEditingTurma(turma);
      setFormData({ nome: turma.nome, ano: turma.ano, serie: turma.serie, turno: turma.turno, capacidade: turma.capacidade, salaNumero: turma.salaNumero, ativa: turma.ativa });
    } else {
      setEditingTurma(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingTurma(null);
  }

  function handleOpenProfessorModal(turma: Turma) {
    setSelectedTurma(turma);
    setSelectedProfessorId('');
    setIsProfessorModalOpen(true);
  }

  function handleCloseProfessorModal() {
    setIsProfessorModalOpen(false);
    setSelectedTurma(null);
    setSelectedProfessorId('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingTurma) {
        await turmaService.atualizar(editingTurma.id, formData);
        toast.success('Turma atualizada com sucesso!');
      } else {
        await turmaService.criar(formData);
        toast.success('Turma criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar turma');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVincularProfessor() {
    if (!selectedTurma || !selectedProfessorId) return;
    setIsSaving(true);
    try {
      await turmaService.vincularProfessor(selectedTurma.id, selectedProfessorId);
      toast.success('Professor vinculado com sucesso!');
      handleCloseProfessorModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao vincular professor');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja desativar esta turma? O histórico será mantido.')) return;
    try {
      await turmaService.excluir(id);
      toast.success('Turma desativada com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar turma');
    }
  }

  const filteredTurmas = turmas.filter(
    (t) =>
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serie.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    turmas: filteredTurmas,
    professores,
    isLoading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    isProfessorModalOpen,
    editingTurma,
    selectedTurma,
    selectedProfessorId,
    setSelectedProfessorId,
    isSaving,
    formData,
    setFormData,
    loadData,
    handleOpenModal,
    handleCloseModal,
    handleOpenProfessorModal,
    handleCloseProfessorModal,
    handleSubmit,
    handleVincularProfessor,
    handleDelete,
  };
}
