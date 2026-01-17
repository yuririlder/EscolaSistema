import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Autocomplete } from '../components/ui/Autocomplete';
import { PagamentoFuncionario, Funcionario, StatusDespesa } from '../types';
import { financeiroService } from '../services/financeiroService';
import { professorService } from '../services/professorService';
import { Plus, Search, DollarSign, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrencyInput, currencyToNumber, formatNumberInput } from '../utils/masks';
import { gerarReciboPagamentoFuncionarioPDF } from '../utils/pdfGenerator';

export function PagamentosFuncionarios() {
  const [pagamentos, setPagamentos] = useState<PagamentoFuncionario[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<PagamentoFuncionario | null>(null);
  const [formaPagamento, setFormaPagamento] = useState('TRANSFERENCIA');
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState({
    funcionarioId: '',
    mesReferencia: new Date().getMonth() + 1,
    anoReferencia: new Date().getFullYear().toString(),
    valorBase: '',
    bonus: '',
    descontos: '',
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
      anoReferencia: new Date().getFullYear().toString(),
      valorBase: '',
      bonus: '',
      descontos: '',
      observacao: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFuncionarioChange = (professorId: string) => {
    const funcionario = funcionarios.find((f) => f.id === professorId) as any;
    // Usar funcionario_id do professor para o pagamento
    const funcId = funcionario?.funcionario_id || funcionario?.id;
    setFormData({
      ...formData,
      funcionarioId: funcId,
      valorBase: funcionario?.salario ? formatCurrencyInput((funcionario.salario * 100).toString()) : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      funcionario_id: formData.funcionarioId,
      mes_referencia: formData.mesReferencia,
      ano_referencia: parseInt(formData.anoReferencia, 10),
      salario_base: currencyToNumber(formData.valorBase),
      bonus: currencyToNumber(formData.bonus),
      descontos: currencyToNumber(formData.descontos),
      observacoes: formData.observacao,
    };

    try {
      await financeiroService.criarPagamentoFuncionario(payload);
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
    setIsPaying(true);
    try {
      await financeiroService.pagarFuncionario(id, { forma_pagamento: formaPagamento });
      toast.success('Pagamento realizado com sucesso!');
      
      // Gerar PDF do recibo
      if (selectedPagamento) {
        const pag = selectedPagamento as any;
        const mesRef = pag.mes_referencia || pag.mesReferencia || 1;
        const anoRef = pag.ano_referencia || pag.anoReferencia || '';
        const salarioBase = pag.salario_base || pag.valorBase || 0;
        const bonus = pag.bonus || 0;
        const descontos = pag.descontos || 0;
        const valorLiquido = pag.valor_liquido || pag.valorFinal || salarioBase + bonus - descontos;
        const funcionarioNome = pag.funcionario?.nome || pag.funcionario_nome || '';
        
        gerarReciboPagamentoFuncionarioPDF({
          funcionarioNome,
          mesReferencia: meses[mesRef - 1],
          anoReferencia: anoRef,
          salarioBase,
          bonus,
          descontos,
          valorLiquido,
          dataPagamento: new Date().toLocaleDateString('pt-BR'),
          formaPagamento,
        });
      }
      
      setIsPayModalOpen(false);
      setSelectedPagamento(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao realizar pagamento');
    } finally {
      setIsPaying(false);
    }
  };

  const handleOpenPayModal = (pagamento: PagamentoFuncionario) => {
    setSelectedPagamento(pagamento);
    setFormaPagamento('TRANSFERENCIA');
    setIsPayModalOpen(true);
  };

  const handlePrintRecibo = (pagamento: PagamentoFuncionario) => {
    const pag = pagamento as any;
    const mesRef = pag.mes_referencia || pag.mesReferencia || 1;
    const anoRef = pag.ano_referencia || pag.anoReferencia || '';
    const salarioBase = pag.salario_base || pag.valorBase || 0;
    const bonus = pag.bonus || 0;
    const descontos = pag.descontos || 0;
    const valorLiquido = pag.valor_liquido || pag.valorFinal || salarioBase + bonus - descontos;
    const funcionarioNome = pag.funcionario?.nome || pag.funcionario_nome || '';
    const dataPagamento = pag.data_pagamento || pag.dataPagamento;
    const formaPag = pag.forma_pagamento || pag.formaPagamento || '-';
    
    gerarReciboPagamentoFuncionarioPDF({
      funcionarioNome,
      mesReferencia: meses[mesRef - 1],
      anoReferencia: anoRef,
      salarioBase,
      bonus,
      descontos,
      valorLiquido,
      dataPagamento: dataPagamento ? new Date(dataPagamento).toLocaleDateString('pt-BR') : '-',
      formaPagamento: formaPag,
    });
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

  const filteredPagamentos = pagamentos.filter((p) => {
    const pag = p as any;
    const funcionarioNome = pag.funcionario?.nome || pag.funcionario_nome || '';
    return funcionarioNome.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Opções de funcionários para o Autocomplete
  const funcionarioOptions = funcionarios.map((f) => ({
    value: f.id,
    label: `${f.nome}${f.cpf ? ` - CPF: ${f.cpf}` : ''}`,
  }));

  const valorFinal = currencyToNumber(formData.valorBase) + currencyToNumber(formData.bonus) - currencyToNumber(formData.descontos);

  const columns = [
    {
      key: 'funcionario.nome',
      header: 'Funcionário',
      render: (pagamento: PagamentoFuncionario) => {
        const pag = pagamento as any;
        return pag.funcionario?.nome || pag.funcionario_nome || '-';
      },
    },
    {
      key: 'referencia',
      header: 'Referência',
      render: (pagamento: PagamentoFuncionario) => {
        const pag = pagamento as any;
        const mes = pag.mesReferencia || pag.mes_referencia || 1;
        const ano = pag.anoReferencia || pag.ano_referencia || '';
        return `${meses[mes - 1]}/${ano}`;
      },
    },
    {
      key: 'valorBase',
      header: 'Valor Base',
      render: (pagamento: PagamentoFuncionario) => {
        const pag = pagamento as any;
        const valor = pag.valorBase || pag.salario_base || 0;
        return formatCurrency(valor);
      },
    },
    {
      key: 'valorFinal',
      header: 'Valor Final',
      render: (pagamento: PagamentoFuncionario) => {
        const pag = pagamento as any;
        const valor = pag.valorFinal || pag.valor_liquido || 0;
        return formatCurrency(valor);
      },
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
              onClick={() => handleOpenPayModal(pagamento)}
              title="Realizar Pagamento"
            >
              <DollarSign size={16} className="text-green-500" />
            </Button>
          )}
          {pagamento.status === StatusDespesa.PAGO && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePrintRecibo(pagamento)}
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
            <Autocomplete
              label="Funcionário"
              value={formData.funcionarioId}
              options={funcionarioOptions}
              onChange={(value) => handleFuncionarioChange(value)}
              placeholder="Digite o nome do funcionário..."
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
                type="text"
                value={formData.anoReferencia}
                onChange={(e) =>
                  setFormData({ ...formData, anoReferencia: formatNumberInput(e.target.value).slice(0, 4) })
                }
                maxLength={4}
                required
              />
            </div>
            <Input
              label="Valor Base (Salário)"
              type="text"
              value={formData.valorBase ? `R$ ${formData.valorBase}` : ''}
              onChange={(e) => setFormData({ ...formData, valorBase: formatCurrencyInput(e.target.value) })}
              placeholder="R$ 0,00"
              required
            />
            <Input
              label="Bônus"
              type="text"
              value={formData.bonus ? `R$ ${formData.bonus}` : ''}
              onChange={(e) => setFormData({ ...formData, bonus: formatCurrencyInput(e.target.value) })}
              placeholder="R$ 0,00"
            />
            <Input
              label="Descontos"
              type="text"
              value={formData.descontos ? `R$ ${formData.descontos}` : ''}
              onChange={(e) => setFormData({ ...formData, descontos: formatCurrencyInput(e.target.value) })}
              placeholder="R$ 0,00"
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

      {/* Modal de Pagamento */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedPagamento(null);
        }}
        title="Confirmar Pagamento de Funcionário"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Confirmar pagamento do funcionário:{' '}
            <strong>
              {selectedPagamento
                ? (selectedPagamento as any).funcionario?.nome ||
                  (selectedPagamento as any).funcionario_nome ||
                  ''
                : ''}
            </strong>
          </p>
          <p className="text-gray-600">
            Referência:{' '}
            <strong>
              {selectedPagamento
                ? `${meses[((selectedPagamento as any).mes_referencia || (selectedPagamento as any).mesReferencia || 1) - 1]}/${(selectedPagamento as any).ano_referencia || (selectedPagamento as any).anoReferencia || ''}`
                : ''}
            </strong>
          </p>
          <p className="text-2xl font-bold text-green-600">
            {selectedPagamento
              ? formatCurrency(
                  (selectedPagamento as any).valor_liquido ||
                    (selectedPagamento as any).valorFinal ||
                    0
                )
              : ''}
          </p>
          <Select
            label="Forma de Pagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            options={[
              { value: 'TRANSFERENCIA', label: 'Transferência Bancária' },
              { value: 'PIX', label: 'PIX' },
              { value: 'DINHEIRO', label: 'Dinheiro' },
              { value: 'CHEQUE', label: 'Cheque' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsPayModalOpen(false);
                setSelectedPagamento(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => selectedPagamento && handlePagar(selectedPagamento.id)}
              isLoading={isPaying}
              variant="success"
            >
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
