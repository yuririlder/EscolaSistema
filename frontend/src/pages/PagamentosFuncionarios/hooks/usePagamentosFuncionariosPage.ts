import { useState, useEffect } from 'react';
import { PagamentoFuncionario, Funcionario } from '../../../types';
import { financeiroService } from '../../../services/financeiroService';
import { professorService } from '../../../services/professorService';
import { escolaService } from '../../../services/escolaService';
import { gerarReciboPagamentoFuncionarioPDF } from '../../../pdf';
import { formatCurrencyInput, currencyToNumber, formatNumberInput } from '../../../utils/masks';
import toast from 'react-hot-toast';

interface PagamentoFormData {
  funcionarioId: string; mesReferencia: number; anoReferencia: string;
  valorBase: string; bonus: string; descontos: string; observacao: string;
}

interface DadosEscola {
  nome?: string; cnpj?: string; endereco?: string; telefone?: string; email?: string;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export { MESES };

const initialForm: PagamentoFormData = {
  funcionarioId: '', mesReferencia: new Date().getMonth() + 1,
  anoReferencia: new Date().getFullYear().toString(),
  valorBase: '', bonus: '', descontos: '', observacao: '',
};

export function usePagamentosFuncionariosPage() {
  const [pagamentos, setPagamentos] = useState<PagamentoFuncionario[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [escola, setEscola] = useState<DadosEscola | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<PagamentoFuncionario | null>(null);
  const [formaPagamento, setFormaPagamento] = useState('TRANSFERENCIA');
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState<PagamentoFormData>(initialForm);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [pagamentosData, funcionariosData, escolaData] = await Promise.all([
        financeiroService.listarPagamentosFuncionarios(),
        professorService.listar(),
        escolaService.obter().catch(() => null),
      ]);
      setPagamentos(pagamentosData);
      setFuncionarios(funcionariosData);
      if (escolaData) setEscola(escolaData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal() {
    setFormData(initialForm);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleFuncionarioChange(professorId: string) {
    const funcionario = funcionarios.find((f) => f.id === professorId) as any;
    const funcId = funcionario?.funcionario_id || funcionario?.id;
    setFormData({
      ...formData, funcionarioId: funcId,
      valorBase: funcionario?.salario ? formatCurrencyInput((funcionario.salario * 100).toString()) : '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      funcionario_id: formData.funcionarioId,
      mes_referencia: formData.mesReferencia,
      ano_referencia: parseInt(formData.anoReferencia, 10),
      salario_base: currencyToNumber(formData.valorBase),
      bonus: currencyToNumber(formData.bonus),
      descontos: currencyToNumber(formData.descontos),
      observacoes: formData.observacao,
    };
    try {
      await financeiroService.criarPagamentoFuncionario(payload);
      toast.success('Pagamento criado com sucesso!');
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar pagamento');
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenPayModal(pagamento: PagamentoFuncionario) {
    setSelectedPagamento(pagamento);
    setFormaPagamento('TRANSFERENCIA');
    setIsPayModalOpen(true);
  }

  async function handlePagar(id: string) {
    setIsPaying(true);
    try {
      await financeiroService.pagarFuncionario(id, { forma_pagamento: formaPagamento });
      toast.success('Pagamento realizado com sucesso!');
      if (selectedPagamento) {
        const pag = selectedPagamento as any;
        const mesRef = pag.mes_referencia || pag.mesReferencia || 1;
        const salarioBase = pag.salario_base || pag.valorBase || 0;
        const bonus = pag.bonus || 0;
        const descontos = pag.descontos || 0;
        gerarReciboPagamentoFuncionarioPDF({
          funcionarioNome: pag.funcionario?.nome || pag.funcionario_nome || '',
          mesReferencia: MESES[mesRef - 1],
          anoReferencia: pag.ano_referencia || pag.anoReferencia || '',
          salarioBase, bonus, descontos,
          valorLiquido: pag.valor_liquido || pag.valorFinal || salarioBase + bonus - descontos,
          dataPagamento: new Date().toLocaleDateString('pt-BR'),
          formaPagamento,
        }, escola || undefined);
      }
      setIsPayModalOpen(false);
      setSelectedPagamento(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao realizar pagamento');
    } finally {
      setIsPaying(false);
    }
  }

  function handlePrintRecibo(pagamento: PagamentoFuncionario) {
    const pag = pagamento as any;
    const mesRef = pag.mes_referencia || pag.mesReferencia || 1;
    const salarioBase = pag.salario_base || pag.valorBase || 0;
    const bonus = pag.bonus || 0;
    const descontos = pag.descontos || 0;
    gerarReciboPagamentoFuncionarioPDF({
      funcionarioNome: pag.funcionario?.nome || pag.funcionario_nome || '',
      mesReferencia: MESES[mesRef - 1],
      anoReferencia: pag.ano_referencia || pag.anoReferencia || '',
      salarioBase, bonus, descontos,
      valorLiquido: pag.valor_liquido || pag.valorFinal || salarioBase + bonus - descontos,
      dataPagamento: pag.data_pagamento ? new Date(pag.data_pagamento).toLocaleDateString('pt-BR') : '-',
      formaPagamento: pag.forma_pagamento || pag.formaPagamento || '-',
    }, escola || undefined);
  }

  const filteredPagamentos = pagamentos.filter((p) => {
    const pag = p as any;
    return (pag.funcionario?.nome || pag.funcionario_nome || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const funcionarioOptions = funcionarios.map((f) => ({
    value: f.id, label: `${f.nome}${f.cpf ? ` - CPF: ${f.cpf}` : ''}`,
  }));

  const valorFinal = currencyToNumber(formData.valorBase) + currencyToNumber(formData.bonus) - currencyToNumber(formData.descontos);

  return {
    pagamentos: filteredPagamentos, funcionarios, isLoading, searchTerm, setSearchTerm,
    isModalOpen, isSaving, formData, setFormData,
    isPayModalOpen, setIsPayModalOpen, selectedPagamento, setSelectedPagamento,
    formaPagamento, setFormaPagamento, isPaying, valorFinal, funcionarioOptions,
    handleOpenModal, handleCloseModal, handleFuncionarioChange, handleSubmit,
    handleOpenPayModal, handlePagar, handlePrintRecibo,
    formatCurrencyInput, currencyToNumber, formatNumberInput,
  };
}
