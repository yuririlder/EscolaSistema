import { DollarSign, Printer, ChevronDown, ChevronRight, User, Pencil, Users, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StatusMensalidade } from '../../types';
import { formatCurrency } from '../../utils/masks';
import { useMensalidadesPage, MESES_MENS } from './hooks/useMensalidadesPage';
import { PagarMensalidadeModal, EditarValorModal } from './components/MensalidadeModals';

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function getStatusVariant(status: StatusMensalidade | string) {
  switch (status) {
    case StatusMensalidade.PAGO: case 'PAGO': return 'success';
    case StatusMensalidade.PENDENTE: case 'PENDENTE': return 'warning';
    case StatusMensalidade.ATRASADO: case 'ATRASADO':
    case StatusMensalidade.VENCIDA: case 'VENCIDA': return 'danger';
    case StatusMensalidade.FUTURA: case 'FUTURA': return 'info';
    default: return 'default';
  }
}

export function Mensalidades() {
  const {
    isLoading, searchTerm, setSearchTerm, filtroAtivo, setFiltroAtivo,
    filteredAlunos, expandedAlunos, toggleAluno,
    isPayModalOpen, selectedMensalidade, formaPagamento, setFormaPagamento, isPaying,
    descontoTipo, setDescontoTipo, descontoValor, setDescontoValor, descontoMotivo, setDescontoMotivo,
    acrescimoTipo, setAcrescimoTipo, acrescimoValor, setAcrescimoValor, acrescimoMotivo, setAcrescimoMotivo,
    calcularValorFinal, handleOpenPayModal, handleClosePayModal, handlePagar, handlePrintRecibo,
    isEditModalOpen, selectedMensalidadeEdit, novoValor, setNovoValor,
    motivoAlteracao, setMotivoAlteracao, aplicarEmTodas, setAplicarEmTodas, isEditing,
    handleOpenEditModal, handleCloseEditModal, handleAlterarValor,
    formatCurrencyInput, formatPercentInput,
  } = useMensalidadesPage();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mensalidades</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por aluno..." className="flex-1 max-w-sm" />
            <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setFiltroAtivo('ativos')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${filtroAtivo === 'ativos' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Users size={15} /> Ativos
              </button>
              <button
                onClick={() => setFiltroAtivo('inativos')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${filtroAtivo === 'inativos' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <UserX size={15} /> Desativados
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAlunos.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Nenhuma mensalidade encontrada</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlunos.map((aluno) => (
                <div key={aluno.alunoId}>
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleAluno(aluno.alunoId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {expandedAlunos.has(aluno.alunoId) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                      <div className="p-2 bg-primary-100 rounded-full">
                        <User size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{aluno.alunoNome}</p>
                        <p className="text-sm text-gray-500">{aluno.mensalidades.length} mensalidade(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      {aluno.totalPendente > 0 && (
                        <div className="text-right">
                          <p className="text-gray-500">Pendente</p>
                          <p className="font-medium text-yellow-600">{formatCurrency(aluno.totalPendente)}</p>
                        </div>
                      )}
                      {aluno.totalPago > 0 && (
                        <div className="text-right">
                          <p className="text-gray-500">Pago</p>
                          <p className="font-medium text-green-600">{formatCurrency(aluno.totalPago)}</p>
                        </div>
                      )}
                    </div>
                  </div>

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
                            const temAjuste = desconto > 0 || acrescimo > 0;
                            const valorExibir = isPago && valorPago > 0 ? valorPago : valorOriginal;
                            const isFutura = mensalidade.status === StatusMensalidade.FUTURA || (mensalidade.status as string) === 'FUTURA';
                            return (
                              <tr key={mensalidade.id} className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-3 pl-16 text-sm text-gray-900">{MESES_MENS[mesRef - 1]}/{anoRef}</td>
                                <td className="px-6 py-3 text-sm text-gray-900">{dataVencimento ? formatDate(dataVencimento) : '-'}</td>
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
                                  <Badge variant={getStatusVariant(mensalidade.status)}>{mensalidade.status}</Badge>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex gap-2">
                                    {isFutura && (
                                      <Button size="sm" variant="ghost" title="Alterar Valor"
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(mensalidade); }}>
                                        <Pencil size={16} className="text-orange-500" />
                                      </Button>
                                    )}
                                    {!isPago && (
                                      <Button size="sm" variant="ghost" title="Registrar Pagamento"
                                        onClick={(e) => { e.stopPropagation(); handleOpenPayModal(mensalidade); }}>
                                        <DollarSign size={16} className="text-green-500" />
                                      </Button>
                                    )}
                                    {isPago && (
                                      <Button size="sm" variant="ghost" title="Imprimir Recibo"
                                        onClick={(e) => { e.stopPropagation(); handlePrintRecibo(mensalidade); }}>
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

      <PagarMensalidadeModal
        isOpen={isPayModalOpen} onClose={handleClosePayModal} onConfirmar={handlePagar} isPaying={isPaying}
        selectedMensalidade={selectedMensalidade} formaPagamento={formaPagamento} setFormaPagamento={setFormaPagamento}
        descontoTipo={descontoTipo} setDescontoTipo={setDescontoTipo}
        descontoValor={descontoValor} setDescontoValor={setDescontoValor}
        descontoMotivo={descontoMotivo} setDescontoMotivo={setDescontoMotivo}
        acrescimoTipo={acrescimoTipo} setAcrescimoTipo={setAcrescimoTipo}
        acrescimoValor={acrescimoValor} setAcrescimoValor={setAcrescimoValor}
        acrescimoMotivo={acrescimoMotivo} setAcrescimoMotivo={setAcrescimoMotivo}
        calcularValorFinal={calcularValorFinal} formatCurrencyInput={formatCurrencyInput} formatPercentInput={formatPercentInput}
      />
      <EditarValorModal
        isOpen={isEditModalOpen} onClose={handleCloseEditModal} onConfirmar={handleAlterarValor} isEditing={isEditing}
        selectedMensalidade={selectedMensalidadeEdit} novoValor={novoValor} setNovoValor={setNovoValor}
        motivoAlteracao={motivoAlteracao} setMotivoAlteracao={setMotivoAlteracao}
        aplicarEmTodas={aplicarEmTodas} setAplicarEmTodas={setAplicarEmTodas}
        formatCurrencyInput={formatCurrencyInput}
      />
    </div>
  );
}
