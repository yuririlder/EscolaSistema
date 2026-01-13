import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Mensalidade, StatusMensalidade } from '../types';
import { financeiroService } from '../services/financeiroService';
import { Search, DollarSign, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

export function Mensalidades() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMensalidade, setSelectedMensalidade] = useState<Mensalidade | null>(null);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    loadMensalidades();
  }, []);

  const loadMensalidades = async () => {
    try {
      const data = await financeiroService.listarMensalidades();
      setMensalidades(data);
    } catch (error) {
      toast.error('Erro ao carregar mensalidades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPayModal = (mensalidade: Mensalidade) => {
    setSelectedMensalidade(mensalidade);
    setFormaPagamento('PIX');
    setIsPayModalOpen(true);
  };

  const handleClosePayModal = () => {
    setIsPayModalOpen(false);
    setSelectedMensalidade(null);
  };

  const handlePagar = async () => {
    if (!selectedMensalidade) return;
    setIsPaying(true);

    try {
      await financeiroService.pagarMensalidade(selectedMensalidade.id, { formaPagamento });
      toast.success('Pagamento registrado com sucesso!');
      handleClosePayModal();
      loadMensalidades();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao registrar pagamento');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePrint = (mensalidade: Mensalidade) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo de Pagamento</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { text-align: center; color: #1e40af; }
              .info { margin: 20px 0; }
              .info p { margin: 8px 0; }
              .total { font-size: 1.5em; color: #16a34a; text-align: center; margin: 30px 0; }
            </style>
          </head>
          <body>
            <h1>Recibo de Pagamento</h1>
            <div class="info">
              <p><strong>Aluno:</strong> ${mensalidade.matricula?.aluno?.nome || '-'}</p>
              <p><strong>Referência:</strong> ${mensalidade.mesReferencia}/${mensalidade.anoReferencia}</p>
              <p><strong>Data de Vencimento:</strong> ${new Date(mensalidade.dataVencimento).toLocaleDateString('pt-BR')}</p>
              <p><strong>Data de Pagamento:</strong> ${mensalidade.dataPagamento ? new Date(mensalidade.dataPagamento).toLocaleDateString('pt-BR') : '-'}</p>
              <p><strong>Forma de Pagamento:</strong> ${mensalidade.formaPagamento || '-'}</p>
            </div>
            <div class="total">
              <p>Valor Pago: R$ ${mensalidade.valorFinal.toFixed(2)}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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

  const getStatusVariant = (status: StatusMensalidade) => {
    switch (status) {
      case StatusMensalidade.PAGO:
        return 'success';
      case StatusMensalidade.PENDENTE:
        return 'warning';
      case StatusMensalidade.ATRASADO:
        return 'danger';
      case StatusMensalidade.CANCELADO:
        return 'default';
      default:
        return 'default';
    }
  };

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const filteredMensalidades = mensalidades.filter(
    (m) =>
      m.matricula?.aluno?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meses[m.mesReferencia - 1].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'aluno',
      header: 'Aluno',
      render: (mensalidade: Mensalidade) => mensalidade.matricula?.aluno?.nome || '-',
    },
    {
      key: 'referencia',
      header: 'Referência',
      render: (mensalidade: Mensalidade) =>
        `${meses[mensalidade.mesReferencia - 1]}/${mensalidade.anoReferencia}`,
    },
    {
      key: 'dataVencimento',
      header: 'Vencimento',
      render: (mensalidade: Mensalidade) => formatDate(mensalidade.dataVencimento),
    },
    {
      key: 'valorFinal',
      header: 'Valor',
      render: (mensalidade: Mensalidade) => formatCurrency(mensalidade.valorFinal),
    },
    {
      key: 'status',
      header: 'Status',
      render: (mensalidade: Mensalidade) => (
        <Badge variant={getStatusVariant(mensalidade.status)}>{mensalidade.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (mensalidade: Mensalidade) => (
        <div className="flex gap-2">
          {mensalidade.status !== StatusMensalidade.PAGO && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOpenPayModal(mensalidade)}
              title="Registrar Pagamento"
            >
              <DollarSign size={16} className="text-green-500" />
            </Button>
          )}
          {mensalidade.status === StatusMensalidade.PAGO && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePrint(mensalidade)}
              title="Imprimir Recibo"
            >
              <Printer size={16} className="text-blue-500" />
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
        <h1 className="text-2xl font-bold text-gray-900">Mensalidades</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mensalidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredMensalidades}
            columns={columns}
            keyExtractor={(m) => m.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isPayModalOpen}
        onClose={handleClosePayModal}
        title="Registrar Pagamento"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Registrar pagamento da mensalidade de{' '}
            <strong>
              {selectedMensalidade
                ? `${meses[selectedMensalidade.mesReferencia - 1]}/${selectedMensalidade.anoReferencia}`
                : ''}
            </strong>
          </p>
          <p className="text-2xl font-bold text-green-600">
            {selectedMensalidade ? formatCurrency(selectedMensalidade.valorFinal) : ''}
          </p>
          <Select
            label="Forma de Pagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            options={[
              { value: 'PIX', label: 'PIX' },
              { value: 'DINHEIRO', label: 'Dinheiro' },
              { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
              { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
              { value: 'BOLETO', label: 'Boleto' },
              { value: 'TRANSFERENCIA', label: 'Transferência' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClosePayModal}>
              Cancelar
            </Button>
            <Button onClick={handlePagar} isLoading={isPaying} variant="success">
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
