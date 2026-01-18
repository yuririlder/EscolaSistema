import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Autocomplete } from '../components/ui/Autocomplete';
import { Matricula, Aluno, PlanoMensalidade, StatusMatricula } from '../types';
import { financeiroService } from '../services/financeiroService';
import { alunoService } from '../services/alunoService';
import { Plus, Pencil, Search, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrencyInput, currencyToNumber, formatNumberInput, formatPercentInput } from '../utils/masks';
import { gerarTermoMatriculaPDF } from '../utils/pdfGenerator';
import { escolaService } from '../services/escolaService';

interface DadosEscola {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<PlanoMensalidade[]>([]);
  const [escola, setEscola] = useState<DadosEscola | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    alunoId: '',
    planoMensalidadeId: '',
    anoLetivo: new Date().getFullYear().toString(),
    valorMatricula: '',
    desconto: '0',
    status: StatusMatricula.ATIVA,
    observacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matriculasData, alunosData, planosData, escolaData] = await Promise.all([
        financeiroService.listarMatriculas(),
        alunoService.listar(),
        financeiroService.listarPlanos(),
        escolaService.obter().catch(() => null),
      ]);
      setMatriculas(matriculasData);
      setAlunos(alunosData);
      setPlanos(planosData);
      if (escolaData) {
        setEscola(escolaData);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (matricula?: Matricula) => {
    if (matricula) {
      const mat = matricula as any;
      setEditingMatricula(matricula);
      setFormData({
        alunoId: mat.alunoId || mat.aluno_id || '',
        planoMensalidadeId: mat.planoMensalidadeId || mat.plano_id || '',
        anoLetivo: (mat.anoLetivo || mat.ano_letivo || new Date().getFullYear()).toString(),
        valorMatricula: formatCurrencyInput(((mat.valorMatricula || mat.valor_matricula || 0) * 100).toString()),
        desconto: (mat.desconto || 0).toString(),
        status: mat.status || StatusMatricula.ATIVA,
        observacao: mat.observacao || mat.observacoes || '',
      });
    } else {
      setEditingMatricula(null);
      setFormData({
        alunoId: '',
        planoMensalidadeId: '',
        anoLetivo: new Date().getFullYear().toString(),
        valorMatricula: '',
        desconto: '0',
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

    // Converter para o formato esperado pelo backend (snake_case)
    const payload = {
      aluno_id: formData.alunoId,
      plano_id: formData.planoMensalidadeId,
      ano_letivo: parseInt(formData.anoLetivo, 10),
      valor_matricula: currencyToNumber(formData.valorMatricula),
      desconto: parseInt(formData.desconto, 10) || 0,
      status: formData.status,
      observacoes: formData.observacao,
    };

    try {
      if (editingMatricula) {
        await financeiroService.atualizarMatricula(editingMatricula.id, payload);
        toast.success('Matrícula atualizada com sucesso!');
      } else {
        await financeiroService.criarMatricula(payload);
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

  const handlePrint = (matricula: Matricula) => {
    const mat = matricula as any;
    const alunoNome = mat.aluno?.nome || mat.aluno_nome || '-';
    const anoLetivo = mat.anoLetivo || mat.ano_letivo || '-';
    const planoNome = mat.planoMensalidade?.nome || mat.plano_nome || '-';
    const valorMatricula = mat.valorMatricula || mat.valor_matricula || 0;
    const valorMensalidade = mat.valorMensalidade || mat.valor_mensalidade || 0;
    const desconto = mat.desconto || 0;
    const dataMatricula = mat.dataMatricula || mat.data_matricula;
    
    // Buscar dados do aluno para informações adicionais
    const alunoData = alunos.find((a) => a.id === (mat.aluno_id || mat.alunoId)) as any;
    const responsavelNome = alunoData?.responsavel?.nome || '';
    const responsavelCpf = alunoData?.responsavel?.cpf || '';
    const responsavelTelefone = alunoData?.responsavel?.celular || alunoData?.responsavel?.telefone || '';
    const alunoDataNascimento = alunoData?.data_nascimento || alunoData?.dataNascimento;
    const turmaNome = alunoData?.turma?.nome || '';
    
    gerarTermoMatriculaPDF({
      alunoNome,
      alunoDataNascimento,
      responsavelNome,
      responsavelCpf,
      responsavelTelefone,
      anoLetivo,
      planoNome,
      valorMensalidade,
      valorMatricula,
      desconto,
      dataMatricula,
      turmaNome,
    }, escola || undefined);
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
    (m) => {
      const mat = m as any;
      const alunoNome = mat.aluno?.nome || mat.aluno_nome || '';
      const anoLetivo = mat.anoLetivo || mat.ano_letivo || '';
      return alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anoLetivo.toString().includes(searchTerm);
    }
  );

  // Opções de alunos para o Autocomplete
  const alunoOptions = alunos.map((a) => ({
    value: a.id,
    label: `${a.nome}${(a as any).matricula_numero ? ` - Mat: ${(a as any).matricula_numero}` : ''}`,
  }));

  const columns = [
    {
      key: 'aluno.nome',
      header: 'Aluno',
      render: (matricula: Matricula) => {
        const mat = matricula as any;
        return mat.aluno?.nome || mat.aluno_nome || '-';
      },
    },
    { 
      key: 'anoLetivo', 
      header: 'Ano Letivo',
      render: (matricula: Matricula) => {
        const mat = matricula as any;
        return mat.anoLetivo || mat.ano_letivo || '-';
      },
    },
    {
      key: 'planoMensalidade.nome',
      header: 'Plano',
      render: (matricula: Matricula) => {
        const mat = matricula as any;
        return mat.planoMensalidade?.nome || mat.plano_nome || '-';
      },
    },
    {
      key: 'valorMatricula',
      header: 'Valor',
      render: (matricula: Matricula) => {
        const mat = matricula as any;
        const valor = mat.valorMatricula || mat.valor_matricula || 0;
        return formatCurrency(valor);
      },
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
            <Autocomplete
              label="Aluno"
              value={formData.alunoId}
              options={alunoOptions}
              onChange={(value) => setFormData({ ...formData, alunoId: value })}
              placeholder="Digite o nome do aluno..."
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
              type="text"
              value={formData.anoLetivo}
              onChange={(e) => setFormData({ ...formData, anoLetivo: formatNumberInput(e.target.value).slice(0, 4) })}
              maxLength={4}
              required
            />
            <Input
              label="Valor da Matrícula"
              type="text"
              value={formData.valorMatricula ? `R$ ${formData.valorMatricula}` : ''}
              onChange={(e) => setFormData({ ...formData, valorMatricula: formatCurrencyInput(e.target.value) })}
              placeholder="R$ 0,00"
              required
            />
            <Input
              label="Desconto (%)"
              type="text"
              value={formData.desconto}
              onChange={(e) => setFormData({ ...formData, desconto: formatPercentInput(e.target.value) })}
              maxLength={3}
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
