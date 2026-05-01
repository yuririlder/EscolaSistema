import { useState, useEffect } from 'react';
import { Despesa } from '../../../types';
import { financeiroService } from '../../../services/financeiroService';
import { escolaService } from '../../../services/escolaService';
import { gerarReciboDespesaPDF } from '../../../pdf';
import { formatCurrencyInput, currencyToNumber } from '../../../utils/masks';
import toast from 'react-hot-toast';

interface DespesaFormData {
  descricao: string; valor: string; categoria: string;
  dataVencimento: string; fornecedor: string; observacao: string;
}

interface DadosEscola {
  nome?: string; cnpj?: string; endereco?: string; telefone?: string; email?: string;
}

const initialForm: DespesaFormData = {
  descricao: '', valor: '', categoria: '', dataVencimento: '', fornecedor: '', observacao: '',
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function useDespesasPage() {
  const agora = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(agora.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(agora.getFullYear());
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [escola, setEscola] = useState<DadosEscola | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState<DespesaFormData>(initialForm);

  useEffect(() => { loadDespesas(); }, [mesSelecionado, anoSelecionado]);

  async function loadDespesas() {
    setIsLoading(true);
    try {
      const [data, escolaData] = await Promise.all([
        financeiroService.listarDespesas(mesSelecionado, anoSelecionado),
        escolaService.obter().catch(() => null),
      ]);
      setDespesas(data);
      if (escolaData) setEscola(escolaData);
    } catch {
      toast.error('Erro ao carregar despesas');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(despesa?: Despesa) {
    if (despesa) {
      const d = despesa as any;
      setEditingDespesa(despesa);
      setFormData({
        descricao: d.descricao,
        valor: formatCurrencyInput((d.valor * 100).toString()),
        categoria: d.categoria,
        dataVencimento: new Date(d.dataVencimento || d.data_vencimento).toISOString().split('T')[0],
        fornecedor: d.fornecedor || '',
        observacao: d.observacao || d.observacoes || '',
      });
    } else {
      setEditingDespesa(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingDespesa(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        descricao: formData.descricao, categoria: formData.categoria,
        valor: currencyToNumber(formData.valor), data_vencimento: formData.dataVencimento,
        fornecedor: formData.fornecedor, observacoes: formData.observacao,
      };
      if (editingDespesa) {
        await financeiroService.atualizarDespesa(editingDespesa.id, payload);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await financeiroService.criarDespesa(payload);
        toast.success('Despesa criada com sucesso!');
      }
      handleCloseModal();
      loadDespesas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar despesa');
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenPayModal(despesa: Despesa) {
    setSelectedDespesa(despesa);
    setFormaPagamento('PIX');
    setIsPayModalOpen(true);
  }

  async function handlePagar(id: string) {
    setIsPaying(true);
    try {
      await financeiroService.pagarDespesa(id, { forma_pagamento: formaPagamento });
      toast.success('Despesa paga com sucesso!');
      if (selectedDespesa) {
        const d = selectedDespesa as any;
        gerarReciboDespesaPDF({
          descricao: d.descricao, categoria: d.categoria, valor: d.valor,
          dataVencimento: formatDate(d.dataVencimento || d.data_vencimento),
          dataPagamento: formatDate(new Date().toISOString()),
          fornecedor: d.fornecedor, formaPagamento,
        }, escola || undefined);
      }
      setIsPayModalOpen(false);
      setSelectedDespesa(null);
      loadDespesas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao pagar despesa');
    } finally {
      setIsPaying(false);
    }
  }

  function handlePrintRecibo(despesa: Despesa) {
    const d = despesa as any;
    gerarReciboDespesaPDF({
      descricao: d.descricao, categoria: d.categoria, valor: d.valor,
      dataVencimento: formatDate(d.dataVencimento || d.data_vencimento),
      dataPagamento: d.data_pagamento ? formatDate(d.data_pagamento) : '-',
      fornecedor: d.fornecedor, formaPagamento: d.forma_pagamento || '-',
    }, escola || undefined);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja cancelar esta despesa? O histórico será mantido.')) return;
    try {
      await financeiroService.excluirDespesa(id);
      toast.success('Despesa cancelada com sucesso!');
      loadDespesas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cancelar despesa');
    }
  }

  const filteredDespesas = despesas.filter(
    (d) =>
      d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    agora, mesSelecionado, setMesSelecionado, anoSelecionado, setAnoSelecionado,
    despesas: filteredDespesas, isLoading, searchTerm, setSearchTerm,
    isModalOpen, editingDespesa, isSaving, formData, setFormData,
    isPayModalOpen, setIsPayModalOpen, selectedDespesa, setSelectedDespesa,
    formaPagamento, setFormaPagamento, isPaying,
    loadDespesas, handleOpenModal, handleCloseModal, handleSubmit,
    handleOpenPayModal, handlePagar, handlePrintRecibo, handleDelete,
  };
}
