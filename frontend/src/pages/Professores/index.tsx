import { useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Professor } from '../../types';
import { formatCurrency } from '../../utils/masks';
import { useProfessoresPage } from './hooks/useProfessoresPage';
import { ProfessorFormModal } from './components/ProfessorFormModal';

export function Professores() {
  const {
    professores,
    isLoading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editingProfessor,
    isSaving,
    formData,
    setFormData,
    loadProfessores,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  } = useProfessoresPage();

  useEffect(() => {
    loadProfessores();
  }, []);

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'especialidade', header: 'Especialidade' },
    {
      key: 'salario',
      header: 'Salário',
      render: (p: Professor) => formatCurrency(p.salario),
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (p: Professor) => (
        <Badge variant={p.ativo ? 'success' : 'danger'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (p: Professor) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(p)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Professores</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Novo Professor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar professor..." />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={professores} columns={columns} keyExtractor={(p) => p.id} />
        </CardContent>
      </Card>

      <ProfessorFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingProfessor={editingProfessor}
        isSaving={isSaving}
      />
    </div>
  );
}
