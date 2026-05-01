import { Plus, Users, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PainelAlunoModal } from '../../components/PainelAlunoModal';
import { Aluno } from '../../types';
import { AlunoFormModal } from './components/AlunoFormModal';
import { VincularTurmaModal } from './components/VincularTurmaModal';
import { useAlunosPage } from './hooks/useAlunosPage';

export function Alunos() {
  const {
    alunos, turmas, isLoading, searchTerm, setSearchTerm,
    filtroAtivo, setFiltroAtivo, isModalOpen, editingAluno,
    isSaving, activeTab, setActiveTab, formData, setFormData, responsavelOptions,
    isTurmaModalOpen, selectedAlunoForTurma, turmaFormData, setTurmaFormData,
    turmasFiltradas, painelRefreshKey, alunoId, openPainel, closePainel,
    handleOpenModal, handleCloseModal, handleSubmit,
    handleOpenTurmaModal, handleCloseTurmaModal, handleVincularTurma, handleDelete,
  } = useAlunosPage();

  const columns = [
    {
      key: 'matricula',
      header: 'Matrícula',
      render: (aluno: Aluno) => (
        <span className="font-mono text-sm">{(aluno as any).matricula_numero || (aluno as any).matriculaNumero || '-'}</span>
      ),
    },
    {
      key: 'nome',
      header: 'Nome',
      render: (aluno: Aluno) => (
        <button onClick={() => openPainel(aluno.id)} className="text-primary-600 hover:text-primary-800 font-medium text-left">
          {aluno.nome}
        </button>
      ),
    },
    {
      key: 'turma',
      header: 'Turma',
      render: (aluno: Aluno) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {(aluno as any).turma?.nome || (aluno as any).turma_nome || '-'}
        </span>
      ),
    },
    {
      key: 'responsavel',
      header: 'Responsável',
      render: (aluno: Aluno) => (aluno as any).responsavel?.nome || (aluno as any).responsavel_nome || '-',
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} /> Novo Aluno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar aluno..." className="flex-1 max-w-sm" />
            <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
              <button onClick={() => setFiltroAtivo('ativos')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${filtroAtivo === 'ativos' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Users size={15} /> Ativos
              </button>
              <button onClick={() => setFiltroAtivo('inativos')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${filtroAtivo === 'inativos' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <UserX size={15} /> Desativados
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table data={alunos} columns={columns} keyExtractor={(a) => a.id} />
        </CardContent>
      </Card>

      <PainelAlunoModal
        alunoId={alunoId}
        onClose={closePainel}
        onEdit={(aluno) => handleOpenModal(aluno)}
        onDelete={handleDelete}
        refreshKey={painelRefreshKey}
        onChangeTurma={(aluno) => handleOpenTurmaModal(aluno)}
      />

      <AlunoFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData}
        editingAluno={editingAluno} isSaving={isSaving}
        activeTab={activeTab} setActiveTab={setActiveTab}
        responsavelOptions={responsavelOptions} turmas={turmas}
      />

      <VincularTurmaModal
        isOpen={isTurmaModalOpen} onClose={handleCloseTurmaModal} onSubmit={handleVincularTurma}
        selectedAluno={selectedAlunoForTurma} isSaving={isSaving}
        turmaFormData={turmaFormData} setTurmaFormData={setTurmaFormData}
        turmasFiltradas={turmasFiltradas}
      />
    </div>
  );
}
