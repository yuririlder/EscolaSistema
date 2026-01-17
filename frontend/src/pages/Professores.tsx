import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Professor } from '../types';
import { professorService } from '../services/professorService';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrencyInput, currencyToNumber, formatCPF, formatPhone } from '../utils/masks';

export function Professores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    salario: '',
    formacao: '',
    especialidade: '',
  });

  useEffect(() => {
    loadProfessores();
  }, []);

  const loadProfessores = async () => {
    try {
      const data = await professorService.listar();
      setProfessores(data);
    } catch (error) {
      toast.error('Erro ao carregar professores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (professor?: Professor) => {
    if (professor) {
      setEditingProfessor(professor);
      setFormData({
        nome: professor.nome,
        cpf: formatCPF(professor.cpf),
        email: professor.email,
        telefone: formatPhone(professor.telefone),
        endereco: professor.endereco,
        salario: formatCurrencyInput((professor.salario * 100).toString()),
        formacao: professor.formacao,
        especialidade: professor.especialidade,
      });
    } else {
      setEditingProfessor(null);
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        endereco: '',
        salario: '',
        formacao: '',
        especialidade: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfessor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      salario: currencyToNumber(formData.salario),
    };

    try {
      if (editingProfessor) {
        await professorService.atualizar(editingProfessor.id, payload);
        toast.success('Professor atualizado com sucesso!');
      } else {
        await professorService.criar(payload);
        toast.success('Professor criado com sucesso!');
      }
      handleCloseModal();
      loadProfessores();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar professor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return;

    try {
      await professorService.excluir(id);
      toast.success('Professor excluído com sucesso!');
      loadProfessores();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir professor');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredProfessores = professores.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'especialidade', header: 'Especialidade' },
    {
      key: 'salario',
      header: 'Salário',
      render: (professor: Professor) => formatCurrency(professor.salario),
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (professor: Professor) => (
        <Badge variant={professor.ativo ? 'success' : 'danger'}>
          {professor.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (professor: Professor) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(professor)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(professor.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Professores</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Novo Professor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredProfessores}
            columns={columns}
            keyExtractor={(p) => p.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProfessor ? 'Editar Professor' : 'Novo Professor'}
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
              onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
              placeholder="000.000.000-00"
              required
            />
            <Input
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
              required
            />
            <Input
              label="Formação"
              value={formData.formacao}
              onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
              required
            />
            <Input
              label="Especialidade"
              value={formData.especialidade}
              onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
              required
            />
            <Input
              label="Salário"
              type="text"
              value={formData.salario ? `R$ ${formData.salario}` : ''}
              onChange={(e) => setFormData({ ...formData, salario: formatCurrencyInput(e.target.value) })}
              placeholder="R$ 0,00"
              required
            />
            <div className="md:col-span-2">
              <Input
                label="Endereço"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingProfessor ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
