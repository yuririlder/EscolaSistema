import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MaskedInput } from '../components/ui/MaskedInput';
import { Autocomplete } from '../components/ui/Autocomplete';
import { Badge } from '../components/ui/Badge';
import { Responsavel, Aluno, Turma, PlanoMensalidade, StatusMatricula } from '../types';
import { responsavelService } from '../services/responsavelService';
import { alunoService } from '../services/alunoService';
import { turmaService } from '../services/turmaService';
import { financeiroService } from '../services/financeiroService';
import { historicoEscolarService } from '../services/historicoEscolarService';
import { removeMask, formatCPF, formatPhone, formatCurrencyInput, currencyToNumber } from '../utils/masks';
import { gerarFichaCompletaAlunoPDF, gerarTermoMatriculaPDF } from '../utils/pdfGenerator';
import {
  UserPlus,
  GraduationCap,
  FileText,
  CreditCard,
  BookOpen,
  Check,
  ChevronRight,
  ChevronLeft,
  Printer,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Definição das etapas do onboarding
const STEPS = [
  { id: 1, title: 'Responsável', icon: UserPlus, description: 'Cadastrar ou selecionar responsável' },
  { id: 2, title: 'Aluno', icon: GraduationCap, description: 'Cadastrar dados do aluno' },
  { id: 3, title: 'Matrícula', icon: FileText, description: 'Registrar matrícula' },
  { id: 4, title: 'Pagamento', icon: CreditCard, description: 'Registrar pagamento da matrícula' },
  { id: 5, title: 'Turma', icon: BookOpen, description: 'Vincular aluno à turma' },
];

export function OnboardingMatricula() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dados carregados
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [planos, setPlanos] = useState<PlanoMensalidade[]>([]);
  
  // Estados de seleção/criação
  const [useExistingResponsavel, setUseExistingResponsavel] = useState(false);
  const [selectedResponsavelId, setSelectedResponsavelId] = useState('');
  
  // Dados criados durante o onboarding
  const [createdResponsavel, setCreatedResponsavel] = useState<Responsavel | null>(null);
  const [createdAluno, setCreatedAluno] = useState<Aluno | null>(null);
  const [createdMatricula, setCreatedMatricula] = useState<any>(null);
  const [matriculaPaga, setMatriculaPaga] = useState(false);
  const [alunoVinculado, setAlunoVinculado] = useState(false);
  
  // Formulários
  const [responsavelForm, setResponsavelForm] = useState({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    celular: '',
    endereco: '',
    bairro: '',
    complemento: '',
    cidade: '',
    estado: '',
    cep: '',
    profissao: '',
    local_trabalho: '',
  });
  
  const [alunoForm, setAlunoForm] = useState({
    nome: '',
    data_nascimento: '',
    cpf: '',
    sexo: 'M',
    parentesco_responsavel: '',
    // Contatos de emergência
    contato1_nome: '',
    contato1_telefone: '',
    contato1_parentesco: '',
    contato2_nome: '',
    contato2_telefone: '',
    contato2_parentesco: '',
    // Saúde
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
  
  const [matriculaForm, setMatriculaForm] = useState({
    plano_id: '',
    ano_letivo: new Date().getFullYear(),
    valor_matricula: '',
    desconto: '0',
    observacoes: '',
  });
  
  const [pagamentoForm, setPagamentoForm] = useState({
    forma_pagamento: 'DINHEIRO',
    observacao: '',
  });
  
  const [turmaForm, setTurmaForm] = useState({
    turma_id: '',
    ano_letivo: new Date().getFullYear(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [responsaveisData, turmasData, planosData] = await Promise.all([
        responsavelService.listar(),
        turmaService.listar(),
        financeiroService.listarPlanos(),
      ]);
      setResponsaveis(responsaveisData);
      setTurmas(turmasData);
      setPlanos(planosData.filter(p => p.ativo));
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Opções para Autocomplete
  const responsavelOptions = responsaveis.map((r) => ({
    value: r.id,
    label: `${r.nome} - CPF: ${formatCPF(r.cpf) || 'N/A'}`,
  }));

  // Turmas filtradas pelo ano letivo
  const turmasFiltradas = turmas.filter(
    (t) => t.ano === turmaForm.ano_letivo && t.ativa
  );

  // Handlers para cada etapa
  const handleCreateResponsavel = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...responsavelForm,
        cpf: removeMask(responsavelForm.cpf),
        telefone: removeMask(responsavelForm.telefone),
        celular: removeMask(responsavelForm.celular),
        cep: removeMask(responsavelForm.cep),
      };
      const novoResponsavel = await responsavelService.criar(payload);
      setCreatedResponsavel(novoResponsavel);
      setResponsaveis([...responsaveis, novoResponsavel]);
      toast.success('Responsável cadastrado com sucesso!');
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar responsável');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectExistingResponsavel = () => {
    const responsavel = responsaveis.find(r => r.id === selectedResponsavelId);
    if (responsavel) {
      setCreatedResponsavel(responsavel);
      setCurrentStep(2);
    } else {
      toast.error('Selecione um responsável');
    }
  };

  const handleCreateAluno = async () => {
    if (!createdResponsavel) return;
    
    // Validar contatos de emergência
    if (!alunoForm.contato1_nome || !alunoForm.contato1_telefone || !alunoForm.contato1_parentesco) {
      toast.error('O primeiro contato de emergência é obrigatório');
      return;
    }
    if (!alunoForm.contato2_nome || !alunoForm.contato2_telefone || !alunoForm.contato2_parentesco) {
      toast.error('O segundo contato de emergência é obrigatório');
      return;
    }
    
    setIsSaving(true);
    try {
      const contatos_emergencia = [
        { nome: alunoForm.contato1_nome, telefone: removeMask(alunoForm.contato1_telefone), parentesco: alunoForm.contato1_parentesco },
        { nome: alunoForm.contato2_nome, telefone: removeMask(alunoForm.contato2_telefone), parentesco: alunoForm.contato2_parentesco },
      ];

      const payload = {
        nome: alunoForm.nome,
        data_nascimento: alunoForm.data_nascimento,
        cpf: removeMask(alunoForm.cpf) || undefined,
        sexo: alunoForm.sexo,
        responsavel_id: createdResponsavel.id,
        parentesco_responsavel: alunoForm.parentesco_responsavel,
        contatos_emergencia,
        // Saúde
        possui_alergia: alunoForm.possui_alergia,
        alergia_descricao: alunoForm.possui_alergia ? alunoForm.alergia_descricao : undefined,
        restricao_alimentar: alunoForm.restricao_alimentar,
        restricao_alimentar_descricao: alunoForm.restricao_alimentar ? alunoForm.restricao_alimentar_descricao : undefined,
        uso_medicamento: alunoForm.uso_medicamento,
        medicamento_descricao: alunoForm.uso_medicamento ? alunoForm.medicamento_descricao : undefined,
        necessidade_especial: alunoForm.necessidade_especial,
        necessidade_especial_descricao: alunoForm.necessidade_especial ? alunoForm.necessidade_especial_descricao : undefined,
        // Autorizações
        autoriza_atividades: alunoForm.autoriza_atividades,
        autoriza_emergencia: alunoForm.autoriza_emergencia,
        autoriza_imagem: alunoForm.autoriza_imagem,
        // Documentos
        doc_certidao_nascimento: alunoForm.doc_certidao_nascimento,
        doc_cpf_aluno: alunoForm.doc_cpf_aluno,
        doc_rg_cpf_responsavel: alunoForm.doc_rg_cpf_responsavel,
        doc_comprovante_residencia: alunoForm.doc_comprovante_residencia,
        doc_cartao_sus: alunoForm.doc_cartao_sus,
        doc_carteira_vacinacao: alunoForm.doc_carteira_vacinacao,
        // Considerações
        consideracoes: alunoForm.consideracoes,
      };
      const novoAluno = await alunoService.criar(payload);
      setCreatedAluno(novoAluno);
      toast.success('Aluno cadastrado com sucesso!');
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar aluno');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateMatricula = async () => {
    if (!createdAluno) return;
    setIsSaving(true);
    try {
      const payload = {
        aluno_id: createdAluno.id,
        plano_id: matriculaForm.plano_id,
        ano_letivo: matriculaForm.ano_letivo,
        valor_matricula: currencyToNumber(matriculaForm.valor_matricula),
        desconto: parseInt(matriculaForm.desconto, 10) || 0,
        status: StatusMatricula.ATIVA,
        observacoes: matriculaForm.observacoes,
      };
      const novaMatricula = await financeiroService.criarMatricula(payload);
      setCreatedMatricula(novaMatricula);
      toast.success('Matrícula criada com sucesso!');
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar matrícula');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePagarMatricula = async () => {
    // Por enquanto, apenas marca como pago (poderia integrar com sistema de pagamento)
    setIsSaving(true);
    try {
      // Criar uma mensalidade de matrícula como "pago"
      // ou simplesmente registrar o pagamento
      setMatriculaPaga(true);
      toast.success('Pagamento registrado com sucesso!');
      setCurrentStep(5);
    } catch (error: any) {
      toast.error('Erro ao registrar pagamento');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipPagamento = () => {
    setCurrentStep(5);
  };

  const handleVincularTurma = async () => {
    if (!createdAluno || !turmaForm.turma_id) return;
    setIsSaving(true);
    try {
      await historicoEscolarService.vincularAlunoTurma({
        aluno_id: createdAluno.id,
        turma_id: turmaForm.turma_id,
        ano_letivo: turmaForm.ano_letivo,
      });
      setAlunoVinculado(true);
      toast.success('Aluno vinculado à turma com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao vincular aluno à turma');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImprimirTermoMatricula = () => {
    if (!createdAluno || !createdResponsavel || !createdMatricula) {
      toast.error('Dados incompletos para gerar o termo de matrícula');
      return;
    }

    const planoSelecionado = planos.find(p => p.id === matriculaForm.plano_id);
    const turmaSelecionada = turmas.find(t => t.id === turmaForm.turma_id);

    gerarTermoMatriculaPDF({
      alunoNome: createdAluno.nome,
      alunoDataNascimento: alunoForm.data_nascimento,
      responsavelNome: createdResponsavel.nome,
      responsavelCpf: responsavelForm.cpf || createdResponsavel.cpf,
      responsavelTelefone: responsavelForm.telefone || createdResponsavel.telefone,
      anoLetivo: matriculaForm.ano_letivo,
      planoNome: planoSelecionado?.nome || '-',
      valorMensalidade: planoSelecionado?.valor || 0,
      valorMatricula: currencyToNumber(matriculaForm.valor_matricula),
      desconto: parseInt(matriculaForm.desconto, 10) || 0,
      dataMatricula: createdMatricula.data_matricula || createdMatricula.dataMatricula || new Date().toISOString(),
      turmaNome: turmaSelecionada ? `${turmaSelecionada.nome} - ${turmaSelecionada.serie || ''} (${turmaSelecionada.turno})` : undefined,
    });
  };

  const handleImprimirFichaCompleta = () => {
    if (!createdAluno || !createdResponsavel) {
      toast.error('Dados incompletos para gerar a ficha');
      return;
    }

    const turmaSelecionada = turmas.find(t => t.id === turmaForm.turma_id);
    const planoSelecionado = planos.find(p => p.id === matriculaForm.plano_id);

    gerarFichaCompletaAlunoPDF({
      aluno: {
        nome: createdAluno.nome,
        data_nascimento: alunoForm.data_nascimento,
        cpf: alunoForm.cpf,
        sexo: alunoForm.sexo,
        matricula_numero: (createdAluno as any).matricula_numero || (createdAluno as any).matriculaNumero,
      },
      responsavel: {
        nome: createdResponsavel.nome,
        cpf: responsavelForm.cpf || formatCPF(createdResponsavel.cpf),
        email: createdResponsavel.email,
        telefone: responsavelForm.telefone || formatPhone(createdResponsavel.telefone),
        endereco: createdResponsavel.endereco,
        profissao: createdResponsavel.profissao,
      },
      matricula: createdMatricula ? {
        ano_letivo: matriculaForm.ano_letivo,
        data_matricula: createdMatricula.data_matricula || createdMatricula.dataMatricula || new Date().toISOString(),
        valor_matricula: currencyToNumber(matriculaForm.valor_matricula),
        desconto: parseInt(matriculaForm.desconto, 10) || 0,
        status: createdMatricula.status,
        pago: matriculaPaga,
      } : undefined,
      turma: turmaSelecionada ? {
        nome: turmaSelecionada.nome,
        serie: turmaSelecionada.serie,
        turno: turmaSelecionada.turno,
        ano: turmaSelecionada.ano,
      } : undefined,
      plano: planoSelecionado ? {
        nome: planoSelecionado.nome,
        valor: planoSelecionado.valor,
      } : undefined,
    });
  };

  const handleFinalizar = () => {
    // Gera automaticamente a ficha do aluno e o termo de matrícula
    handleImprimirFichaCompleta();
    
    // Pequeno delay para abrir a segunda janela
    setTimeout(() => {
      handleImprimirTermoMatricula();
    }, 500);
    
    toast.success('Matrícula concluída com sucesso! Documentos gerados.');
    
    // Delay para dar tempo de abrir os PDFs antes de navegar
    setTimeout(() => {
      navigate('/alunos');
    }, 1000);
  };

  const handleNovaMatricula = () => {
    // Reset todos os estados
    setCurrentStep(1);
    setUseExistingResponsavel(false);
    setSelectedResponsavelId('');
    setCreatedResponsavel(null);
    setCreatedAluno(null);
    setCreatedMatricula(null);
    setMatriculaPaga(false);
    setAlunoVinculado(false);
    setResponsavelForm({
      nome: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      email: '',
      telefone: '',
      celular: '',
      endereco: '',
      bairro: '',
      complemento: '',
      cidade: '',
      estado: '',
      cep: '',
      profissao: '',
      local_trabalho: '',
    });
    setAlunoForm({
      nome: '',
      data_nascimento: '',
      cpf: '',
      sexo: 'M',
      parentesco_responsavel: '',
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
    setMatriculaForm({
      plano_id: '',
      ano_letivo: new Date().getFullYear(),
      valor_matricula: '',
      desconto: '0',
      observacoes: '',
    });
    setPagamentoForm({
      forma_pagamento: 'DINHEIRO',
      observacao: '',
    });
    setTurmaForm({
      turma_id: '',
      ano_letivo: new Date().getFullYear(),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Renderização das etapas
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStepResponsavel();
      case 2:
        return renderStepAluno();
      case 3:
        return renderStepMatricula();
      case 4:
        return renderStepPagamento();
      case 5:
        return renderStepTurma();
      default:
        return null;
    }
  };

  const renderStepResponsavel = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Etapa 1:</strong> Cadastre um novo responsável ou selecione um já existente no sistema.
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={!useExistingResponsavel ? 'primary' : 'secondary'}
          onClick={() => setUseExistingResponsavel(false)}
        >
          Novo Responsável
        </Button>
        <Button
          variant={useExistingResponsavel ? 'primary' : 'secondary'}
          onClick={() => setUseExistingResponsavel(true)}
        >
          Responsável Existente
        </Button>
      </div>

      {useExistingResponsavel ? (
        <div className="space-y-4">
          <Autocomplete
            label="Selecionar Responsável"
            value={selectedResponsavelId}
            options={responsavelOptions}
            onChange={(value) => setSelectedResponsavelId(value)}
            placeholder="Digite o nome ou CPF do responsável..."
          />
          <div className="flex justify-end">
            <Button onClick={handleSelectExistingResponsavel} disabled={!selectedResponsavelId}>
              Continuar
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleCreateResponsavel(); }} className="space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo"
                  value={responsavelForm.nome}
                  onChange={(e) => setResponsavelForm({ ...responsavelForm, nome: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Data de Nascimento"
                type="date"
                value={responsavelForm.data_nascimento}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, data_nascimento: e.target.value })}
              />
              <MaskedInput
                label="CPF"
                mask="cpf"
                value={responsavelForm.cpf}
                onChange={(value) => setResponsavelForm({ ...responsavelForm, cpf: value })}
                required
              />
              <Input
                label="RG"
                value={responsavelForm.rg}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, rg: e.target.value })}
              />
              <Input
                label="Profissão"
                value={responsavelForm.profissao}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, profissao: e.target.value })}
              />
            </div>
          </div>
          
          {/* Contato */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="E-mail"
                type="email"
                value={responsavelForm.email}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, email: e.target.value })}
              />
              <MaskedInput
                label="Telefone"
                mask="phone"
                value={responsavelForm.telefone}
                onChange={(value) => setResponsavelForm({ ...responsavelForm, telefone: value })}
                required
              />
              <MaskedInput
                label="Celular"
                mask="phone"
                value={responsavelForm.celular}
                onChange={(value) => setResponsavelForm({ ...responsavelForm, celular: value })}
              />
            </div>
          </div>
          
          {/* Endereço */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Rua"
                  value={responsavelForm.endereco}
                  onChange={(e) => setResponsavelForm({ ...responsavelForm, endereco: e.target.value })}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <Input
                label="Bairro"
                value={responsavelForm.bairro}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, bairro: e.target.value })}
              />
              <Input
                label="Complemento"
                value={responsavelForm.complemento}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, complemento: e.target.value })}
                placeholder="Apto, Bloco, etc."
              />
              <Input
                label="Cidade"
                value={responsavelForm.cidade}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, cidade: e.target.value })}
              />
              <Select
                label="Estado"
                value={responsavelForm.estado}
                onChange={(e) => setResponsavelForm({ ...responsavelForm, estado: e.target.value })}
                options={[
                  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
                  { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
                  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
                  { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
                  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
                  { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
                  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
                  { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
                  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' },
                ]}
                placeholder="UF"
              />
              <MaskedInput
                label="CEP"
                mask="cep"
                value={responsavelForm.cep}
                onChange={(value) => setResponsavelForm({ ...responsavelForm, cep: value })}
                placeholder="00000-000"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Cadastrar e Continuar
              <ChevronRight size={18} />
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  const renderStepAluno = () => {
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

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Etapa 2:</strong> Cadastre os dados do aluno. O aluno será vinculado ao responsável: <strong>{createdResponsavel?.nome}</strong>
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleCreateAluno(); }} className="space-y-6">
          {/* Dados do Aluno */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dados do Aluno</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo do Aluno"
                  value={alunoForm.nome}
                  onChange={(e) => setAlunoForm({ ...alunoForm, nome: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Data de Nascimento"
                type="date"
                value={alunoForm.data_nascimento}
                onChange={(e) => setAlunoForm({ ...alunoForm, data_nascimento: e.target.value })}
                required
              />
              <MaskedInput
                label="CPF (opcional)"
                mask="cpf"
                value={alunoForm.cpf}
                onChange={(value) => setAlunoForm({ ...alunoForm, cpf: value })}
              />
              <Select
                label="Sexo"
                value={alunoForm.sexo}
                onChange={(e) => setAlunoForm({ ...alunoForm, sexo: e.target.value })}
                options={[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Feminino' },
                  { value: 'O', label: 'Outro' },
                ]}
              />
              <Select
                label="Parentesco do Responsável"
                value={alunoForm.parentesco_responsavel}
                onChange={(e) => setAlunoForm({ ...alunoForm, parentesco_responsavel: e.target.value })}
                options={PARENTESCO_OPTIONS}
                placeholder="Selecione o parentesco"
                required
              />
            </div>
          </div>

          {/* Contatos de Emergência */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contatos de Emergência (obrigatório 2 contatos)</h3>
            
            <div className="p-3 bg-gray-50 rounded-lg mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">Contato 1</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Nome"
                  value={alunoForm.contato1_nome}
                  onChange={(e) => setAlunoForm({ ...alunoForm, contato1_nome: e.target.value })}
                  required
                />
                <MaskedInput
                  label="Telefone"
                  mask="phone"
                  value={alunoForm.contato1_telefone}
                  onChange={(value) => setAlunoForm({ ...alunoForm, contato1_telefone: value })}
                  required
                />
                <Select
                  label="Parentesco"
                  value={alunoForm.contato1_parentesco}
                  onChange={(e) => setAlunoForm({ ...alunoForm, contato1_parentesco: e.target.value })}
                  options={PARENTESCO_OPTIONS}
                  placeholder="Selecione"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 mb-2">Contato 2</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Nome"
                  value={alunoForm.contato2_nome}
                  onChange={(e) => setAlunoForm({ ...alunoForm, contato2_nome: e.target.value })}
                  required
                />
                <MaskedInput
                  label="Telefone"
                  mask="phone"
                  value={alunoForm.contato2_telefone}
                  onChange={(value) => setAlunoForm({ ...alunoForm, contato2_telefone: value })}
                  required
                />
                <Select
                  label="Parentesco"
                  value={alunoForm.contato2_parentesco}
                  onChange={(e) => setAlunoForm({ ...alunoForm, contato2_parentesco: e.target.value })}
                  options={PARENTESCO_OPTIONS}
                  placeholder="Selecione"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações de Saúde */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Informações de Saúde</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alunoForm.possui_alergia}
                    onChange={(e) => setAlunoForm({ ...alunoForm, possui_alergia: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="font-medium text-sm">Possui alergias?</span>
                </label>
                {alunoForm.possui_alergia && (
                  <div className="mt-2">
                    <Input
                      value={alunoForm.alergia_descricao}
                      onChange={(e) => setAlunoForm({ ...alunoForm, alergia_descricao: e.target.value })}
                      placeholder="Descreva as alergias..."
                    />
                  </div>
                )}
              </div>

              <div className="p-3 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alunoForm.restricao_alimentar}
                    onChange={(e) => setAlunoForm({ ...alunoForm, restricao_alimentar: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="font-medium text-sm">Possui restrição alimentar?</span>
                </label>
                {alunoForm.restricao_alimentar && (
                  <div className="mt-2">
                    <Input
                      value={alunoForm.restricao_alimentar_descricao}
                      onChange={(e) => setAlunoForm({ ...alunoForm, restricao_alimentar_descricao: e.target.value })}
                      placeholder="Descreva as restrições alimentares..."
                    />
                  </div>
                )}
              </div>

              <div className="p-3 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alunoForm.uso_medicamento}
                    onChange={(e) => setAlunoForm({ ...alunoForm, uso_medicamento: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="font-medium text-sm">Faz uso contínuo de medicamento?</span>
                </label>
                {alunoForm.uso_medicamento && (
                  <div className="mt-2">
                    <Input
                      value={alunoForm.medicamento_descricao}
                      onChange={(e) => setAlunoForm({ ...alunoForm, medicamento_descricao: e.target.value })}
                      placeholder="Descreva os medicamentos..."
                    />
                  </div>
                )}
              </div>

              <div className="p-3 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alunoForm.necessidade_especial}
                    onChange={(e) => setAlunoForm({ ...alunoForm, necessidade_especial: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="font-medium text-sm">Possui necessidades especiais ou laudo médico?</span>
                </label>
                {alunoForm.necessidade_especial && (
                  <div className="mt-2">
                    <Input
                      value={alunoForm.necessidade_especial_descricao}
                      onChange={(e) => setAlunoForm({ ...alunoForm, necessidade_especial_descricao: e.target.value })}
                      placeholder="Descreva as necessidades especiais ou laudos..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Autorizações */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Autorizações</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={alunoForm.autoriza_atividades}
                  onChange={(e) => setAlunoForm({ ...alunoForm, autoriza_atividades: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">Autorizo a participação em atividades escolares (passeios, eventos, etc.)</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={alunoForm.autoriza_emergencia}
                  onChange={(e) => setAlunoForm({ ...alunoForm, autoriza_emergencia: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">Autorizo atendimento emergencial</span>
              </label>
              
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={alunoForm.autoriza_imagem}
                  onChange={(e) => setAlunoForm({ ...alunoForm, autoriza_imagem: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">Autorizo uso de imagem para fins pedagógicos</span>
              </label>
            </div>
          </div>

          {/* Documentos Entregues */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Documentos Entregues</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={alunoForm.doc_certidao_nascimento}
                  onChange={(e) => setAlunoForm({ ...alunoForm, doc_certidao_nascimento: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>Certidão de Nascimento</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={alunoForm.doc_cpf_aluno}
                  onChange={(e) => setAlunoForm({ ...alunoForm, doc_cpf_aluno: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>CPF da Criança</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={alunoForm.doc_rg_cpf_responsavel}
                  onChange={(e) => setAlunoForm({ ...alunoForm, doc_rg_cpf_responsavel: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>RG/CPF Responsável</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={alunoForm.doc_comprovante_residencia}
                  onChange={(e) => setAlunoForm({ ...alunoForm, doc_comprovante_residencia: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>Comprovante Residência</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={alunoForm.doc_cartao_sus}
                  onChange={(e) => setAlunoForm({ ...alunoForm, doc_cartao_sus: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>Cartão SUS</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={alunoForm.doc_carteira_vacinacao}
                  onChange={(e) => setAlunoForm({ ...alunoForm, doc_carteira_vacinacao: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span>Carteira Vacinação</span>
              </label>
            </div>
          </div>

          {/* Considerações */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Considerações Adicionais</h3>
            <textarea
              value={alunoForm.consideracoes}
              onChange={(e) => setAlunoForm({ ...alunoForm, consideracoes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Informações adicionais que o responsável deseja acrescentar..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="secondary" onClick={() => setCurrentStep(1)}>
              <ChevronLeft size={18} />
              Voltar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Cadastrar e Continuar
              <ChevronRight size={18} />
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const renderStepMatricula = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Etapa 3:</strong> Registre a matrícula do aluno <strong>{createdAluno?.nome}</strong> para o ano letivo.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleCreateMatricula(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Plano de Mensalidade"
            value={matriculaForm.plano_id}
            onChange={(e) => setMatriculaForm({ ...matriculaForm, plano_id: e.target.value })}
            options={planos.map((p) => ({
              value: p.id,
              label: `${p.nome} - ${formatCurrency(p.valor)}`,
            }))}
            placeholder="Selecione um plano"
            required
          />
          <Select
            label="Ano Letivo"
            value={matriculaForm.ano_letivo.toString()}
            onChange={(e) => setMatriculaForm({ ...matriculaForm, ano_letivo: parseInt(e.target.value) })}
            options={[
              { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
              { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
              { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() },
            ]}
          />
          <Input
            label="Valor da Matrícula"
            type="text"
            value={matriculaForm.valor_matricula ? `R$ ${matriculaForm.valor_matricula}` : ''}
            onChange={(e) => setMatriculaForm({ ...matriculaForm, valor_matricula: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00"
            required
          />
          <Input
            label="Desconto (%)"
            type="number"
            min="0"
            max="100"
            value={matriculaForm.desconto}
            onChange={(e) => setMatriculaForm({ ...matriculaForm, desconto: e.target.value })}
          />
          <div className="md:col-span-2">
            <Input
              label="Observações"
              value={matriculaForm.observacoes}
              onChange={(e) => setMatriculaForm({ ...matriculaForm, observacoes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="secondary" onClick={() => setCurrentStep(2)}>
            <ChevronLeft size={18} />
            Voltar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Registrar Matrícula
            <ChevronRight size={18} />
          </Button>
        </div>
      </form>
    </div>
  );

  const renderStepPagamento = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Etapa 4:</strong> Registre o pagamento da taxa de matrícula.
        </p>
      </div>

      {createdMatricula && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Aluno:</span>
                <p className="font-semibold">{createdAluno?.nome}</p>
              </div>
              <div>
                <span className="text-gray-500">Valor da Matrícula:</span>
                <p className="font-semibold text-lg text-primary-600">
                  {formatCurrency(currencyToNumber(matriculaForm.valor_matricula))}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Ano Letivo:</span>
                <p className="font-semibold">{matriculaForm.ano_letivo}</p>
              </div>
              <div>
                <span className="text-gray-500">Desconto:</span>
                <p className="font-semibold">{matriculaForm.desconto}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <Select
          label="Forma de Pagamento"
          value={pagamentoForm.forma_pagamento}
          onChange={(e) => setPagamentoForm({ ...pagamentoForm, forma_pagamento: e.target.value })}
          options={[
            { value: 'DINHEIRO', label: 'Dinheiro' },
            { value: 'PIX', label: 'PIX' },
            { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
            { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
            { value: 'BOLETO', label: 'Boleto' },
            { value: 'TRANSFERENCIA', label: 'Transferência Bancária' },
          ]}
        />
        <Input
          label="Observação"
          value={pagamentoForm.observacao}
          onChange={(e) => setPagamentoForm({ ...pagamentoForm, observacao: e.target.value })}
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={() => setCurrentStep(3)}>
          <ChevronLeft size={18} />
          Voltar
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={handleSkipPagamento}>
            Pular (Pagar depois)
          </Button>
          <Button onClick={handlePagarMatricula} isLoading={isSaving}>
            Registrar Pagamento
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStepTurma = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Etapa 5:</strong> Vincule o aluno a uma turma para completar a matrícula.
        </p>
      </div>

      {!alunoVinculado ? (
        <form onSubmit={(e) => { e.preventDefault(); handleVincularTurma(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Ano Letivo"
              value={turmaForm.ano_letivo.toString()}
              onChange={(e) => setTurmaForm({ ...turmaForm, ano_letivo: parseInt(e.target.value) })}
              options={[
                { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
                { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() },
              ]}
            />
            <Select
              label="Turma"
              value={turmaForm.turma_id}
              onChange={(e) => setTurmaForm({ ...turmaForm, turma_id: e.target.value })}
              options={turmasFiltradas.map((t) => ({
                value: t.id,
                label: `${t.nome} - ${t.serie || ''} (${t.turno})`,
              }))}
              placeholder="Selecione uma turma"
              required
            />
          </div>

          {turmasFiltradas.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={18} className="text-amber-600" />
              <p className="text-sm text-amber-700">
                Nenhuma turma ativa encontrada para o ano letivo {turmaForm.ano_letivo}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => setCurrentStep(4)}>
              <ChevronLeft size={18} />
              Voltar
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={!turmaForm.turma_id}>
              Vincular à Turma
              <Check size={18} />
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Resumo da matrícula */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Matrícula Concluída!</h3>
                <p className="text-sm text-green-600">O processo de matrícula foi finalizado com sucesso.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-gray-700">Dados do Aluno</h4>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Nome:</span> {createdAluno?.nome}</p>
                  <p><span className="text-gray-500">Data Nasc.:</span> {new Date(alunoForm.data_nascimento).toLocaleDateString('pt-BR')}</p>
                  {alunoForm.cpf && <p><span className="text-gray-500">CPF:</span> {alunoForm.cpf}</p>}
                  <p><span className="text-gray-500">Matrícula:</span> {(createdAluno as any)?.matricula_numero || (createdAluno as any)?.matriculaNumero || '-'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-gray-700">Dados do Responsável</h4>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Nome:</span> {createdResponsavel?.nome}</p>
                  <p><span className="text-gray-500">CPF:</span> {responsavelForm.cpf || formatCPF(createdResponsavel?.cpf || '')}</p>
                  <p><span className="text-gray-500">Telefone:</span> {responsavelForm.telefone || createdResponsavel?.telefone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-gray-700">Dados da Matrícula</h4>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Ano Letivo:</span> {matriculaForm.ano_letivo}</p>
                  <p><span className="text-gray-500">Plano:</span> {planos.find(p => p.id === matriculaForm.plano_id)?.nome || '-'}</p>
                  <p><span className="text-gray-500">Valor Matrícula:</span> {formatCurrency(currencyToNumber(matriculaForm.valor_matricula))}</p>
                  <p>
                    <span className="text-gray-500">Status Pagamento:</span>{' '}
                    <Badge variant={matriculaPaga ? 'success' : 'warning'}>
                      {matriculaPaga ? 'Pago' : 'Pendente'}
                    </Badge>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="font-semibold text-gray-700">Dados da Turma</h4>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(() => {
                    const turma = turmas.find(t => t.id === turmaForm.turma_id);
                    return turma ? (
                      <>
                        <p><span className="text-gray-500">Turma:</span> {turma.nome}</p>
                        <p><span className="text-gray-500">Série:</span> {turma.serie || '-'}</p>
                        <p><span className="text-gray-500">Turno:</span> {turma.turno}</p>
                        <p><span className="text-gray-500">Ano:</span> {turma.ano}</p>
                      </>
                    ) : <p>-</p>;
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleImprimirFichaCompleta} variant="secondary" className="flex items-center gap-2">
              <Printer size={18} />
              Imprimir Ficha do Aluno
            </Button>
            <Button onClick={handleImprimirTermoMatricula} variant="secondary" className="flex items-center gap-2">
              <Printer size={18} />
              Imprimir Termo de Matrícula
            </Button>
            <Button onClick={handleNovaMatricula} variant="secondary" className="flex items-center gap-2">
              <ArrowRight size={18} />
              Nova Matrícula
            </Button>
            <Button onClick={handleFinalizar} className="flex items-center gap-2">
              <Check size={18} />
              Finalizar e Imprimir
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding de Matrícula</h1>
          <p className="text-gray-500">Processo completo de matrícula de novos alunos</p>
        </div>
      </div>

      {/* Indicador de progresso */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCurrent ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da etapa atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {(() => {
              const CurrentIcon = STEPS[currentStep - 1].icon;
              return <CurrentIcon size={24} className="text-primary-600" />;
            })()}
            <div>
              <h2 className="text-lg font-semibold">{STEPS[currentStep - 1].title}</h2>
              <p className="text-sm text-gray-500">{STEPS[currentStep - 1].description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
