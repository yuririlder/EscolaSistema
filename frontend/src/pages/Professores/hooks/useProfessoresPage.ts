import { useState } from 'react';
import { Professor } from '../../../types';
import { professorService } from '../../../services/professorService';
import { formatCurrencyInput, currencyToNumber, formatCPF, formatPhone, removeMask } from '../../../utils/masks';
import toast from 'react-hot-toast';

interface ProfessorFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  salario: string;
  formacao: string;
  especialidade: string;
}

const initialForm: ProfessorFormData = {
  nome: '', cpf: '', email: '', telefone: '', endereco: '', salario: '', formacao: '', especialidade: '',
};

export function useProfessoresPage() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfessorFormData>(initialForm);

  async function loadProfessores() {
    try {
      const data = await professorService.listar();
      setProfessores(data);
    } catch {
      toast.error('Erro ao carregar professores');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(professor?: Professor) {
    if (professor) {
      setEditingProfessor(professor);
      setFormData({
        nome: professor.nome,
        cpf: formatCPF(professor.cpf),
        email: professor.email,
        telefone: formatPhone(professor.telefone),
        endereco: professor.endereco,
        salario: formatCurrencyInput((professor.salario * 100).toString()),
        formacao: professor.formacao,
        especialidade: professor.especialidade,
      });
    } else {
      setEditingProfessor(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingProfessor(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      ...formData,
      cpf: removeMask(formData.cpf),
      telefone: removeMask(formData.telefone),
      salario: currencyToNumber(formData.salario),
    };
    try {
      if (editingProfessor) {
        await professorService.atualizar(editingProfessor.id, payload);
        toast.success('Professor atualizado com sucesso!');
      } else {
        await professorService.criar(payload);
        toast.success('Professor criado com sucesso!');
      }
      handleCloseModal();
      loadProfessores();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar professor');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja desativar este professor? O histórico será mantido.')) return;
    try {
      await professorService.excluir(id);
      toast.success('Professor desativado com sucesso!');
      loadProfessores();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar professor');
    }
  }

  const filteredProfessores = professores.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.especialidade.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    professores: filteredProfessores,
    isLoading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editingProfessor,
    isSaving,
    formData,
    setFormData,
    loadProfessores,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  };
}
