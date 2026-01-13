import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { PagamentoFuncionario, Funcionario, StatusDespesa } from '../types';
import { financeiroService } from '../services/financeiroService';
import { professorService } from '../services/professorService';
import { Plus, Search, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export function PagamentosFuncionarios() {
  const [pagamentos, setPagamentos] = useState<PagamentoFuncionario[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    funcionarioId: '',
    mesReferencia: new Date().getMonth() + 1,
    anoReferencia: new Date().getFullYear(),
    valorBase: 0,
    bonus: 0,
    descontos: 0,
    observacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pagamentosData, funcionariosData] = await Promise.all([
        financeiroService.listarPagamentosFuncionarios(),
        professorService.listar(), // Professores são funcionários
      ]);
      setPagamentos(pagamentosData);
      setFuncionarios(funcionariosData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      funcionarioId: '',
      mesReferencia: new Date().getMonth() + 1,
      anoReferencia: new Date().getFullYear(),
      valorBase: 0,
      bonus: 0,
      descontos: 0,
      observacao: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFuncionarioChange = (funcionarioId: string) => {
    const funcionario = funcionarios.find((f) => f.id === funcionarioId);
    setFormData({
      ...formData,
      funcionarioId,
      valorBase: funcionario?.salario || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await financeiroService.criarPagamentoFuncionario(formData);
      toast.success('Pagamento criado com sucesso!');
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar pagamento');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePagar = async (id: string) => {
    try {
      await financeiroService.pagarFuncionario(id);
      toast.success('Pagamento realizado com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao realizar pagamento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const filteredPagamentos = pagamentos.filter((p) =>
    p.funcionario?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const valorFinal = formData.valorBase + formData.bonus - formData.descontos;

  const columns = [
    {
      key: 'funcionario.nome',
      header: 'Funcionário',
      render: (pagamento: PagamentoFuncionario) => pagamento.funcionario?.nome || '-',
    },
    {
      key: 'referencia',
      header: 'Referência',
      render: (pagamento: PagamentoFuncionario) =>
        `${meses[pagamento.mesReferencia - 1]}/${pagamento.anoReferencia}`,
    },
    {
      key: 'valorBase',
      header: 'Valor Base',
      render: (pagamento: PagamentoFuncionario) => formatCurrency(pagamento.valorBase),
    },
    {
      key: 'valorFinal',
      header: 'Valor Final',
      render: (pagamento: PagamentoFuncionario) => formatCurrency(pagamento.valorFinal),
    },
    {
      key: 'status',
      header: 'Status',
      render: (pagamento: PagamentoFuncionario) => (
        <Badge variant={getStatusVariant(pagamento.status)}>{pagamento.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (pagamento: PagamentoFuncionario) => (
        <div className="flex gap-2">
          {pagamento.status === StatusDespesa.PENDENTE && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePagar(pagamento.id)}
              title="Realizar Pagamento"
            >
              <DollarSign size={16} className="text-green-500" />
            </Button>
          )}
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
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos de Funcionários</h1>
        <Button onClick={handleOpenModal}>
          <Plus size={18} />
          Novo Pagamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredPagamentos}
            columns={columns}
            keyExtractor={(p) => p.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Novo Pagamento de Funcionário"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Funcionário"
              value={formData.funcionarioId}
              onChange={(e) => handleFuncionarioChange(e.target.value)}
              options={funcionarios.map((f) => ({
                value: f.id,
                label: f.nome,
              }))}
              placeholder="Selecione um funcionário"
              required
            />
            <div className="flex gap-4">
              <Select
                label="Mês"
                value={formData.mesReferencia.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, mesReferencia: parseInt(e.target.value) })
                }
                options={meses.map((mes, index) => ({
                  value: (index + 1).toString(),
                  label: mes,
                }))}
              />
              <Input
                label="Ano"
                type="number"
                value={formData.anoReferencia}
                onChange={(e) =>
                  setFormData({ ...formData, anoReferencia: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <Input
              label="Valor Base (Salário)"
              type="number"
              step="0.01"
              value={formData.valorBase}
              onChange={(e) => setFormData({ ...formData, valorBase: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Bônus"
              type="number"
              step="0.01"
              value={formData.bonus}
              onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
            />
            <Input
              label="Descontos"
              type="number"
              step="0.01"
              value={formData.descontos}
              onChange={(e) => setFormData({ ...formData, descontos: parseFloat(e.target.value) })}
            />
            <div className="flex items-end">
              <div className="text-lg">
                <span className="text-gray-500">Valor Final: </span>
                <span className="font-bold text-green-600">{formatCurrency(valorFinal)}</span>
              </div>
            </div>
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
              Criar Pagamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
