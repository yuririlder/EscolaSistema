import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Aluno, Responsavel, Turma } from '../types';
import { alunoService } from '../services/alunoService';
import { responsavelService } from '../services/responsavelService';
import { turmaService } from '../services/turmaService';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    cpf: '',
    genero: 'M',
    responsavelId: '',
    turmaId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alunosData, responsaveisData, turmasData] = await Promise.all([
        alunoService.listar(),
        responsavelService.listar(),
        turmaService.listar(),
      ]);
      setAlunos(alunosData);
      setResponsaveis(responsaveisData);
      setTurmas(turmasData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (aluno?: Aluno) => {
    if (aluno) {
      setEditingAluno(aluno);
      setFormData({
        nome: aluno.nome,
        dataNascimento: new Date(aluno.dataNascimento).toISOString().split('T')[0],
        cpf: aluno.cpf || '',
        genero: aluno.genero,
        responsavelId: aluno.responsavelId,
        turmaId: aluno.turmaId,
      });
    } else {
      setEditingAluno(null);
      setFormData({
        nome: '',
        dataNascimento: '',
        cpf: '',
        genero: 'M',
        responsavelId: '',
        turmaId: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAluno(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        dataNascimento: new Date(formData.dataNascimento),
      };

      if (editingAluno) {
        await alunoService.atualizar(editingAluno.id, payload);
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await alunoService.criar(payload);
        toast.success('Aluno criado com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar aluno');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

    try {
      await alunoService.excluir(id);
      toast.success('Aluno excluído com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir aluno');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const filteredAlunos = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.matriculaNumero.includes(searchTerm)
  );

  const columns = [
    { key: 'matriculaNumero', header: 'Matrícula' },
    { key: 'nome', header: 'Nome' },
    {
      key: 'dataNascimento',
      header: 'Data de Nascimento',
      render: (aluno: Aluno) => formatDate(aluno.dataNascimento),
    },
    {
      key: 'turma.nome',
      header: 'Turma',
      render: (aluno: Aluno) => aluno.turma?.nome || '-',
    },
    {
      key: 'responsavel.nome',
      header: 'Responsável',
      render: (aluno: Aluno) => aluno.responsavel?.nome || '-',
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (aluno: Aluno) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(aluno)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(aluno.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Novo Aluno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredAlunos}
            columns={columns}
            keyExtractor={(a) => a.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
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
              label="CPF"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            />
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
              required
            />
            <Select
              label="Gênero"
              value={formData.genero}
              onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
              options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Feminino' },
                { value: 'O', label: 'Outro' },
              ]}
            />
            <Select
              label="Responsável"
              value={formData.responsavelId}
              onChange={(e) => setFormData({ ...formData, responsavelId: e.target.value })}
              options={responsaveis.map((r) => ({
                value: r.id,
                label: r.nome,
              }))}
              placeholder="Selecione um responsável"
              required
            />
            <Select
              label="Turma"
              value={formData.turmaId}
              onChange={(e) => setFormData({ ...formData, turmaId: e.target.value })}
              options={turmas.map((t) => ({
                value: t.id,
                label: `${t.nome} - ${t.serie}`,
              }))}
              placeholder="Selecione uma turma"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingAluno ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
