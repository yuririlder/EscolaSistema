import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Despesa, StatusDespesa } from '../types';
import { financeiroService } from '../services/financeiroService';
import { Plus, Pencil, Trash2, Search, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    categoria: '',
    dataVencimento: '',
    fornecedor: '',
    observacao: '',
  });

  useEffect(() => {
    loadDespesas();
  }, []);

  const loadDespesas = async () => {
    try {
      const data = await financeiroService.listarDespesas();
      setDespesas(data);
    } catch (error) {
      toast.error('Erro ao carregar despesas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (despesa?: Despesa) => {
    if (despesa) {
      setEditingDespesa(despesa);
      setFormData({
        descricao: despesa.descricao,
        valor: despesa.valor,
        categoria: despesa.categoria,
        dataVencimento: new Date(despesa.dataVencimento).toISOString().split('T')[0],
        fornecedor: despesa.fornecedor || '',
        observacao: despesa.observacao || '',
      });
    } else {
      setEditingDespesa(null);
      setFormData({
        descricao: '',
        valor: 0,
        categoria: '',
        dataVencimento: '',
        fornecedor: '',
        observacao: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDespesa(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        dataVencimento: new Date(formData.dataVencimento),
      };

      if (editingDespesa) {
        await financeiroService.atualizarDespesa(editingDespesa.id, payload);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await financeiroService.criarDespesa(payload);
        toast.success('Despesa criada com sucesso!');
      }
      handleCloseModal();
      loadDespesas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar despesa');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePagar = async (id: string) => {
    try {
      await financeiroService.pagarDespesa(id);
      toast.success('Despesa paga com sucesso!');
      loadDespesas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao pagar despesa');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      await financeiroService.excluirDespesa(id);
      toast.success('Despesa excluída com sucesso!');
      loadDespesas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir despesa');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusVariant = (status: StatusDespesa) => {
    switch (status) {
      case StatusDespesa.PAGO:
        return 'success';
      case StatusDespesa.PENDENTE:
        return 'warning';
      case StatusDespesa.CANCELADO:
        return 'danger';
      default:
        return 'default';
    }
  };

  const filteredDespesas = despesas.filter(
    (d) =>
      d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'descricao', header: 'Descrição' },
    { key: 'categoria', header: 'Categoria' },
    {
      key: 'valor',
      header: 'Valor',
      render: (despesa: Despesa) => formatCurrency(despesa.valor),
    },
    {
      key: 'dataVencimento',
      header: 'Vencimento',
      render: (despesa: Despesa) => formatDate(despesa.dataVencimento),
    },
    {
      key: 'status',
      header: 'Status',
      render: (despesa: Despesa) => (
        <Badge variant={getStatusVariant(despesa.status)}>{despesa.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (despesa: Despesa) => (
        <div className="flex gap-2">
          {despesa.status === StatusDespesa.PENDENTE && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePagar(despesa.id)}
              title="Marcar como Pago"
            >
              <DollarSign size={16} className="text-green-500" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(despesa)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(despesa.id)}>
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
        <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Nova Despesa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar despesa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredDespesas}
            columns={columns}
            keyExtractor={(d) => d.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>
            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
              required
            />
            <Select
              label="Categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              options={[
                { value: 'ALUGUEL', label: 'Aluguel' },
                { value: 'ENERGIA', label: 'Energia' },
                { value: 'AGUA', label: 'Água' },
                { value: 'INTERNET', label: 'Internet' },
                { value: 'TELEFONE', label: 'Telefone' },
                { value: 'MATERIAL', label: 'Material' },
                { value: 'MANUTENCAO', label: 'Manutenção' },
                { value: 'LIMPEZA', label: 'Limpeza' },
                { value: 'OUTROS', label: 'Outros' },
              ]}
              placeholder="Selecione uma categoria"
              required
            />
            <Input
              label="Data de Vencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
              required
            />
            <Input
              label="Fornecedor"
              value={formData.fornecedor}
              onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
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
              {editingDespesa ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
