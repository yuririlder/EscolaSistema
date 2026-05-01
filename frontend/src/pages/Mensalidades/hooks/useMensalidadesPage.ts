import { useState, useEffect, useMemo } from 'react';
import { Mensalidade, StatusMensalidade } from '../../../types';
import { financeiroService } from '../../../services/financeiroService';
import { escolaService } from '../../../services/escolaService';
import { gerarReciboMensalidadePDF } from '../../../pdf';
import { formatCurrencyInput, currencyToNumber, formatPercentInput, formatCurrency } from '../../../utils/masks';
import toast from 'react-hot-toast';

export interface AlunoMensalidades {
  alunoId: string; alunoNome: string; alunoAtivo: boolean;
  responsavelNome?: string; mensalidades: Mensalidade[];
  totalPendente: number; totalPago: number;
}

interface DadosEscola {
  nome?: string; cnpj?: string; endereco?: string; telefone?: string; email?: string;
}

export const MESES_MENS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function useMensalidadesPage() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'ativos' | 'inativos'>('ativos');
  const [expandedAlunos, setExpandedAlunos] = useState<Set<string>>(new Set());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMensalidade, setSelectedMensalidade] = useState<Mensalidade | null>(null);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [isPaying, setIsPaying] = useState(false);
  const [descontoTipo, setDescontoTipo] = useState<'percentual' | 'valor'>('valor');
  const [descontoValor, setDescontoValor] = useState('');
  const [descontoMotivo, setDescontoMotivo] = useState('');
  const [acrescimoTipo, setAcrescimoTipo] = useState<'percentual' | 'valor'>('valor');
  const [acrescimoValor, setAcrescimoValor] = useState('');
  const [acrescimoMotivo, setAcrescimoMotivo] = useState('');
  const [escola, setEscola] = useState<DadosEscola | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMensalidadeEdit, setSelectedMensalidadeEdit] = useState<Mensalidade | null>(null);
  const [novoValor, setNovoValor] = useState('');
  const [motivoAlteracao, setMotivoAlteracao] = useState('');
  const [aplicarEmTodas, setAplicarEmTodas] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadMensalidades();
    loadEscola();
  }, []);

  async function loadEscola() {
    try { setEscola(await escolaService.obter()); } catch { /* silently fail */ }
  }

  async function loadMensalidades() {
    try {
      setMensalidades(await financeiroService.listarMensalidades());
    } catch {
      toast.error('Erro ao carregar mensalidades');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleAluno(alunoId: string) {
    setExpandedAlunos((prev) => {
      const next = new Set(prev);
      if (next.has(alunoId)) next.delete(alunoId); else next.add(alunoId);
      return next;
    });
  }

  function handleOpenPayModal(mensalidade: Mensalidade) {
    setSelectedMensalidade(mensalidade);
    setFormaPagamento('PIX');
    setDescontoTipo('valor'); setDescontoValor(''); setDescontoMotivo('');
    setAcrescimoTipo('valor'); setAcrescimoValor(''); setAcrescimoMotivo('');
    setIsPayModalOpen(true);
  }

  function handleClosePayModal() {
    setIsPayModalOpen(false);
    setSelectedMensalidade(null);
    setDescontoValor(''); setDescontoMotivo('');
    setAcrescimoValor(''); setAcrescimoMotivo('');
  }

  function calcularValorFinal() {
    if (!selectedMensalidade) return 0;
    const mens = selectedMensalidade as any;
    let valorBase = mens.valor || mens.valorFinal || 0;
    if (descontoValor) {
      if (descontoTipo === 'percentual') valorBase -= valorBase * (parseFloat(descontoValor) / 100 || 0);
      else valorBase -= currencyToNumber(descontoValor);
    }
    if (acrescimoValor) {
      if (acrescimoTipo === 'percentual') valorBase += valorBase * (parseFloat(acrescimoValor) / 100 || 0);
      else valorBase += currencyToNumber(acrescimoValor);
    }
    return Math.max(0, valorBase);
  }

  async function handlePagar() {
    if (!selectedMensalidade) return;
    if (descontoValor && !descontoMotivo.trim()) { toast.error('Informe o motivo do desconto'); return; }
    if (acrescimoValor && !acrescimoMotivo.trim()) { toast.error('Informe o motivo do acréscimo'); return; }
    setIsPaying(true);
    try {
      const valorFinal = calcularValorFinal();
      const desconto = descontoValor ? {
        tipo: descontoTipo,
        valor: descontoTipo === 'percentual' ? parseFloat(descontoValor) || 0 : currencyToNumber(descontoValor),
        motivo: descontoMotivo.trim(),
      } : undefined;
      const acrescimo = acrescimoValor ? {
        tipo: acrescimoTipo,
        valor: acrescimoTipo === 'percentual' ? parseFloat(acrescimoValor) || 0 : currencyToNumber(acrescimoValor),
        motivo: acrescimoMotivo.trim(),
      } : undefined;
      await financeiroService.pagarMensalidade(selectedMensalidade.id, { formaPagamento, desconto, acrescimo, valorPago: valorFinal });
      toast.success('Pagamento registrado com sucesso!');
      const mens = selectedMensalidade as any;
      const mesRef = mens.mes_referencia || mens.mesReferencia || 1;
      gerarReciboMensalidadePDF({
        alunoNome: mens.aluno_nome || '',
        responsavelNome: mens.responsavel_nome || '',
        responsavelCpf: mens.responsavel_cpf || '',
        mesReferencia: MESES_MENS[mesRef - 1],
        anoReferencia: mens.ano_referencia || mens.anoReferencia || '',
        dataVencimento: mens.data_vencimento ? formatDate(mens.data_vencimento) : '-',
        dataPagamento: formatDate(new Date().toISOString()),
        valor: valorFinal, formaPagamento,
      }, escola || undefined);
      handleClosePayModal();
      loadMensalidades();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao registrar pagamento');
    } finally {
      setIsPaying(false);
    }
  }

  function handlePrintRecibo(mensalidade: Mensalidade) {
    const mens = mensalidade as any;
    const mesRef = mens.mes_referencia || mens.mesReferencia || 1;
    const valorOriginal = parseFloat(mens.valor) || 0;
    const valorPago = parseFloat(mens.valor_pago) || valorOriginal;
    const desconto = parseFloat(mens.desconto) || 0;
    const acrescimo = parseFloat(mens.acrescimo) || 0;
    let descontoMotivoStr = '', acrescimoMotivoStr = '';
    if (mens.observacoes) {
      for (const line of mens.observacoes.split('\n')) {
        const match = line.match(/Motivo:\s*(.+)$/);
        if (line.includes('Desconto aplicado') && match) descontoMotivoStr = match[1];
        if (line.includes('Acréscimo aplicado') && match) acrescimoMotivoStr = match[1];
      }
    }
    gerarReciboMensalidadePDF({
      alunoNome: mens.aluno_nome || '-',
      responsavelNome: mens.responsavel_nome || '',
      responsavelCpf: mens.responsavel_cpf || '',
      mesReferencia: MESES_MENS[mesRef - 1],
      anoReferencia: mens.ano_referencia || mens.anoReferencia || '',
      dataVencimento: mens.data_vencimento ? formatDate(mens.data_vencimento) : '-',
      dataPagamento: mens.data_pagamento ? formatDate(mens.data_pagamento) : '-',
      valor: valorPago,
      valorOriginal: (desconto > 0 || acrescimo > 0) ? valorOriginal : undefined,
      desconto: desconto > 0 ? desconto : undefined, acrescimo: acrescimo > 0 ? acrescimo : undefined,
      descontoMotivo: descontoMotivoStr || undefined, acrescimoMotivo: acrescimoMotivoStr || undefined,
      formaPagamento: mens.forma_pagamento || mens.formaPagamento || '-',
    }, escola || undefined);
  }

  function handleOpenEditModal(mensalidade: Mensalidade) {
    const mens = mensalidade as any;
    const valorAtual = mens.valor || mens.valorFinal || 0;
    setSelectedMensalidadeEdit(mensalidade);
    setNovoValor(formatCurrencyInput((valorAtual * 100).toString()));
    setMotivoAlteracao(''); setAplicarEmTodas(false);
    setIsEditModalOpen(true);
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    setSelectedMensalidadeEdit(null);
    setNovoValor(''); setMotivoAlteracao(''); setAplicarEmTodas(false);
  }

  async function handleAlterarValor() {
    if (!selectedMensalidadeEdit) return;
    const valorNumerico = currencyToNumber(novoValor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) { toast.error('Informe um valor válido maior que zero'); return; }
    if (!motivoAlteracao.trim()) { toast.error('Informe o motivo da alteração'); return; }
    setIsEditing(true);
    try {
      await financeiroService.alterarValorMensalidade(selectedMensalidadeEdit.id, {
        valor: valorNumerico, motivo: motivoAlteracao.trim(), aplicarEmTodas,
      });
      toast.success(aplicarEmTodas ? 'Valor alterado em todas as mensalidades futuras!' : 'Valor da mensalidade alterado com sucesso!');
      handleCloseEditModal();
      loadMensalidades();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar valor da mensalidade');
    } finally {
      setIsEditing(false);
    }
  }

  const alunosAgrupados = useMemo(() => {
    const grupos: { [key: string]: AlunoMensalidades } = {};
    mensalidades.forEach((m) => {
      const mens = m as any;
      const alunoId = mens.aluno_id || mens.alunoId || '';
      if (!grupos[alunoId]) {
        grupos[alunoId] = {
          alunoId, alunoNome: mens.aluno_nome || mens.matricula?.aluno?.nome || 'Sem nome',
          alunoAtivo: mens.aluno_ativo !== false,
          responsavelNome: mens.responsavel_nome || mens.matricula?.aluno?.responsavel?.nome,
          mensalidades: [], totalPendente: 0, totalPago: 0,
        };
      }
      grupos[alunoId].mensalidades.push(m);
      const valorOriginal = parseFloat(mens.valor) || 0;
      const valorPago = parseFloat(mens.valor_pago) || 0;
      if (m.status === StatusMensalidade.PAGO) {
        grupos[alunoId].totalPago += valorPago > 0 ? valorPago : valorOriginal;
      } else if ([StatusMensalidade.PENDENTE, StatusMensalidade.ATRASADO, StatusMensalidade.VENCIDA, 'VENCIDA' as any].includes(m.status)) {
        grupos[alunoId].totalPendente += valorOriginal;
      }
    });
    Object.values(grupos).forEach((g) => {
      g.mensalidades.sort((a, b) => {
        const ma = a as any; const mb = b as any;
        return ((ma.ano_referencia || 0) - (mb.ano_referencia || 0)) || ((ma.mes_referencia || 0) - (mb.mes_referencia || 0));
      });
    });
    return Object.values(grupos).sort((a, b) => a.alunoNome.localeCompare(b.alunoNome));
  }, [mensalidades]);

  const filteredAlunos = useMemo(() => {
    return alunosAgrupados.filter((a) => {
      const matchFiltro = filtroAtivo === 'ativos' ? a.alunoAtivo : !a.alunoAtivo;
      const matchSearch = !searchTerm || a.alunoNome.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFiltro && matchSearch;
    });
  }, [alunosAgrupados, searchTerm, filtroAtivo]);

  return {
    isLoading, searchTerm, setSearchTerm, filtroAtivo, setFiltroAtivo,
    filteredAlunos, expandedAlunos, toggleAluno,
    isPayModalOpen, selectedMensalidade, formaPagamento, setFormaPagamento, isPaying,
    descontoTipo, setDescontoTipo, descontoValor, setDescontoValor, descontoMotivo, setDescontoMotivo,
    acrescimoTipo, setAcrescimoTipo, acrescimoValor, setAcrescimoValor, acrescimoMotivo, setAcrescimoMotivo,
    calcularValorFinal, handleOpenPayModal, handleClosePayModal, handlePagar, handlePrintRecibo,
    isEditModalOpen, selectedMensalidadeEdit, novoValor, setNovoValor,
    motivoAlteracao, setMotivoAlteracao, aplicarEmTodas, setAplicarEmTodas, isEditing,
    handleOpenEditModal, handleCloseEditModal, handleAlterarValor,
    formatCurrencyInput, formatPercentInput, formatCurrency,
  };
}
