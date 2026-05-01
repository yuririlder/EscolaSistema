import { Plus, Pencil, Printer, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Matricula, StatusMatricula } from '../../types';
import { formatCurrency } from '../../utils/masks';
import { useMatriculasPage } from './hooks/useMatriculasPage';
import { MatriculaFormModal, ConfirmCancelModal } from './components/MatriculaModals';

function getStatusVariant(status: StatusMatricula) {
  switch (status) {
    case StatusMatricula.ATIVA: return 'success';
    case StatusMatricula.TRANCADA: return 'warning';
    case StatusMatricula.CANCELADA: return 'danger';
    case StatusMatricula.CONCLUIDA: return 'info';
    default: return 'default';
  }
}

export function Matriculas() {
  const {
    matriculas, planos, isLoading, searchTerm, setSearchTerm,
    isModalOpen, editingMatricula, isSaving, formData, setFormData,
    isConfirmModalOpen, matriculaToCancel, isCanceling,
    alunoOptions, handleOpenModal, handleCloseModal,
    handleOpenConfirmCancel, handleCloseConfirmModal,
    handleCancelarMatricula, handleSubmit, handlePrint,
    formatCurrencyInput, formatNumberInput,
  } = useMatriculasPage();

  const columns = [
    { key: 'aluno', header: 'Aluno', render: (m: Matricula) => (m as any).aluno?.nome || (m as any).aluno_nome || '-' },
    { key: 'anoLetivo', header: 'Ano Letivo', render: (m: Matricula) => (m as any).anoLetivo || (m as any).ano_letivo || '-' },
    { key: 'plano', header: 'Plano', render: (m: Matricula) => (m as any).planoMensalidade?.nome || (m as any).plano_nome || '-' },
    { key: 'valor', header: 'Valor', render: (m: Matricula) => formatCurrency((m as any).valorMatricula || (m as any).valor_matricula || 0) },
    { key: 'status', header: 'Status', render: (m: Matricula) => <Badge variant={getStatusVariant(m.status)}>{m.status}</Badge> },
    {
      key: 'actions', header: 'Ações',
      render: (m: Matricula) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handlePrint(m)} title="Imprimir Termo">
            <Printer size={16} className="text-blue-500" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(m)} title="Editar">
            <Pencil size={16} />
          </Button>
          {m.status === StatusMatricula.ATIVA && (
            <Button size="sm" variant="ghost" onClick={() => handleOpenConfirmCancel(m)} title="Desmatricular">
              <UserX size={16} className="text-red-500" />
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
        <h1 className="text-2xl font-bold text-gray-900">Matrículas</h1>
        <Button onClick={() => handleOpenModal()}><Plus size={18} /> Nova Matrícula</Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar matrícula..." className="max-w-sm" />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={matriculas} columns={columns} keyExtractor={(m) => m.id} />
        </CardContent>
      </Card>

      <MatriculaFormModal
        isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit}
        formData={formData} setFormData={setFormData} editingMatricula={editingMatricula}
        isSaving={isSaving} alunoOptions={alunoOptions} planos={planos}
        formatCurrencyInput={formatCurrencyInput} formatNumberInput={formatNumberInput}
      />
      <ConfirmCancelModal
        isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal}
        onConfirm={handleCancelarMatricula} isCanceling={isCanceling} matricula={matriculaToCancel}
      />
    </div>
  );
}
