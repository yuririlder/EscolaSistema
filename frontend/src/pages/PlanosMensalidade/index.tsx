import { useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PlanoMensalidade } from '../../types';
import { formatCurrency } from '../../utils/masks';
import { usePlanosMensalidadePage } from './hooks/usePlanosMensalidadePage';
import { PlanoFormModal } from './components/PlanoFormModal';

export function PlanosMensalidade() {
  const {
    planos, isLoading, searchTerm, setSearchTerm,
    isModalOpen, editingPlano, isSaving, formData, setFormData,
    loadPlanos, handleOpenModal, handleCloseModal, handleSubmit, handleDelete,
  } = usePlanosMensalidadePage();

  useEffect(() => { loadPlanos(); }, []);

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'valor', header: 'Valor', render: (p: PlanoMensalidade) => formatCurrency(p.valor) },
    { key: 'descricao', header: 'Descrição' },
    { key: 'ativo', header: 'Status', render: (p: PlanoMensalidade) => <Badge variant={p.ativo ? 'success' : 'danger'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge> },
    {
      key: 'actions', header: 'Ações',
      render: (p: PlanoMensalidade) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(p)}><Pencil size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 size={16} className="text-red-500" /></Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Planos de Mensalidade</h1>
        <Button onClick={() => handleOpenModal()}><Plus size={18} /> Novo Plano</Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar plano..." />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={planos} columns={columns} keyExtractor={(p) => p.id} />
        </CardContent>
      </Card>

      <PlanoFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData} editingPlano={editingPlano} isSaving={isSaving}
      />
    </div>
  );
}
