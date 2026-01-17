import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Turma, Professor } from '../types';
import { turmaService } from '../services/turmaService';
import { professorService } from '../services/professorService';
import { Plus, Pencil, Trash2, Search, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfessorModalOpen, setIsProfessorModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [selectedProfessorId, setSelectedProfessorId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    ano: new Date().getFullYear(),
    serie: '',
    turno: 'MATUTINO',
    capacidade: 30,
    salaNumero: '',
    ativa: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [turmasData, professoresData] = await Promise.all([
        turmaService.listar(),
        professorService.listar(),
      ]);
      setTurmas(turmasData);
      setProfessores(professoresData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setFormData({
        nome: turma.nome,
        ano: turma.ano,
        serie: turma.serie,
        turno: turma.turno,
        capacidade: turma.capacidade,
        salaNumero: turma.salaNumero,
        ativa: turma.ativa,
      });
    } else {
      setEditingTurma(null);
      setFormData({
        nome: '',
        ano: new Date().getFullYear(),
        serie: '',
        turno: 'MATUTINO',
        capacidade: 30,
        salaNumero: '',
        ativa: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTurma(null);
  };

  const handleOpenProfessorModal = (turma: Turma) => {
    setSelectedTurma(turma);
    setSelectedProfessorId('');
    setIsProfessorModalOpen(true);
  };

  const handleCloseProfessorModal = () => {
    setIsProfessorModalOpen(false);
    setSelectedTurma(null);
    setSelectedProfessorId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingTurma) {
        await turmaService.atualizar(editingTurma.id, formData);
        toast.success('Turma atualizada com sucesso!');
      } else {
        await turmaService.criar(formData);
        toast.success('Turma criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar turma');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVincularProfessor = async () => {
    if (!selectedTurma || !selectedProfessorId) return;
    setIsSaving(true);

    try {
      await turmaService.vincularProfessor(selectedTurma.id, selectedProfessorId);
      toast.success('Professor vinculado com sucesso!');
      handleCloseProfessorModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao vincular professor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta turma? O histórico será mantido.')) return;

    try {
      await turmaService.excluir(id);
      toast.success('Turma desativada com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar turma');
    }
  };

  const filteredTurmas = turmas.filter(
    (t) =>
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'serie', header: 'Série' },
    { key: 'turno', header: 'Turno' },
    { 
      key: 'sala_numero', 
      header: 'Sala',
      render: (turma: Turma) => turma.salaNumero || (turma as any).sala_numero || '-'
    },
    { key: 'capacidade', header: 'Capacidade' },
    {
      key: 'professores',
      header: 'Professor(es)',
      render: (turma: Turma) => (
        <div className="flex flex-wrap gap-1">
          {turma.professores && turma.professores.length > 0 ? (
            turma.professores.map((prof: any) => (
              <Badge key={prof.id} variant="info">
                {prof.nome}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Sem professor</span>
          )}
        </div>
      ),
    },
    {
      key: 'ativa',
      header: 'Status',
      render: (turma: Turma) => (
        <Badge variant={turma.ativa ? 'success' : 'danger'}>
          {turma.ativa ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (turma: Turma) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenProfessorModal(turma)}>
            <UserPlus size={16} className="text-blue-500" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(turma)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(turma.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Nova Turma
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredTurmas}
            columns={columns}
            keyExtractor={(t) => t.id}
          />
        </CardContent>
      </Card>

      {/* Modal de Turma */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTurma ? 'Editar Turma' : 'Nova Turma'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
            <Input
              label="Série"
              value={formData.serie}
              onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
              required
            />
            <Input
              label="Ano"
              type="number"
              value={formData.ano}
              onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
              required
            />
            <Select
              label="Turno"
              value={formData.turno}
              onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
              options={[
                { value: 'MATUTINO', label: 'Matutino' },
                { value: 'VESPERTINO', label: 'Vespertino' },
                { value: 'INTEGRAL', label: 'Integral' },
              ]}
            />
            <Input
              label="Número da Sala"
              value={formData.salaNumero}
              onChange={(e) => setFormData({ ...formData, salaNumero: e.target.value })}
              required
            />
            <Input
              label="Capacidade"
              type="number"
              value={formData.capacidade}
              onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativa"
              checked={formData.ativa}
              onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="ativa" className="text-sm text-gray-700">
              Turma ativa
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingTurma ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Vincular Professor */}
      <Modal
        isOpen={isProfessorModalOpen}
        onClose={handleCloseProfessorModal}
        title="Vincular Professor"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Selecione um professor para vincular à turma <strong>{selectedTurma?.nome}</strong>
          </p>
          <Select
            label="Professor"
            value={selectedProfessorId}
            onChange={(e) => setSelectedProfessorId(e.target.value)}
            options={professores.map((p) => ({
              value: p.id,
              label: `${p.nome} - ${p.especialidade}`,
            }))}
            placeholder="Selecione um professor"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseProfessorModal}>
              Cancelar
            </Button>
            <Button onClick={handleVincularProfessor} isLoading={isSaving} disabled={!selectedProfessorId}>
              Vincular
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
