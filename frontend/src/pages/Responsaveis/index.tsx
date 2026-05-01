import { useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Responsavel } from '../../types';
import { useResponsaveisPage } from './hooks/useResponsaveisPage';
import { ResponsavelFormModal } from './components/ResponsavelFormModal';

export function Responsaveis() {
  const {
    responsaveis, isLoading, searchTerm, setSearchTerm,
    isModalOpen, editingResponsavel, isSaving, formData, setFormData,
    loadResponsaveis, handleOpenModal, handleCloseModal, handleSubmit, handleDelete,
  } = useResponsaveisPage();

  useEffect(() => { loadResponsaveis(); }, []);

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'cpf', header: 'CPF' },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'profissao', header: 'Profissão' },
    {
      key: 'actions',
      header: 'Ações',
      render: (r: Responsavel) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(r)}><Pencil size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Responsáveis</h1>
        <Button onClick={() => handleOpenModal()}><Plus size={18} /> Novo Responsável</Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar responsável..." />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={responsaveis} columns={columns} keyExtractor={(r) => r.id} />
        </CardContent>
      </Card>

      <ResponsavelFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData}
        editingResponsavel={editingResponsavel} isSaving={isSaving}
      />
    </div>
  );
}
