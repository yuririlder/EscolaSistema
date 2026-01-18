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
import { Aluno, Responsavel, Turma, ContatoEmergencia } from '../types';
import { alunoService } from '../services/alunoService';
import { responsavelService } from '../services/responsavelService';
import { turmaService } from '../services/turmaService';
import { historicoEscolarService } from '../services/historicoEscolarService';
import { removeMask } from '../utils/masks';
import { Plus, Pencil, Trash2, Search, GraduationCap, BookOpen, Printer, AlertCircle, Heart, FileCheck, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { gerarFichaCompletaAlunoPDF } from '../utils/pdfGenerator';
import { financeiroService } from '../services/financeiroService';

const PARENTESCO_OPTIONS = [
  { value: 'PAI', label: 'Pai' },
  { value: 'MAE', label: 'Mãe' },
  { value: 'AVO', label: 'Avó' },
  { value: 'AVO_M', label: 'Avô' },
  { value: 'TIO', label: 'Tio' },
  { value: 'TIA', label: 'Tia' },
  { value: 'AMIGO', label: 'Amigo(a)' },
  { value: 'VIZINHO', label: 'Vizinho(a)' },
  { value: 'IRMAO', label: 'Irmão/Irmã' },
  { value: 'PRIMO', label: 'Primo(a)' },
  { value: 'CUNHADO', label: 'Cunhado(a)' },
  { value: 'OUTRO', label: 'Outro' },
];

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
  const [activeTab, setActiveTab] = useState<'dados' | 'saude' | 'autorizacoes' | 'documentos'>('dados');
  
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    cpf: '',
    sexo: 'M',
    responsavel_id: '',
    parentesco_responsavel: '',
    turma_id: '',
    // Contatos de emergência
    contato1_nome: '',
    contato1_telefone: '',
    contato1_parentesco: '',
    contato2_nome: '',
    contato2_telefone: '',
    contato2_parentesco: '',
    // Informações de saúde
    possui_alergia: false,
    alergia_descricao: '',
    restricao_alimentar: false,
    restricao_alimentar_descricao: '',
    uso_medicamento: false,
    medicamento_descricao: '',
    necessidade_especial: false,
    necessidade_especial_descricao: '',
    // Autorizações
    autoriza_atividades: true,
    autoriza_emergencia: true,
    autoriza_imagem: false,
    // Documentos
    doc_certidao_nascimento: false,
    doc_cpf_aluno: false,
    doc_rg_cpf_responsavel: false,
    doc_comprovante_residencia: false,
    doc_cartao_sus: false,
    doc_carteira_vacinacao: false,
    // Considerações
    consideracoes: '',
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

  const resetForm = () => {
    setFormData({
      nome: '',
      data_nascimento: '',
      cpf: '',
      sexo: 'M',
      responsavel_id: '',
      parentesco_responsavel: '',
      turma_id: '',
      contato1_nome: '',
      contato1_telefone: '',
      contato1_parentesco: '',
      contato2_nome: '',
      contato2_telefone: '',
      contato2_parentesco: '',
      possui_alergia: false,
      alergia_descricao: '',
      restricao_alimentar: false,
      restricao_alimentar_descricao: '',
      uso_medicamento: false,
      medicamento_descricao: '',
      necessidade_especial: false,
      necessidade_especial_descricao: '',
      autoriza_atividades: true,
      autoriza_emergencia: true,
      autoriza_imagem: false,
      doc_certidao_nascimento: false,
      doc_cpf_aluno: false,
      doc_rg_cpf_responsavel: false,
      doc_comprovante_residencia: false,
      doc_cartao_sus: false,
      doc_carteira_vacinacao: false,
      consideracoes: '',
    });
    setActiveTab('dados');
  };

  const handleOpenModal = async (aluno?: Aluno) => {
    if (aluno) {
      setEditingAluno(aluno);
      // Buscar dados completos do aluno incluindo contatos de emergência
      try {
        const alunoCompleto = await alunoService.obterPorId(aluno.id);
        const a = alunoCompleto || aluno as any;
        const dataNasc = a.data_nascimento || a.dataNascimento;
        const contatos = a.contatos_emergencia || [];
        
        setFormData({
          nome: a.nome,
          data_nascimento: dataNasc ? new Date(dataNasc).toISOString().split('T')[0] : '',
          cpf: a.cpf || '',
          sexo: a.sexo || a.genero || 'M',
          responsavel_id: a.responsavel_id || a.responsavelId || '',
          parentesco_responsavel: a.parentesco_responsavel || '',
          turma_id: a.turma_id || a.turmaId || '',
          contato1_nome: contatos[0]?.nome || '',
          contato1_telefone: contatos[0]?.telefone || '',
          contato1_parentesco: contatos[0]?.parentesco || '',
          contato2_nome: contatos[1]?.nome || '',
          contato2_telefone: contatos[1]?.telefone || '',
          contato2_parentesco: contatos[1]?.parentesco || '',
          possui_alergia: a.possui_alergia || false,
          alergia_descricao: a.alergia_descricao || '',
          restricao_alimentar: a.restricao_alimentar || false,
          restricao_alimentar_descricao: a.restricao_alimentar_descricao || '',
          uso_medicamento: a.uso_medicamento || false,
          medicamento_descricao: a.medicamento_descricao || '',
          necessidade_especial: a.necessidade_especial || false,
          necessidade_especial_descricao: a.necessidade_especial_descricao || '',
          autoriza_atividades: a.autoriza_atividades !== false,
          autoriza_emergencia: a.autoriza_emergencia !== false,
          autoriza_imagem: a.autoriza_imagem || false,
          doc_certidao_nascimento: a.doc_certidao_nascimento || false,
          doc_cpf_aluno: a.doc_cpf_aluno || false,
          doc_rg_cpf_responsavel: a.doc_rg_cpf_responsavel || false,
          doc_comprovante_residencia: a.doc_comprovante_residencia || false,
          doc_cartao_sus: a.doc_cartao_sus || false,
          doc_carteira_vacinacao: a.doc_carteira_vacinacao || false,
          consideracoes: a.consideracoes || '',
        });
      } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        const a = aluno as any;
        const dataNasc = a.data_nascimento || a.dataNascimento;
        setFormData({
          ...formData,
          nome: a.nome,
          data_nascimento: dataNasc ? new Date(dataNasc).toISOString().split('T')[0] : '',
          cpf: a.cpf || '',
          sexo: a.sexo || a.genero || 'M',
          responsavel_id: a.responsavel_id || a.responsavelId || '',
          turma_id: a.turma_id || a.turmaId || '',
        });
      }
    } else {
      setEditingAluno(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAluno(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contatos de emergência
    if (!formData.contato1_nome || !formData.contato1_telefone || !formData.contato1_parentesco) {
      toast.error('O primeiro contato de emergência é obrigatório');
      setActiveTab('dados');
      return;
    }
    if (!formData.contato2_nome || !formData.contato2_telefone || !formData.contato2_parentesco) {
      toast.error('O segundo contato de emergência é obrigatório');
      setActiveTab('dados');
      return;
    }

    setIsSaving(true);

    try {
      const contatos_emergencia: ContatoEmergencia[] = [
        { nome: formData.contato1_nome, telefone: removeMask(formData.contato1_telefone), parentesco: formData.contato1_parentesco },
        { nome: formData.contato2_nome, telefone: removeMask(formData.contato2_telefone), parentesco: formData.contato2_parentesco },
      ];

      const payload: any = {
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
        cpf: removeMask(formData.cpf) || undefined,
        sexo: formData.sexo,
        responsavel_id: formData.responsavel_id,
        parentesco_responsavel: formData.parentesco_responsavel,
        turma_id: formData.turma_id || undefined,
        contatos_emergencia,
        // Saúde
        possui_alergia: formData.possui_alergia,
        alergia_descricao: formData.possui_alergia ? formData.alergia_descricao : null,
        restricao_alimentar: formData.restricao_alimentar,
        restricao_alimentar_descricao: formData.restricao_alimentar ? formData.restricao_alimentar_descricao : null,
        uso_medicamento: formData.uso_medicamento,
        medicamento_descricao: formData.uso_medicamento ? formData.medicamento_descricao : null,
        necessidade_especial: formData.necessidade_especial,
        necessidade_especial_descricao: formData.necessidade_especial ? formData.necessidade_especial_descricao : null,
        // Autorizações
        autoriza_atividades: formData.autoriza_atividades,
        autoriza_emergencia: formData.autoriza_emergencia,
        autoriza_imagem: formData.autoriza_imagem,
        // Documentos
        doc_certidao_nascimento: formData.doc_certidao_nascimento,
        doc_cpf_aluno: formData.doc_cpf_aluno,
        doc_rg_cpf_responsavel: formData.doc_rg_cpf_responsavel,
        doc_comprovante_residencia: formData.doc_comprovante_residencia,
        doc_cartao_sus: formData.doc_cartao_sus,
        doc_carteira_vacinacao: formData.doc_carteira_vacinacao,
        // Considerações
        consideracoes: formData.consideracoes,
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
      
      const matriculas = await financeiroService.listarMatriculas();
      const matriculaAluno = matriculas.find(m => {
        const mat = m as any;
        return (mat.aluno_id || mat.alunoId) === aluno.id;
      });
      
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

      {/* Modal Novo/Editar Aluno */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'dados' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <UserCheck size={16} />
              Dados e Contatos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saude')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'saude' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Heart size={16} />
              Saúde
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('autorizacoes')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'autorizacoes' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileCheck size={16} />
              Autorizações
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documentos')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'documentos' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <AlertCircle size={16} />
              Documentos
            </button>
          </div>

          {/* Tab: Dados Pessoais e Contatos */}
          {activeTab === 'dados' && (
            <div className="space-y-6">
              {/* Dados do Aluno */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Dados do Aluno</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome Completo"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    required
                  />
                  <MaskedInput
                    label="CPF"
                    mask="cpf"
                    value={formData.cpf}
                    onChange={(value) => setFormData({ ...formData, cpf: value })}
                    placeholder="000.000.000-00"
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
              </div>

              {/* Responsável */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Responsável</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Autocomplete
                    label="Responsável"
                    value={formData.responsavel_id}
                    options={responsavelOptions}
                    onChange={(value) => setFormData({ ...formData, responsavel_id: value })}
                    placeholder="Digite o nome do responsável..."
                    required
                  />
                  <Select
                    label="Parentesco com o Aluno"
                    value={formData.parentesco_responsavel}
                    onChange={(e) => setFormData({ ...formData, parentesco_responsavel: e.target.value })}
                    options={PARENTESCO_OPTIONS}
                    placeholder="Selecione o parentesco"
                    required
                  />
                </div>
              </div>

              {/* Contatos de Emergência */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Contatos de Emergência (obrigatório 2 contatos)</h3>
                
                {/* Contato 1 */}
                <div className="p-3 bg-gray-50 rounded-lg mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Contato 1</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Nome"
                      value={formData.contato1_nome}
                      onChange={(e) => setFormData({ ...formData, contato1_nome: e.target.value })}
                      required
                    />
                    <MaskedInput
                      label="Telefone"
                      mask="phone"
                      value={formData.contato1_telefone}
                      onChange={(value) => setFormData({ ...formData, contato1_telefone: value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                    <Select
                      label="Parentesco"
                      value={formData.contato1_parentesco}
                      onChange={(e) => setFormData({ ...formData, contato1_parentesco: e.target.value })}
                      options={PARENTESCO_OPTIONS}
                      placeholder="Selecione"
                      required
                    />
                  </div>
                </div>

                {/* Contato 2 */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Contato 2</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Nome"
                      value={formData.contato2_nome}
                      onChange={(e) => setFormData({ ...formData, contato2_nome: e.target.value })}
                      required
                    />
                    <MaskedInput
                      label="Telefone"
                      mask="phone"
                      value={formData.contato2_telefone}
                      onChange={(value) => setFormData({ ...formData, contato2_telefone: value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                    <Select
                      label="Parentesco"
                      value={formData.contato2_parentesco}
                      onChange={(e) => setFormData({ ...formData, contato2_parentesco: e.target.value })}
                      options={PARENTESCO_OPTIONS}
                      placeholder="Selecione"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Saúde */}
          {activeTab === 'saude' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Informações de Saúde</h3>
              
              {/* Alergias */}
              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.possui_alergia}
                    onChange={(e) => setFormData({ ...formData, possui_alergia: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">Possui alergias?</span>
                </label>
                {formData.possui_alergia && (
                  <div className="mt-3">
                    <Input
                      label="Quais alergias?"
                      value={formData.alergia_descricao}
                      onChange={(e) => setFormData({ ...formData, alergia_descricao: e.target.value })}
                      placeholder="Descreva as alergias..."
                    />
                  </div>
                )}
              </div>

              {/* Restrição Alimentar */}
              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.restricao_alimentar}
                    onChange={(e) => setFormData({ ...formData, restricao_alimentar: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">Possui restrição alimentar?</span>
                </label>
                {formData.restricao_alimentar && (
                  <div className="mt-3">
                    <Input
                      label="Quais restrições?"
                      value={formData.restricao_alimentar_descricao}
                      onChange={(e) => setFormData({ ...formData, restricao_alimentar_descricao: e.target.value })}
                      placeholder="Descreva as restrições alimentares..."
                    />
                  </div>
                )}
              </div>

              {/* Uso de Medicamento */}
              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.uso_medicamento}
                    onChange={(e) => setFormData({ ...formData, uso_medicamento: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">Faz uso contínuo de medicamento?</span>
                </label>
                {formData.uso_medicamento && (
                  <div className="mt-3">
                    <Input
                      label="Quais medicamentos?"
                      value={formData.medicamento_descricao}
                      onChange={(e) => setFormData({ ...formData, medicamento_descricao: e.target.value })}
                      placeholder="Descreva os medicamentos em uso..."
                    />
                  </div>
                )}
              </div>

              {/* Necessidades Especiais */}
              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.necessidade_especial}
                    onChange={(e) => setFormData({ ...formData, necessidade_especial: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">Possui necessidades especiais ou laudo médico?</span>
                </label>
                {formData.necessidade_especial && (
                  <div className="mt-3">
                    <Input
                      label="Quais necessidades/laudos?"
                      value={formData.necessidade_especial_descricao}
                      onChange={(e) => setFormData({ ...formData, necessidade_especial_descricao: e.target.value })}
                      placeholder="Descreva as necessidades especiais ou laudos..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Autorizações */}
          {activeTab === 'autorizacoes' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Autorizações</h3>

              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoriza_atividades}
                    onChange={(e) => setFormData({ ...formData, autoriza_atividades: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">Autorizo a participação em atividades escolares</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Passeios, eventos, apresentações e outras atividades pedagógicas</p>
              </div>

              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoriza_emergencia}
                    onChange={(e) => setFormData({ ...formData, autoriza_emergencia: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">Autorizo atendimento emergencial</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Em caso de emergência, autorizo a escola a encaminhar o aluno para atendimento médico</p>
              </div>

              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoriza_imagem}
                    onChange={(e) => setFormData({ ...formData, autoriza_imagem: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">Autorizo uso de imagem para fins pedagógicos</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Fotos e vídeos em atividades escolares para uso interno e divulgação da escola</p>
              </div>
            </div>
          )}

          {/* Tab: Documentos */}
          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Check-list de Documentos Entregues</h3>
              <p className="text-xs text-gray-500 mb-4">Marque os documentos que foram entregues para arquivo na escola</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.doc_certidao_nascimento}
                    onChange={(e) => setFormData({ ...formData, doc_certidao_nascimento: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span>Certidão de Nascimento</span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.doc_cpf_aluno}
                    onChange={(e) => setFormData({ ...formData, doc_cpf_aluno: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span>CPF da Criança</span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.doc_rg_cpf_responsavel}
                    onChange={(e) => setFormData({ ...formData, doc_rg_cpf_responsavel: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span>RG e CPF do Responsável</span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.doc_comprovante_residencia}
                    onChange={(e) => setFormData({ ...formData, doc_comprovante_residencia: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span>Comprovante de Residência</span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.doc_cartao_sus}
                    onChange={(e) => setFormData({ ...formData, doc_cartao_sus: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span>Cartão SUS</span>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.doc_carteira_vacinacao}
                    onChange={(e) => setFormData({ ...formData, doc_carteira_vacinacao: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span>Carteira de Vacinação</span>
                </label>
              </div>

              {/* Considerações */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Considerações Adicionais</h3>
                <textarea
                  value={formData.consideracoes}
                  onChange={(e) => setFormData({ ...formData, consideracoes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Informações adicionais que o responsável deseja acrescentar..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
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
