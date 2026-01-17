import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Responsavel } from '../types';
import { responsavelService } from '../services/responsavelService';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCPF, formatPhone } from '../utils/masks';

export function Responsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponsavel, setEditingResponsavel] = useState<Responsavel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    profissao: '',
  });

  useEffect(() => {
    loadResponsaveis();
  }, []);

  const loadResponsaveis = async () => {
    try {
      const data = await responsavelService.listar();
      setResponsaveis(data);
    } catch (error) {
      toast.error('Erro ao carregar responsáveis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (responsavel?: Responsavel) => {
    if (responsavel) {
      setEditingResponsavel(responsavel);
      setFormData({
        nome: responsavel.nome,
        cpf: formatCPF(responsavel.cpf),
        email: responsavel.email,
        telefone: formatPhone(responsavel.telefone),
        endereco: responsavel.endereco,
        profissao: responsavel.profissao || '',
      });
    } else {
      setEditingResponsavel(null);
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        endereco: '',
        profissao: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResponsavel(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
    };

    try {
      if (editingResponsavel) {
        await responsavelService.atualizar(editingResponsavel.id, payload);
        toast.success('Responsável atualizado com sucesso!');
      } else {
        await responsavelService.criar(payload);
        toast.success('Responsável criado com sucesso!');
      }
      handleCloseModal();
      loadResponsaveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar responsável');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este responsável?')) return;

    try {
      await responsavelService.excluir(id);
      toast.success('Responsável excluído com sucesso!');
      loadResponsaveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir responsável');
    }
  };

  const filteredResponsaveis = responsaveis.filter(
    (r) =>
      r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf.includes(searchTerm)
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'cpf', header: 'CPF' },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'profissao', header: 'Profissão' },
    {
      key: 'actions',
      header: 'Ações',
      render: (responsavel: Responsavel) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(responsavel)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(responsavel.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Responsáveis</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Novo Responsável
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredResponsaveis}
            columns={columns}
            keyExtractor={(r) => r.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingResponsavel ? 'Editar Responsável' : 'Novo Responsável'}
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
              label="Profissão"
              value={formData.profissao}
              onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
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
              {editingResponsavel ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
