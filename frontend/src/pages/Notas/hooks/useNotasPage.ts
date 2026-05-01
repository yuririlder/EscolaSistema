import { useState } from 'react';
import { Nota, Aluno, Professor } from '../../../types';
import { notaService } from '../../../services/notaService';
import { alunoService } from '../../../services/alunoService';
import { professorService } from '../../../services/professorService';
import toast from 'react-hot-toast';

interface NotaFormData {
  alunoId: string;
  disciplina: string;
  bimestre: number;
  valor: number;
  observacao: string;
  professorId: string;
}

const initialForm: NotaFormData = {
  alunoId: '', disciplina: '', bimestre: 1, valor: 0, observacao: '', professorId: '',
};

export function useNotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<NotaFormData>(initialForm);

  async function loadData() {
    try {
      const [notasData, alunosData, professoresData] = await Promise.all([
        notaService.listar(),
        alunoService.listar(),
        professorService.listar(),
      ]);
      setNotas(notasData);
      setAlunos(alunosData);
      setProfessores(professoresData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(nota?: Nota) {
    if (nota) {
      setEditingNota(nota);
      setFormData({ alunoId: nota.alunoId, disciplina: nota.disciplina, bimestre: nota.bimestre, valor: nota.valor, observacao: nota.observacao || '', professorId: nota.professorId });
    } else {
      setEditingNota(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingNota(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingNota) {
        await notaService.atualizar(editingNota.id, formData);
        toast.success('Nota atualizada com sucesso!');
      } else {
        await notaService.criar(formData);
        toast.success('Nota criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar nota');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja desativar esta nota? O histórico será mantido.')) return;
    try {
      await notaService.excluir(id);
      toast.success('Nota desativada com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar nota');
    }
  }

  const filteredNotas = notas.filter(
    (n) =>
      n.aluno?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.disciplina.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    notas: filteredNotas,
    alunos,
    professores,
    isLoading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editingNota,
    isSaving,
    formData,
    setFormData,
    loadData,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  };
}
