import { useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Nota } from '../../types';
import { useNotasPage } from './hooks/useNotasPage';
import { NotaFormModal } from './components/NotaFormModal';

export function Notas() {
  const {
    notas, alunos, professores, isLoading, searchTerm, setSearchTerm,
    isModalOpen, editingNota, isSaving, formData, setFormData,
    loadData, handleOpenModal, handleCloseModal, handleSubmit, handleDelete,
  } = useNotasPage();

  useEffect(() => { loadData(); }, []);

  const getNotaColor = (valor: number) => {
    if (valor >= 7) return 'text-green-600';
    if (valor >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const columns = [
    { key: 'aluno', header: 'Aluno', render: (n: Nota) => n.aluno?.nome || '-' },
    { key: 'disciplina', header: 'Disciplina' },
    { key: 'bimestre', header: 'Bimestre' },
    {
      key: 'valor',
      header: 'Nota',
      render: (n: Nota) => <span className={`font-semibold ${getNotaColor(n.valor)}`}>{n.valor.toFixed(1)}</span>,
    },
    { key: 'professor', header: 'Professor', render: (n: Nota) => n.professor?.nome || '-' },
    {
      key: 'actions',
      header: 'Ações',
      render: (n: Nota) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(n)}><Pencil size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
        <Button onClick={() => handleOpenModal()}><Plus size={18} /> Lançar Nota</Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar nota..." />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={notas} columns={columns} keyExtractor={(n) => n.id} />
        </CardContent>
      </Card>

      <NotaFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData}
        editingNota={editingNota} isSaving={isSaving}
        alunos={alunos} professores={professores}
      />
    </div>
  );
}
