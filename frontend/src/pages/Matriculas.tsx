import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Matricula, Aluno, PlanoMensalidade, StatusMatricula } from '../types';
import { financeiroService } from '../services/financeiroService';
import { alunoService } from '../services/alunoService';
import { Plus, Pencil, Search, FileText, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

export function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<PlanoMensalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    alunoId: '',
    planoMensalidadeId: '',
    anoLetivo: new Date().getFullYear(),
    valorMatricula: 0,
    desconto: 0,
    status: StatusMatricula.ATIVA,
    observacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matriculasData, alunosData, planosData] = await Promise.all([
        financeiroService.listarMatriculas(),
        alunoService.listar(),
        financeiroService.listarPlanos(),
      ]);
      setMatriculas(matriculasData);
      setAlunos(alunosData);
      setPlanos(planosData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (matricula?: Matricula) => {
    if (matricula) {
      setEditingMatricula(matricula);
      setFormData({
        alunoId: matricula.alunoId,
        planoMensalidadeId: matricula.planoMensalidadeId,
        anoLetivo: matricula.anoLetivo,
        valorMatricula: matricula.valorMatricula,
        desconto: matricula.desconto,
        status: matricula.status,
        observacao: matricula.observacao || '',
      });
    } else {
      setEditingMatricula(null);
      setFormData({
        alunoId: '',
        planoMensalidadeId: '',
        anoLetivo: new Date().getFullYear(),
        valorMatricula: 0,
        desconto: 0,
        status: StatusMatricula.ATIVA,
        observacao: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMatricula(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingMatricula) {
        await financeiroService.atualizarMatricula(editingMatricula.id, formData);
        toast.success('Matrícula atualizada com sucesso!');
      } else {
        await financeiroService.criarMatricula(formData);
        toast.success('Matrícula criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar matrícula');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGerarMensalidades = async (matriculaId: string) => {
    try {
      await financeiroService.gerarMensalidades(matriculaId, new Date().getFullYear());
      toast.success('Mensalidades geradas com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao gerar mensalidades');
    }
  };

  const handlePrint = (matricula: Matricula) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Termo de Matrícula</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { text-align: center; color: #1e40af; }
              .info { margin: 20px 0; }
              .info p { margin: 8px 0; }
              .signature { margin-top: 60px; text-align: center; }
              .signature-line { border-top: 1px solid #000; width: 300px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <h1>Termo de Matrícula</h1>
            <div class="info">
              <p><strong>Aluno:</strong> ${matricula.aluno?.nome || '-'}</p>
              <p><strong>Ano Letivo:</strong> ${matricula.anoLetivo}</p>
              <p><strong>Plano:</strong> ${matricula.planoMensalidade?.nome || '-'}</p>
              <p><strong>Valor da Matrícula:</strong> R$ ${matricula.valorMatricula.toFixed(2)}</p>
              <p><strong>Desconto:</strong> ${matricula.desconto}%</p>
              <p><strong>Data:</strong> ${new Date(matricula.dataMatricula).toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <p>Assinatura do Responsável</p>
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

  const getStatusVariant = (status: StatusMatricula) => {
    switch (status) {
      case StatusMatricula.ATIVA:
        return 'success';
      case StatusMatricula.TRANCADA:
        return 'warning';
      case StatusMatricula.CANCELADA:
        return 'danger';
      case StatusMatricula.CONCLUIDA:
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredMatriculas = matriculas.filter(
    (m) =>
      m.aluno?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.anoLetivo.toString().includes(searchTerm)
  );

  const columns = [
    {
      key: 'aluno.nome',
      header: 'Aluno',
      render: (matricula: Matricula) => matricula.aluno?.nome || '-',
    },
    { key: 'anoLetivo', header: 'Ano Letivo' },
    {
      key: 'planoMensalidade.nome',
      header: 'Plano',
      render: (matricula: Matricula) => matricula.planoMensalidade?.nome || '-',
    },
    {
      key: 'valorMatricula',
      header: 'Valor',
      render: (matricula: Matricula) => formatCurrency(matricula.valorMatricula),
    },
    {
      key: 'status',
      header: 'Status',
      render: (matricula: Matricula) => (
        <Badge variant={getStatusVariant(matricula.status)}>{matricula.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (matricula: Matricula) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleGerarMensalidades(matricula.id)}
            title="Gerar Mensalidades"
          >
            <FileText size={16} className="text-green-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePrint(matricula)}
            title="Imprimir Termo"
          >
            <Printer size={16} className="text-blue-500" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(matricula)}>
            <Pencil size={16} />
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
        <h1 className="text-2xl font-bold text-gray-900">Matrículas</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Nova Matrícula
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredMatriculas}
            columns={columns}
            keyExtractor={(m) => m.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMatricula ? 'Editar Matrícula' : 'Nova Matrícula'}
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
                label: a.nome,
              }))}
              placeholder="Selecione um aluno"
              required
            />
            <Select
              label="Plano de Mensalidade"
              value={formData.planoMensalidadeId}
              onChange={(e) => setFormData({ ...formData, planoMensalidadeId: e.target.value })}
              options={planos.map((p) => ({
                value: p.id,
                label: `${p.nome} - ${formatCurrency(p.valor)}`,
              }))}
              placeholder="Selecione um plano"
              required
            />
            <Input
              label="Ano Letivo"
              type="number"
              value={formData.anoLetivo}
              onChange={(e) => setFormData({ ...formData, anoLetivo: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Valor da Matrícula"
              type="number"
              step="0.01"
              value={formData.valorMatricula}
              onChange={(e) => setFormData({ ...formData, valorMatricula: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Desconto (%)"
              type="number"
              min="0"
              max="100"
              value={formData.desconto}
              onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusMatricula })}
              options={[
                { value: StatusMatricula.ATIVA, label: 'Ativa' },
                { value: StatusMatricula.TRANCADA, label: 'Trancada' },
                { value: StatusMatricula.CANCELADA, label: 'Cancelada' },
                { value: StatusMatricula.CONCLUIDA, label: 'Concluída' },
              ]}
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
              {editingMatricula ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
