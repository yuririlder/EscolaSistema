import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Mensalidade, StatusMensalidade } from '../types';
import { financeiroService } from '../services/financeiroService';
import { escolaService } from '../services/escolaService';
import { Search, DollarSign, Printer, ChevronDown, ChevronRight, User, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { gerarReciboMensalidadePDF } from '../utils/pdfGenerator';
import { formatCurrencyInput, currencyToNumber, formatPercentInput } from '../utils/masks';

interface AlunoMensalidades {
  alunoId: string;
  alunoNome: string;
  responsavelNome?: string;
  mensalidades: Mensalidade[];
  totalPendente: number;
  totalPago: number;
}

interface DadosEscola {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export function Mensalidades() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAlunos, setExpandedAlunos] = useState<Set<string>>(new Set());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMensalidade, setSelectedMensalidade] = useState<Mensalidade | null>(null);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [isPaying, setIsPaying] = useState(false);
  
  // Estados para desconto e acréscimo no pagamento
  const [descontoTipo, setDescontoTipo] = useState<'percentual' | 'valor'>('valor');
  const [descontoValor, setDescontoValor] = useState('');
  const [descontoMotivo, setDescontoMotivo] = useState('');
  const [acrescimoTipo, setAcrescimoTipo] = useState<'percentual' | 'valor'>('valor');
  const [acrescimoValor, setAcrescimoValor] = useState('');
  const [acrescimoMotivo, setAcrescimoMotivo] = useState('');
  const [escola, setEscola] = useState<DadosEscola | null>(null);
  
  // Estados para edição de valor
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

  const loadEscola = async () => {
    try {
      const data = await escolaService.obter();
      setEscola(data);
    } catch (error) {
      // Silently fail if school data is not available
    }
  };

  const loadMensalidades = async () => {
    try {
      const data = await financeiroService.listarMensalidades();
      setMensalidades(data);
    } catch (error) {
      toast.error('Erro ao carregar mensalidades');
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar mensalidades por aluno
  const alunosAgrupados = useMemo(() => {
    const grupos: { [key: string]: AlunoMensalidades } = {};

    mensalidades.forEach((m) => {
      const mens = m as any;
      const alunoId = mens.aluno_id || mens.alunoId || '';
      const alunoNome = mens.aluno_nome || mens.matricula?.aluno?.nome || 'Sem nome';
      const responsavelNome = mens.responsavel_nome || mens.matricula?.aluno?.responsavel?.nome;

      if (!grupos[alunoId]) {
        grupos[alunoId] = {
          alunoId,
          alunoNome,
          responsavelNome,
          mensalidades: [],
          totalPendente: 0,
          totalPago: 0,
        };
      }

      grupos[alunoId].mensalidades.push(m);
      const valorOriginal = parseFloat(mens.valor) || 0;
      const valorPago = parseFloat(mens.valor_pago) || 0;

      if (m.status === StatusMensalidade.PAGO) {
        // Para mensalidades pagas, usar o valor_pago (que reflete desconto/acréscimo)
        grupos[alunoId].totalPago += valorPago > 0 ? valorPago : valorOriginal;
      } else if (m.status === StatusMensalidade.PENDENTE || 
                 m.status === StatusMensalidade.ATRASADO || 
                 m.status === StatusMensalidade.VENCIDA ||
                 (m.status as string) === 'VENCIDA') {
        grupos[alunoId].totalPendente += valorOriginal;
      }
      // Mensalidades FUTURA não entram no total pendente
    });

    // Ordenar mensalidades de cada aluno por mês/ano
    Object.values(grupos).forEach((grupo) => {
      grupo.mensalidades.sort((a, b) => {
        const ma = a as any;
        const mb = b as any;
        const anoA = ma.ano_referencia || ma.anoReferencia || 0;
        const anoB = mb.ano_referencia || mb.anoReferencia || 0;
        const mesA = ma.mes_referencia || ma.mesReferencia || 0;
        const mesB = mb.mes_referencia || mb.mesReferencia || 0;
        return anoA - anoB || mesA - mesB;
      });
    });

    return Object.values(grupos).sort((a, b) => a.alunoNome.localeCompare(b.alunoNome));
  }, [mensalidades]);

  // Filtrar alunos pelo termo de busca
  const filteredAlunos = useMemo(() => {
    if (!searchTerm) return alunosAgrupados;
    return alunosAgrupados.filter((a) =>
      a.alunoNome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alunosAgrupados, searchTerm]);

  const toggleAluno = (alunoId: string) => {
    setExpandedAlunos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(alunoId)) {
        newSet.delete(alunoId);
      } else {
        newSet.add(alunoId);
      }
      return newSet;
    });
  };

  const handleOpenPayModal = (mensalidade: Mensalidade) => {
    setSelectedMensalidade(mensalidade);
    setFormaPagamento('PIX');
    setDescontoTipo('valor');
    setDescontoValor('');
    setDescontoMotivo('');
    setAcrescimoTipo('valor');
    setAcrescimoValor('');
    setAcrescimoMotivo('');
    setIsPayModalOpen(true);
  };

  const handleClosePayModal = () => {
    setIsPayModalOpen(false);
    setSelectedMensalidade(null);
    setDescontoValor('');
    setDescontoMotivo('');
    setAcrescimoValor('');
    setAcrescimoMotivo('');
  };

  // Calcular valor final com desconto e acréscimo
  const calcularValorFinal = () => {
    if (!selectedMensalidade) return 0;
    const mens = selectedMensalidade as any;
    let valorBase = mens.valor || mens.valorFinal || 0;
    
    // Aplicar desconto
    if (descontoValor) {
      if (descontoTipo === 'percentual') {
        const desconto = parseFloat(descontoValor) || 0;
        valorBase -= valorBase * (desconto / 100);
      } else {
        const desconto = currencyToNumber(descontoValor);
        valorBase -= desconto;
      }
    }
    
    // Aplicar acréscimo
    if (acrescimoValor) {
      if (acrescimoTipo === 'percentual') {
        const acrescimo = parseFloat(acrescimoValor) || 0;
        valorBase += valorBase * (acrescimo / 100);
      } else {
        const acrescimo = currencyToNumber(acrescimoValor);
        valorBase += acrescimo;
      }
    }
    
    return Math.max(0, valorBase);
  };

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const handlePagar = async () => {
    if (!selectedMensalidade) return;
    
    // Validar motivos obrigatórios
    if (descontoValor && !descontoMotivo.trim()) {
      toast.error('Informe o motivo do desconto');
      return;
    }
    if (acrescimoValor && !acrescimoMotivo.trim()) {
      toast.error('Informe o motivo do acréscimo');
      return;
    }
    
    setIsPaying(true);

    try {
      const valorFinal = calcularValorFinal();
      const desconto = descontoValor ? {
        tipo: descontoTipo,
        valor: descontoTipo === 'percentual' 
          ? parseFloat(descontoValor) || 0 
          : currencyToNumber(descontoValor),
        motivo: descontoMotivo.trim()
      } : undefined;
      const acrescimo = acrescimoValor ? {
        tipo: acrescimoTipo,
        valor: acrescimoTipo === 'percentual' 
          ? parseFloat(acrescimoValor) || 0 
          : currencyToNumber(acrescimoValor),
        motivo: acrescimoMotivo.trim()
      } : undefined;
      
      await financeiroService.pagarMensalidade(selectedMensalidade.id, { 
        formaPagamento,
        desconto,
        acrescimo,
        valorPago: valorFinal
      });
      toast.success('Pagamento registrado com sucesso!');
      
      // Gerar PDF do recibo
      const mens = selectedMensalidade as any;
      const mesRef = mens.mes_referencia || mens.mesReferencia || 1;
      const anoRef = mens.ano_referencia || mens.anoReferencia || '';
      const dataVencimento = mens.data_vencimento || mens.dataVencimento;
      const alunoNome = mens.aluno_nome || '';
      const responsavelNome = mens.responsavel_nome || '';
      
      gerarReciboMensalidadePDF({
        alunoNome,
        responsavelNome,
        mesReferencia: meses[mesRef - 1],
        anoReferencia: anoRef,
        dataVencimento: dataVencimento ? formatDate(dataVencimento) : '-',
        dataPagamento: formatDate(new Date().toISOString()),
        valor: valorFinal,
        formaPagamento,
      }, escola || undefined);
      
      handleClosePayModal();
      loadMensalidades();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao registrar pagamento');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePrintRecibo = (mensalidade: Mensalidade) => {
    const mens = mensalidade as any;
    const alunoNome = mens.aluno_nome || '-';
    const responsavelNome = mens.responsavel_nome || '';
    const mesRef = mens.mes_referencia || mens.mesReferencia || 1;
    const anoRef = mens.ano_referencia || mens.anoReferencia || '';
    const dataVencimento = mens.data_vencimento || mens.dataVencimento;
    const dataPagamento = mens.data_pagamento || mens.dataPagamento;
    const formaPag = mens.forma_pagamento || mens.formaPagamento || '-';
    const valorOriginal = parseFloat(mens.valor) || 0;
    const valorPago = parseFloat(mens.valor_pago) || valorOriginal;
    const desconto = parseFloat(mens.desconto) || 0;
    const acrescimo = parseFloat(mens.acrescimo) || 0;
    
    // Extrair motivos das observações se existirem
    let descontoMotivo = '';
    let acrescimoMotivo = '';
    if (mens.observacoes) {
      const obsLines = mens.observacoes.split('\n');
      for (const line of obsLines) {
        if (line.includes('Desconto aplicado') && line.includes('Motivo:')) {
          const match = line.match(/Motivo:\s*(.+)$/);
          if (match) descontoMotivo = match[1];
        }
        if (line.includes('Acréscimo aplicado') && line.includes('Motivo:')) {
          const match = line.match(/Motivo:\s*(.+)$/);
          if (match) acrescimoMotivo = match[1];
        }
      }
    }

    gerarReciboMensalidadePDF({
      alunoNome,
      responsavelNome,
      mesReferencia: meses[mesRef - 1],
      anoReferencia: anoRef,
      dataVencimento: dataVencimento ? formatDate(dataVencimento) : '-',
      dataPagamento: dataPagamento ? formatDate(dataPagamento) : '-',
      valor: valorPago,
      valorOriginal: (desconto > 0 || acrescimo > 0) ? valorOriginal : undefined,
      desconto: desconto > 0 ? desconto : undefined,
      acrescimo: acrescimo > 0 ? acrescimo : undefined,
      descontoMotivo: descontoMotivo || undefined,
      acrescimoMotivo: acrescimoMotivo || undefined,
      formaPagamento: formaPag,
    }, escola || undefined);
  };

  // Funções para edição de valor
  const handleOpenEditModal = (mensalidade: Mensalidade) => {
    const mens = mensalidade as any;
    const valorAtual = mens.valor || mens.valorFinal || 0;
    setSelectedMensalidadeEdit(mensalidade);
    // Formatar valor com máscara (multiplicar por 100 para a máscara funcionar corretamente)
    setNovoValor(formatCurrencyInput((valorAtual * 100).toString()));
    setMotivoAlteracao('');
    setAplicarEmTodas(false);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMensalidadeEdit(null);
    setNovoValor('');
    setMotivoAlteracao('');
    setAplicarEmTodas(false);
  };

  const handleAlterarValor = async () => {
    if (!selectedMensalidadeEdit) return;
    
    const valorNumerico = currencyToNumber(novoValor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }

    if (!motivoAlteracao.trim()) {
      toast.error('Informe o motivo da alteração');
      return;
    }

    setIsEditing(true);
    try {
      await financeiroService.alterarValorMensalidade(selectedMensalidadeEdit.id, {
        valor: valorNumerico,
        motivo: motivoAlteracao.trim(),
        aplicarEmTodas,
      });
      const msg = aplicarEmTodas 
        ? 'Valor alterado em todas as mensalidades futuras!' 
        : 'Valor da mensalidade alterado com sucesso!';
      toast.success(msg);
      handleCloseEditModal();
      loadMensalidades();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar valor da mensalidade');
    } finally {
      setIsEditing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusVariant = (status: StatusMensalidade | string) => {
    switch (status) {
      case StatusMensalidade.PAGO:
      case 'PAGO':
        return 'success';
      case StatusMensalidade.PENDENTE:
      case 'PENDENTE':
        return 'warning';
      case StatusMensalidade.ATRASADO:
      case 'ATRASADO':
      case StatusMensalidade.VENCIDA:
      case 'VENCIDA':
        return 'danger';
      case StatusMensalidade.FUTURA:
      case 'FUTURA':
        return 'info';
      case StatusMensalidade.CANCELADO:
      case 'CANCELADO':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mensalidades</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAlunos.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhuma mensalidade encontrada
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlunos.map((aluno) => (
                <div key={aluno.alunoId}>
                  {/* Cabeçalho do aluno (clicável) */}
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAluno(aluno.alunoId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {expandedAlunos.has(aluno.alunoId) ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </div>
                      <div className="p-2 bg-primary-100 rounded-full">
                        <User size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{aluno.alunoNome}</p>
                        <p className="text-sm text-gray-500">
                          {aluno.mensalidades.length} mensalidade(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      {aluno.totalPendente > 0 && (
                        <div className="text-right">
                          <p className="text-gray-500">Pendente</p>
                          <p className="font-medium text-yellow-600">
                            {formatCurrency(aluno.totalPendente)}
                          </p>
                        </div>
                      )}
                      {aluno.totalPago > 0 && (
                        <div className="text-right">
                          <p className="text-gray-500">Pago</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(aluno.totalPago)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de mensalidades expandida */}
                  {expandedAlunos.has(aluno.alunoId) && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3 pl-16">Referência</th>
                            <th className="px-6 py-3">Vencimento</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {aluno.mensalidades.map((mensalidade) => {
                            const mens = mensalidade as any;
                            const mesRef = mens.mes_referencia || mens.mesReferencia || 1;
                            const anoRef = mens.ano_referencia || mens.anoReferencia || '';
                            const dataVencimento = mens.data_vencimento || mens.dataVencimento;
                            const valorOriginal = parseFloat(mens.valor) || 0;
                            const valorPago = parseFloat(mens.valor_pago) || 0;
                            const desconto = parseFloat(mens.desconto) || 0;
                            const acrescimo = parseFloat(mens.acrescimo) || 0;
                            const isPago = mensalidade.status === StatusMensalidade.PAGO || (mensalidade.status as string) === 'PAGO';
                            const temAjuste = (desconto > 0 || acrescimo > 0);
                            const valorExibir = isPago && valorPago > 0 ? valorPago : valorOriginal;

                            return (
                              <tr key={mensalidade.id} className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-3 pl-16 text-sm text-gray-900">
                                  {meses[mesRef - 1]}/{anoRef}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-900">
                                  {dataVencimento ? formatDate(dataVencimento) : '-'}
                                </td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <span>{formatCurrency(valorExibir)}</span>
                                    {isPago && temAjuste && (
                                      <span 
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 cursor-help"
                                        title={`Valor original: ${formatCurrency(valorOriginal)}${desconto > 0 ? `\nDesconto: -${formatCurrency(desconto)}` : ''}${acrescimo > 0 ? `\nAcréscimo: +${formatCurrency(acrescimo)}` : ''}`}
                                      >
                                        {desconto > 0 && acrescimo > 0 ? '±' : desconto > 0 ? '↓' : '↑'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <Badge variant={getStatusVariant(mensalidade.status)}>
                                    {mensalidade.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex gap-2">
                                    {/* Botão de editar valor - apenas para mensalidades FUTURAS */}
                                    {(mensalidade.status === StatusMensalidade.FUTURA || (mensalidade.status as string) === 'FUTURA') && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditModal(mensalidade);
                                        }}
                                        title="Alterar Valor"
                                      >
                                        <Pencil size={16} className="text-orange-500" />
                                      </Button>
                                    )}
                                    {mensalidade.status !== StatusMensalidade.PAGO && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenPayModal(mensalidade);
                                        }}
                                        title="Registrar Pagamento"
                                      >
                                        <DollarSign size={16} className="text-green-500" />
                                      </Button>
                                    )}
                                    {mensalidade.status === StatusMensalidade.PAGO && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePrintRecibo(mensalidade);
                                        }}
                                        title="Imprimir Recibo"
                                      >
                                        <Printer size={16} className="text-blue-500" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isPayModalOpen}
        onClose={handleClosePayModal}
        title="Registrar Pagamento"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Registrar pagamento da mensalidade de{' '}
            <strong>
              {selectedMensalidade
                ? `${meses[((selectedMensalidade as any).mes_referencia || (selectedMensalidade as any).mesReferencia || 1) - 1]}/${(selectedMensalidade as any).ano_referencia || (selectedMensalidade as any).anoReferencia || ''}`
                : ''}
            </strong>
          </p>
          
          {/* Valor original */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Valor Original</p>
            <p className="text-lg font-semibold text-gray-700">
              {selectedMensalidade
                ? formatCurrency(
                    (selectedMensalidade as any).valor ||
                      (selectedMensalidade as any).valorFinal ||
                      0
                  )
                : ''}
            </p>
          </div>

          {/* Desconto */}
          <div className="border border-green-200 rounded-lg p-3 bg-green-50">
            <p className="text-sm font-medium text-green-700 mb-2">Desconto (opcional)</p>
            <div className="flex gap-2 mb-2">
              <select
                value={descontoTipo}
                onChange={(e) => {
                  setDescontoTipo(e.target.value as 'percentual' | 'valor');
                  setDescontoValor('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="valor">R$</option>
                <option value="percentual">%</option>
              </select>
              <input
                type="text"
                value={descontoValor}
                onChange={(e) => {
                  if (descontoTipo === 'percentual') {
                    setDescontoValor(formatPercentInput(e.target.value));
                  } else {
                    setDescontoValor(formatCurrencyInput(e.target.value));
                  }
                }}
                placeholder={descontoTipo === 'percentual' ? 'Ex: 10' : 'Ex: 50,00'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {descontoValor && (
              <input
                type="text"
                value={descontoMotivo}
                onChange={(e) => setDescontoMotivo(e.target.value)}
                placeholder="Motivo do desconto (obrigatório)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}
          </div>

          {/* Acréscimo */}
          <div className="border border-red-200 rounded-lg p-3 bg-red-50">
            <p className="text-sm font-medium text-red-700 mb-2">Acréscimo (opcional)</p>
            <div className="flex gap-2 mb-2">
              <select
                value={acrescimoTipo}
                onChange={(e) => {
                  setAcrescimoTipo(e.target.value as 'percentual' | 'valor');
                  setAcrescimoValor('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="valor">R$</option>
                <option value="percentual">%</option>
              </select>
              <input
                type="text"
                value={acrescimoValor}
                onChange={(e) => {
                  if (acrescimoTipo === 'percentual') {
                    setAcrescimoValor(formatPercentInput(e.target.value));
                  } else {
                    setAcrescimoValor(formatCurrencyInput(e.target.value));
                  }
                }}
                placeholder={acrescimoTipo === 'percentual' ? 'Ex: 5' : 'Ex: 25,00'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {acrescimoValor && (
              <input
                type="text"
                value={acrescimoMotivo}
                onChange={(e) => setAcrescimoMotivo(e.target.value)}
                placeholder="Motivo do acréscimo (obrigatório)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            )}
          </div>

          {/* Valor Final */}
          <div className="bg-primary-50 p-3 rounded-lg border-2 border-primary-200">
            <p className="text-sm text-primary-600">Valor a Pagar</p>
            <p className="text-2xl font-bold text-primary-700">
              {formatCurrency(calcularValorFinal())}
            </p>
          </div>

          <Select
            label="Forma de Pagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            options={[
              { value: 'PIX', label: 'PIX' },
              { value: 'DINHEIRO', label: 'Dinheiro' },
              { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
              { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
              { value: 'BOLETO', label: 'Boleto' },
              { value: 'TRANSFERENCIA', label: 'Transferência' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClosePayModal}>
              Cancelar
            </Button>
            <Button onClick={handlePagar} isLoading={isPaying} variant="success">
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Alteração de Valor */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Alterar Valor da Mensalidade"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Alterar valor da mensalidade de{' '}
            <strong>
              {selectedMensalidadeEdit
                ? `${meses[((selectedMensalidadeEdit as any).mes_referencia || (selectedMensalidadeEdit as any).mesReferencia || 1) - 1]}/${(selectedMensalidadeEdit as any).ano_referencia || (selectedMensalidadeEdit as any).anoReferencia || ''}`
                : ''}
            </strong>
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Apenas mensalidades futuras podem ter o valor alterado.
              Mensalidades passadas (pagas ou não) não podem ser modificadas.
            </p>
          </div>

          <Input
            label="Novo Valor (R$)"
            type="text"
            value={novoValor}
            onChange={(e) => setNovoValor(formatCurrencyInput(e.target.value))}
            placeholder="0,00"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo da Alteração *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              value={motivoAlteracao}
              onChange={(e) => setMotivoAlteracao(e.target.value)}
              placeholder="Ex: Troca de período (manhã para integral), desconto concedido, correção de valor..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aplicarEmTodas"
              checked={aplicarEmTodas}
              onChange={(e) => setAplicarEmTodas(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="aplicarEmTodas" className="text-sm text-gray-700">
              Aplicar este valor em <strong>todas</strong> as mensalidades futuras deste aluno
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button onClick={handleAlterarValor} isLoading={isEditing}>
              Confirmar Alteração
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
