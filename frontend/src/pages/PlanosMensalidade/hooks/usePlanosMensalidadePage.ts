import { useState } from 'react';
import { PlanoMensalidade } from '../../../types';
import { financeiroService } from '../../../services/financeiroService';
import { formatCurrencyInput, currencyToNumber } from '../../../utils/masks';
import toast from 'react-hot-toast';

interface PlanoFormData {
  nome: string;
  valor: string;
  descricao: string;
  ativo: boolean;
}

const initialForm: PlanoFormData = { nome: '', valor: '', descricao: '', ativo: true };

export function usePlanosMensalidadePage() {
  const [planos, setPlanos] = useState<PlanoMensalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoMensalidade | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<PlanoFormData>(initialForm);

  async function loadPlanos() {
    try {
      const data = await financeiroService.listarPlanos();
      setPlanos(data);
    } catch {
      toast.error('Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(plano?: PlanoMensalidade) {
    if (plano) {
      setEditingPlano(plano);
      setFormData({ nome: plano.nome, valor: formatCurrencyInput((plano.valor * 100).toString()), descricao: plano.descricao || '', ativo: plano.ativo });
    } else {
      setEditingPlano(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingPlano(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...formData, valor: currencyToNumber(formData.valor) };
    try {
      if (editingPlano) {
        await financeiroService.atualizarPlano(editingPlano.id, payload);
        toast.success('Plano atualizado com sucesso!');
      } else {
        await financeiroService.criarPlano(payload);
        toast.success('Plano criado com sucesso!');
      }
      handleCloseModal();
      loadPlanos();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar plano');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja desativar este plano? O histórico será mantido.')) return;
    try {
      await financeiroService.excluirPlano(id);
      toast.success('Plano desativado com sucesso!');
      loadPlanos();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar plano');
    }
  }

  const filteredPlanos = planos.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    planos: filteredPlanos,
    isLoading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editingPlano,
    isSaving,
    formData,
    setFormData,
    loadPlanos,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  };
}
