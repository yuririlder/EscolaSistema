import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { PlanoMensalidade } from '../types';
import { financeiroService } from '../services/financeiroService';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrencyInput, currencyToNumber } from '../utils/masks';

export function PlanosMensalidade() {
  const [planos, setPlanos] = useState<PlanoMensalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoMensalidade | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    loadPlanos();
  }, []);

  const loadPlanos = async () => {
    try {
      const data = await financeiroService.listarPlanos();
      setPlanos(data);
    } catch (error) {
      toast.error('Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (plano?: PlanoMensalidade) => {
    if (plano) {
      setEditingPlano(plano);
      setFormData({
        nome: plano.nome,
        valor: formatCurrencyInput((plano.valor * 100).toString()),
        descricao: plano.descricao || '',
        ativo: plano.ativo,
      });
    } else {
      setEditingPlano(null);
      setFormData({
        nome: '',
        valor: '',
        descricao: '',
        ativo: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlano(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      valor: currencyToNumber(formData.valor),
    };

    try {
      if (editingPlano) {
        await financeiroService.atualizarPlano(editingPlano.id, payload);
        toast.success('Plano atualizado com sucesso!');
      } else {
        await financeiroService.criarPlano(payload);
        toast.success('Plano criado com sucesso!');
      }
      handleCloseModal();
      loadPlanos();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar plano');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      await financeiroService.excluirPlano(id);
      toast.success('Plano excluído com sucesso!');
      loadPlanos();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir plano');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredPlanos = planos.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    {
      key: 'valor',
      header: 'Valor',
      render: (plano: PlanoMensalidade) => formatCurrency(plano.valor),
    },
    { key: 'descricao', header: 'Descrição' },
    {
      key: 'ativo',
      header: 'Status',
      render: (plano: PlanoMensalidade) => (
        <Badge variant={plano.ativo ? 'success' : 'danger'}>
          {plano.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (plano: PlanoMensalidade) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(plano)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(plano.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Planos de Mensalidade</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Novo Plano
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredPlanos}
            columns={columns}
            keyExtractor={(p) => p.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPlano ? 'Editar Plano' : 'Novo Plano'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
          <Input
            label="Valor"
            type="text"
            value={formData.valor ? `R$ ${formData.valor}` : ''}
            onChange={(e) => setFormData({ ...formData, valor: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00"
            required
          />
          <Input
            label="Descrição"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="ativo" className="text-sm text-gray-700">
              Plano ativo
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingPlano ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
