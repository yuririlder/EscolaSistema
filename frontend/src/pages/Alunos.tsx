import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { MaskedInput } from '../components/ui/MaskedInput';
import { Autocomplete } from '../components/ui/Autocomplete';
import { Aluno, Responsavel, Turma } from '../types';
import { alunoService } from '../services/alunoService';
import { responsavelService } from '../services/responsavelService';
import { turmaService } from '../services/turmaService';
import { historicoEscolarService } from '../services/historicoEscolarService';
import { removeMask } from '../utils/masks';
import { Plus, Pencil, Trash2, Search, GraduationCap, BookOpen, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { gerarFichaCompletaAlunoPDF } from '../utils/pdfGenerator';
import { financeiroService } from '../services/financeiroService';

export function Alunos() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [selectedAlunoForTurma, setSelectedAlunoForTurma] = useState<Aluno | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    cpf: '',
    sexo: 'M',
    responsavel_id: '',
    turma_id: '',
  });
  const [turmaFormData, setTurmaFormData] = useState({
    turma_id: '',
    ano_letivo: new Date().getFullYear(),
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
      const a = aluno as any;
      const dataNasc = a.data_nascimento || a.dataNascimento;
      setFormData({
        nome: aluno.nome,
        data_nascimento: dataNasc ? new Date(dataNasc).toISOString().split('T')[0] : '',
        cpf: aluno.cpf || '',
        sexo: a.sexo || a.genero || 'M',
        responsavel_id: a.responsavel_id || a.responsavelId || '',
        turma_id: a.turma_id || a.turmaId || '',
      });
    } else {
      setEditingAluno(null);
      setFormData({
        nome: '',
        data_nascimento: '',
        cpf: '',
        sexo: 'M',
        responsavel_id: '',
        turma_id: '',
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
      const payload: any = {
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
        cpf: removeMask(formData.cpf) || undefined,
        sexo: formData.sexo,
        responsavel_id: formData.responsavel_id,
        turma_id: formData.turma_id || undefined,
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
      const errorMsg = error.response?.data?.error || error.response?.data?.details?.[0]?.msg || 'Erro ao salvar aluno';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenTurmaModal = (aluno: Aluno) => {
    setSelectedAlunoForTurma(aluno);
    const a = aluno as any;
    setTurmaFormData({
      turma_id: a.turma_id || a.turmaId || '',
      ano_letivo: new Date().getFullYear(),
    });
    setIsTurmaModalOpen(true);
  };

  const handleCloseTurmaModal = () => {
    setIsTurmaModalOpen(false);
    setSelectedAlunoForTurma(null);
  };

  const handleVincularTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlunoForTurma || !turmaFormData.turma_id) return;
    setIsSaving(true);

    try {
      await historicoEscolarService.vincularAlunoTurma({
        aluno_id: selectedAlunoForTurma.id,
        turma_id: turmaFormData.turma_id,
        ano_letivo: turmaFormData.ano_letivo,
      });
      toast.success('Aluno vinculado à turma com sucesso!');
      handleCloseTurmaModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao vincular aluno à turma');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este aluno? O histórico será mantido.')) return;

    try {
      await alunoService.excluir(id);
      toast.success('Aluno desativado com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar aluno');
    }
  };

  const handlePrintFichaAluno = async (aluno: Aluno) => {
    try {
      const alunoData = aluno as any;
      const responsavel = responsaveis.find(r => r.id === (alunoData.responsavel_id || alunoData.responsavelId));
      const turma = turmas.find(t => t.id === (alunoData.turma_id || alunoData.turmaId));
      
      // Buscar matrícula do aluno
      const matriculas = await financeiroService.listarMatriculas();
      const matriculaAluno = matriculas.find(m => {
        const mat = m as any;
        return (mat.aluno_id || mat.alunoId) === aluno.id;
      });
      
      // Buscar plano se houver matrícula
      let plano = null;
      if (matriculaAluno) {
        const planos = await financeiroService.listarPlanos();
        const mat = matriculaAluno as any;
        plano = planos.find(p => p.id === (mat.plano_id || mat.planoMensalidadeId));
      }

      gerarFichaCompletaAlunoPDF({
        aluno: {
          nome: aluno.nome,
          data_nascimento: alunoData.data_nascimento || alunoData.dataNascimento,
          cpf: aluno.cpf,
          sexo: alunoData.sexo || alunoData.genero,
          matricula_numero: alunoData.matricula_numero || alunoData.matriculaNumero,
        },
        responsavel: responsavel ? {
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          email: responsavel.email,
          telefone: responsavel.telefone,
          endereco: responsavel.endereco,
          profissao: responsavel.profissao,
        } : {
          nome: alunoData.responsavel?.nome || alunoData.responsavel_nome || '-',
        },
        matricula: matriculaAluno ? {
          ano_letivo: (matriculaAluno as any).ano_letivo || (matriculaAluno as any).anoLetivo,
          data_matricula: (matriculaAluno as any).data_matricula || (matriculaAluno as any).dataMatricula,
          valor_matricula: (matriculaAluno as any).valor_matricula || (matriculaAluno as any).valorMatricula || 0,
          desconto: (matriculaAluno as any).desconto || 0,
          status: matriculaAluno.status,
          pago: true,
        } : undefined,
        turma: turma ? {
          nome: turma.nome,
          serie: turma.serie,
          turno: turma.turno,
          ano: turma.ano,
        } : undefined,
        plano: plano ? {
          nome: plano.nome,
          valor: plano.valor,
        } : undefined,
      });
    } catch (error) {
      toast.error('Erro ao gerar ficha do aluno');
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Filtrar turmas pelo ano letivo selecionado
  const turmasFiltradas = turmas.filter((t) => t.ano === turmaFormData.ano_letivo && t.ativa);

  const filteredAlunos = alunos.filter((a) => {
    const searchLower = searchTerm.toLowerCase();
    const aluno = a as any;
    return (
      aluno.nome?.toLowerCase().includes(searchLower) ||
      aluno.matricula_numero?.includes(searchTerm) ||
      aluno.matriculaNumero?.includes(searchTerm)
    );
  });

  const responsavelOptions = responsaveis.map((r) => ({
    value: r.id,
    label: `${r.nome} - CPF: ${r.cpf || 'N/A'}`,
  }));

  const columns = [
    { key: 'matricula_numero', header: 'Matrícula', render: (a: Aluno) => (a as any).matricula_numero || (a as any).matriculaNumero || '-' },
    { key: 'nome', header: 'Nome' },
    {
      key: 'data_nascimento',
      header: 'Data de Nascimento',
      render: (aluno: Aluno) => formatDate((aluno as any).data_nascimento || (aluno as any).dataNascimento),
    },
    {
      key: 'turma',
      header: 'Turma',
      render: (aluno: Aluno) => aluno.turma?.nome || (aluno as any).turma_nome || '-',
    },
    {
      key: 'responsavel',
      header: 'Responsável',
      render: (aluno: Aluno) => aluno.responsavel?.nome || (aluno as any).responsavel_nome || '-',
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (aluno: Aluno) => (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handlePrintFichaAluno(aluno)}
            title="Imprimir Ficha do Aluno"
          >
            <Printer size={16} className="text-purple-500" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleOpenTurmaModal(aluno)}
            title="Vincular à Turma"
          >
            <GraduationCap size={16} className="text-blue-500" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => navigate(`/alunos/${aluno.id}/historico`)}
            title="Ver Histórico Escolar"
          >
            <BookOpen size={16} className="text-green-500" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(aluno)} title="Editar">
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(aluno.id)} title="Excluir">
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
            <MaskedInput
              label="CPF"
              mask="cpf"
              value={formData.cpf}
              onChange={(value) => setFormData({ ...formData, cpf: value })}
              placeholder="000.000.000-00"
            />
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              required
            />
            <Select
              label="Gênero"
              value={formData.sexo}
              onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
              options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Feminino' },
                { value: 'O', label: 'Outro' },
              ]}
            />
            <Autocomplete
              label="Responsável"
              value={formData.responsavel_id}
              options={responsavelOptions}
              onChange={(value) => setFormData({ ...formData, responsavel_id: value })}
              placeholder="Digite o nome do responsável..."
              required
            />
            <Select
              label="Turma"
              value={formData.turma_id}
              onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
              options={turmas.map((t) => ({
                value: t.id,
                label: `${t.nome} - ${t.serie || t.turno}`,
              }))}
              placeholder="Selecione uma turma"
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

      {/* Modal Vincular à Turma */}
      <Modal
        isOpen={isTurmaModalOpen}
        onClose={handleCloseTurmaModal}
        title="Vincular Aluno à Turma"
      >
        <form onSubmit={handleVincularTurma} className="space-y-4">
          {selectedAlunoForTurma && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Aluno selecionado:</p>
              <p className="font-semibold">{selectedAlunoForTurma.nome}</p>
            </div>
          )}
          
          <Select
            label="Ano Letivo"
            value={turmaFormData.ano_letivo.toString()}
            onChange={(e) => setTurmaFormData({ ...turmaFormData, ano_letivo: parseInt(e.target.value) })}
            options={[
              { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
              { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
              { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() },
            ]}
          />
          
          <Select
            label="Turma"
            value={turmaFormData.turma_id}
            onChange={(e) => setTurmaFormData({ ...turmaFormData, turma_id: e.target.value })}
            options={turmasFiltradas.map((t) => ({
              value: t.id,
              label: `${t.nome} - ${t.serie || ''} (${t.turno})`,
            }))}
            placeholder="Selecione uma turma"
            required
          />
          
          {turmasFiltradas.length === 0 && (
            <p className="text-sm text-amber-600">
              Nenhuma turma ativa encontrada para o ano letivo {turmaFormData.ano_letivo}
            </p>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseTurmaModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={!turmaFormData.turma_id}>
              Vincular
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
