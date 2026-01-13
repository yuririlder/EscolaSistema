import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Nota, Aluno, Professor } from '../types';
import { notaService } from '../services/notaService';
import { alunoService } from '../services/alunoService';
import { professorService } from '../services/professorService';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export function Notas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    alunoId: '',
    disciplina: '',
    bimestre: 1,
    valor: 0,
    observacao: '',
    professorId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notasData, alunosData, professoresData] = await Promise.all([
        notaService.listar(),
        alunoService.listar(),
        professorService.listar(),
      ]);
      setNotas(notasData);
      setAlunos(alunosData);
      setProfessores(professoresData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (nota?: Nota) => {
    if (nota) {
      setEditingNota(nota);
      setFormData({
        alunoId: nota.alunoId,
        disciplina: nota.disciplina,
        bimestre: nota.bimestre,
        valor: nota.valor,
        observacao: nota.observacao || '',
        professorId: nota.professorId,
      });
    } else {
      setEditingNota(null);
      setFormData({
        alunoId: '',
        disciplina: '',
        bimestre: 1,
        valor: 0,
        observacao: '',
        professorId: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNota(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingNota) {
        await notaService.atualizar(editingNota.id, formData);
        toast.success('Nota atualizada com sucesso!');
      } else {
        await notaService.criar(formData);
        toast.success('Nota criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar nota');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;

    try {
      await notaService.excluir(id);
      toast.success('Nota excluída com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir nota');
    }
  };

  const filteredNotas = notas.filter(
    (n) =>
      n.aluno?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNotaColor = (valor: number) => {
    if (valor >= 7) return 'text-green-600';
    if (valor >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const columns = [
    {
      key: 'aluno.nome',
      header: 'Aluno',
      render: (nota: Nota) => nota.aluno?.nome || '-',
    },
    { key: 'disciplina', header: 'Disciplina' },
    { key: 'bimestre', header: 'Bimestre' },
    {
      key: 'valor',
      header: 'Nota',
      render: (nota: Nota) => (
        <span className={`font-semibold ${getNotaColor(nota.valor)}`}>
          {nota.valor.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'professor.nome',
      header: 'Professor',
      render: (nota: Nota) => nota.professor?.nome || '-',
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (nota: Nota) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(nota)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(nota.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Lançar Nota
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredNotas}
            columns={columns}
            keyExtractor={(n) => n.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingNota ? 'Editar Nota' : 'Lançar Nota'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Aluno"
              value={formData.alunoId}
              onChange={(e) => setFormData({ ...formData, alunoId: e.target.value })}
              options={alunos.map((a) => ({
                value: a.id,
                label: `${a.nome} - ${a.matriculaNumero}`,
              }))}
              placeholder="Selecione um aluno"
              required
            />
            <Select
              label="Professor"
              value={formData.professorId}
              onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
              options={professores.map((p) => ({
                value: p.id,
                label: `${p.nome} - ${p.especialidade}`,
              }))}
              placeholder="Selecione um professor"
              required
            />
            <Input
              label="Disciplina"
              value={formData.disciplina}
              onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
              required
            />
            <Select
              label="Bimestre"
              value={formData.bimestre.toString()}
              onChange={(e) => setFormData({ ...formData, bimestre: parseInt(e.target.value) })}
              options={[
                { value: '1', label: '1º Bimestre' },
                { value: '2', label: '2º Bimestre' },
                { value: '3', label: '3º Bimestre' },
                { value: '4', label: '4º Bimestre' },
              ]}
            />
            <Input
              label="Nota (0 a 10)"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
              required
            />
            <div className="md:col-span-2">
              <Input
                label="Observação"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingNota ? 'Atualizar' : 'Lançar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
