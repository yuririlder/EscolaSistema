import { Plus, DollarSign, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PagamentoFuncionario, StatusDespesa } from '../../types';
import { formatCurrency } from '../../utils/masks';
import { usePagamentosFuncionariosPage, MESES } from './hooks/usePagamentosFuncionariosPage';
import { PagamentoFormModal, ConfirmarPagamentoModal } from './components/PagamentoFuncionarioModals';

function getStatusVariant(status: StatusDespesa) {
  switch (status) {
    case StatusDespesa.PAGO: return 'success';
    case StatusDespesa.PENDENTE: return 'warning';
    case StatusDespesa.CANCELADO: return 'danger';
    default: return 'default';
  }
}

export function PagamentosFuncionarios() {
  const {
    pagamentos, isLoading, searchTerm, setSearchTerm,
    isModalOpen, isSaving, formData, setFormData,
    isPayModalOpen, setIsPayModalOpen, selectedPagamento, setSelectedPagamento,
    formaPagamento, setFormaPagamento, isPaying, valorFinal, funcionarioOptions,
    handleOpenModal, handleCloseModal, handleFuncionarioChange, handleSubmit,
    handleOpenPayModal, handlePagar, handlePrintRecibo,
    formatCurrencyInput, formatNumberInput,
  } = usePagamentosFuncionariosPage();

  const columns = [
    {
      key: 'funcionario', header: 'Funcionário',
      render: (p: PagamentoFuncionario) => (p as any).funcionario?.nome || (p as any).funcionario_nome || '-',
    },
    {
      key: 'referencia', header: 'Referência',
      render: (p: PagamentoFuncionario) => {
        const mes = (p as any).mesReferencia || (p as any).mes_referencia || 1;
        const ano = (p as any).anoReferencia || (p as any).ano_referencia || '';
        return `${MESES[mes - 1]}/${ano}`;
      },
    },
    {
      key: 'valorBase', header: 'Valor Base',
      render: (p: PagamentoFuncionario) => formatCurrency((p as any).valorBase || (p as any).salario_base || 0),
    },
    {
      key: 'valorFinal', header: 'Valor Final',
      render: (p: PagamentoFuncionario) => formatCurrency((p as any).valorFinal || (p as any).valor_liquido || 0),
    },
    { key: 'status', header: 'Status', render: (p: PagamentoFuncionario) => <Badge variant={getStatusVariant(p.status)}>{p.status}</Badge> },
    {
      key: 'actions', header: 'Ações',
      render: (p: PagamentoFuncionario) => (
        <div className="flex gap-2">
          {p.status === StatusDespesa.PENDENTE && (
            <Button size="sm" variant="ghost" onClick={() => handleOpenPayModal(p)} title="Realizar Pagamento">
              <DollarSign size={16} className="text-green-500" />
            </Button>
          )}
          {p.status === StatusDespesa.PAGO && (
            <Button size="sm" variant="ghost" onClick={() => handlePrintRecibo(p)} title="Imprimir Recibo">
              <Printer size={16} className="text-blue-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos de Funcionários</h1>
        <Button onClick={handleOpenModal}><Plus size={18} /> Novo Pagamento</Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar pagamento..." className="max-w-sm" />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={pagamentos} columns={columns} keyExtractor={(p) => p.id} />
        </CardContent>
      </Card>

      <PagamentoFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData} isSaving={isSaving} valorFinal={valorFinal}
        funcionarioOptions={funcionarioOptions} onFuncionarioChange={handleFuncionarioChange}
        formatCurrencyInput={formatCurrencyInput} formatNumberInput={formatNumberInput}
      />
      <ConfirmarPagamentoModal
        isOpen={isPayModalOpen}
        onClose={() => { setIsPayModalOpen(false); setSelectedPagamento(null); }}
        onConfirmar={() => selectedPagamento && handlePagar(selectedPagamento.id)}
        isPaying={isPaying} selectedPagamento={selectedPagamento}
        formaPagamento={formaPagamento} setFormaPagamento={setFormaPagamento}
      />
    </div>
  );
}
