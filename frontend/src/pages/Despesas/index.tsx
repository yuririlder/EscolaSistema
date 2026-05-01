import { Plus, Pencil, Trash2, DollarSign, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Despesa, StatusDespesa } from '../../types';
import { formatCurrency } from '../../utils/masks';
import { NOMES_MESES } from '../../utils/constants';
import { useDespesasPage } from './hooks/useDespesasPage';
import { DespesaFormModal, PagarDespesaModal } from './components/DespesaModals';

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function getStatusVariant(status: StatusDespesa) {
  switch (status) {
    case StatusDespesa.PAGO: return 'success';
    case StatusDespesa.PENDENTE: return 'warning';
    case StatusDespesa.CANCELADO: return 'danger';
    default: return 'default';
  }
}

export function Despesas() {
  const {
    agora, mesSelecionado, setMesSelecionado, anoSelecionado, setAnoSelecionado,
    despesas, isLoading, searchTerm, setSearchTerm,
    isModalOpen, editingDespesa, isSaving, formData, setFormData,
    isPayModalOpen, setIsPayModalOpen, selectedDespesa, setSelectedDespesa,
    formaPagamento, setFormaPagamento, isPaying,
    handleOpenModal, handleCloseModal, handleSubmit,
    handleOpenPayModal, handlePagar, handlePrintRecibo, handleDelete,
  } = useDespesasPage();

  const columns = [
    { key: 'descricao', header: 'Descrição' },
    { key: 'categoria', header: 'Categoria' },
    { key: 'valor', header: 'Valor', render: (d: Despesa) => formatCurrency(d.valor) },
    {
      key: 'dataVencimento', header: 'Vencimento',
      render: (d: Despesa) => { const v = (d as any).dataVencimento || (d as any).data_vencimento; return v ? formatDate(v) : '-'; },
    },
    {
      key: 'dataPagamento', header: 'Pagamento',
      render: (d: Despesa) => { const v = (d as any).dataPagamento || (d as any).data_pagamento; return v ? formatDate(v) : '-'; },
    },
    { key: 'status', header: 'Status', render: (d: Despesa) => <Badge variant={getStatusVariant(d.status)}>{d.status}</Badge> },
    {
      key: 'actions', header: 'Ações',
      render: (d: Despesa) => (
        <div className="flex gap-2">
          {d.status === StatusDespesa.PENDENTE && (
            <Button size="sm" variant="ghost" onClick={() => handleOpenPayModal(d)} title="Marcar como Pago">
              <DollarSign size={16} className="text-green-500" />
            </Button>
          )}
          {d.status === StatusDespesa.PAGO && (
            <Button size="sm" variant="ghost" onClick={() => handlePrintRecibo(d)} title="Imprimir Recibo">
              <Printer size={16} className="text-blue-500" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(d)}><Pencil size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}><Trash2 size={16} className="text-red-500" /></Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
        <Button onClick={() => handleOpenModal()}><Plus size={18} /> Nova Despesa</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar despesa..." className="flex-1 max-w-sm" />
            <select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))} className="text-sm border border-gray-300 rounded px-2 py-1">
              {NOMES_MESES.map((nome, i) => <option key={i + 1} value={i + 1}>{nome}</option>)}
            </select>
            <select value={anoSelecionado} onChange={(e) => setAnoSelecionado(Number(e.target.value))} className="text-sm border border-gray-300 rounded px-2 py-1">
              {Array.from({ length: 5 }, (_, i) => agora.getFullYear() - 2 + i).map((ano) => <option key={ano} value={ano}>{ano}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table data={despesas} columns={columns} keyExtractor={(d) => d.id} />
        </CardContent>
      </Card>

      <DespesaFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData} editingDespesa={editingDespesa} isSaving={isSaving}
      />
      <PagarDespesaModal
        isOpen={isPayModalOpen}
        onClose={() => { setIsPayModalOpen(false); setSelectedDespesa(null); }}
        selectedDespesa={selectedDespesa} formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        onConfirmar={() => selectedDespesa && handlePagar(selectedDespesa.id)}
        isPaying={isPaying} formatCurrency={formatCurrency}
      />
    </div>
  );
}
