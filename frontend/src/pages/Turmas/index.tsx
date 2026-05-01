import { useEffect } from 'react';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Turma } from '../../types';
import { useTurmasPage } from './hooks/useTurmasPage';
import { TurmaFormModal, VincularProfessorModal } from './components/TurmaModals';

export function Turmas() {
  const {
    turmas, professores, isLoading, searchTerm, setSearchTerm,
    isModalOpen, isProfessorModalOpen, editingTurma, selectedTurma,
    selectedProfessorId, setSelectedProfessorId, isSaving, formData, setFormData,
    loadData, handleOpenModal, handleCloseModal, handleOpenProfessorModal,
    handleCloseProfessorModal, handleSubmit, handleVincularProfessor, handleDelete,
  } = useTurmasPage();

  useEffect(() => { loadData(); }, []);

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'serie', header: 'Série' },
    { key: 'turno', header: 'Turno' },
    { key: 'sala_numero', header: 'Sala', render: (t: Turma) => t.salaNumero || (t as any).sala_numero || '-' },
    { key: 'capacidade', header: 'Capacidade' },
    {
      key: 'professores',
      header: 'Professor(es)',
      render: (t: Turma) => (
        <div className="flex flex-wrap gap-1">
          {t.professores && t.professores.length > 0
            ? t.professores.map((p: any) => <Badge key={p.id} variant="info">{p.nome}</Badge>)
            : <span className="text-gray-400 text-sm">Sem professor</span>}
        </div>
      ),
    },
    {
      key: 'ativa',
      header: 'Status',
      render: (t: Turma) => <Badge variant={t.ativa ? 'success' : 'danger'}>{t.ativa ? 'Ativa' : 'Inativa'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (t: Turma) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenProfessorModal(t)}>
            <UserPlus size={16} className="text-blue-500" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(t)}><Pencil size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
        <Button onClick={() => handleOpenModal()}><Plus size={18} /> Nova Turma</Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar turma..." />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={turmas} columns={columns} keyExtractor={(t) => t.id} />
        </CardContent>
      </Card>

      <TurmaFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData} editingTurma={editingTurma} isSaving={isSaving}
      />
      <VincularProfessorModal
        isOpen={isProfessorModalOpen} onClose={handleCloseProfessorModal} onVincular={handleVincularProfessor}
        selectedTurma={selectedTurma} professores={professores}
        selectedProfessorId={selectedProfessorId} setSelectedProfessorId={setSelectedProfessorId} isSaving={isSaving}
      />
    </div>
  );
}
