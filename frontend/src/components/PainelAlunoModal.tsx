import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { alunoService } from '../services/alunoService';
import { responsavelService } from '../services/responsavelService';
import { turmaService } from '../services/turmaService';
import { financeiroService } from '../services/financeiroService';
import { escolaService } from '../services/escolaService';
import { Aluno, Mensalidade, Matricula, Responsavel, Turma } from '../types';
import { formatPhone } from '../utils/masks';
import { gerarFichaCompletaAlunoPDF, gerarTermoMatriculaPDF, gerarTermoTransferenciaPDF } from '../utils/pdfGenerator';
import {
  User, Phone, FileText, DollarSign, BookOpen, GraduationCap,
  CheckCircle2, XCircle, Clock, Download, AlertTriangle, Camera, Pencil, Trash2, ExternalLink, FileCheck, Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── helpers ────────────────────────────────────────────────────────────────

const PARENTESCO_LABELS: Record<string, string> = {
  PAI: 'Pai', MAE: 'Mãe', AVO: 'Avó', AVO_M: 'Avô', TIO: 'Tio', TIA: 'Tia',
  AMIGO: 'Amigo(a)', VIZINHO: 'Vizinho(a)', IRMAO: 'Irmão/Irmã',
  PRIMO: 'Primo(a)', CUNHADO: 'Cunhado(a)', OUTRO: 'Outro',
};

const getParentescoLabel = (value: string) => PARENTESCO_LABELS[value] ?? value;

const calcularIdade = (dataNascimento: string | Date | undefined): string => {
  if (!dataNascimento) return '-';
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  if (meses < 0 || (meses === 0 && hoje.getDate() < nasc.getDate())) { anos--; meses += 12; }
  if (hoje.getDate() < nasc.getDate()) { meses--; if (meses < 0) meses += 12; }
  if (anos === 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}${meses > 0 ? ` e ${meses} ${meses === 1 ? 'mês' : 'meses'}` : ''}`;
};

const formatDate = (date: Date | string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

const DOCS = [
  { key: 'doc_certidao_nascimento', label: 'Certidão de Nascimento' },
  { key: 'doc_cpf_aluno',           label: 'CPF da Criança' },
  { key: 'doc_rg_cpf_responsavel',  label: 'RG/CPF Responsável' },
  { key: 'doc_comprovante_residencia', label: 'Comp. Residência' },
  { key: 'doc_cartao_sus',          label: 'Cartão SUS' },
  { key: 'doc_carteira_vacinacao',  label: 'Cart. Vacinação' },
];

// ─── props ───────────────────────────────────────────────────────────────────

interface Props {
  alunoId: string | null;
  onClose: () => void;
  onEdit?: (aluno: Aluno) => void;
  onDelete?: (alunoId: string) => void;
  onChangeTurma?: (aluno: Aluno) => void;
  refreshKey?: number;
}

// ─── component ───────────────────────────────────────────────────────────────

export function PainelAlunoModal({ alunoId, onClose, onEdit, onDelete, onChangeTurma, refreshKey }: Props) {
  const navigate = useNavigate();

  const [isLoading, setIsLoading]       = useState(false);
  const [aluno, setAluno]               = useState<any>(null);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [matricula, setMatricula]       = useState<Matricula | null>(null);
  const [plano, setPlano]               = useState<any>(null);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [turmas, setTurmas]             = useState<Turma[]>([]);
  const [escola, setEscola]             = useState<any>(null);
  const [escolaDestino, setEscolaDestino]                 = useState('');
  const [enderecoEscolaDestino, setEnderecoEscolaDestino] = useState('');
  const [isConfirmDesmatricularOpen, setIsConfirmDesmatricularOpen] = useState(false);
  const [salvandoDestino, setSalvandoDestino]             = useState(false);
  const [editandoDestino, setEditandoDestino]             = useState(false);

  // Limpa estado ao fechar
  useEffect(() => {
    if (!alunoId) {
      setAluno(null);
      setMensalidades([]);
      setMatricula(null);
      setPlano(null);
      return;
    }
    loadData(alunoId);
  }, [alunoId, refreshKey]);

  const loadData = async (id: string) => {
    setIsLoading(true);
    try {
      const [alunoData, resps, turmsData, escolaData, matriculas, mensalidadesData, planos] = await Promise.all([
        alunoService.obterPorId(id),
        responsavelService.listar(),
        turmaService.listar(),
        escolaService.obter().catch(() => null),
        financeiroService.listarMatriculas(),
        financeiroService.listarMensalidades(),
        financeiroService.listarPlanos(),
      ]);

      setAluno(alunoData);
      setResponsaveis(resps);
      setTurmas(turmsData);
      setEscola(escolaData);
      setEscolaDestino(alunoData?.escola_destino || '');
      setEnderecoEscolaDestino(alunoData?.endereco_escola_destino || '');
      setEditandoDestino(!alunoData?.escola_destino);

      const mat = matriculas.find(m => {
        const mx = m as any;
        return (mx.aluno_id || mx.alunoId) === id;
      });
      setMatricula(mat || null);

      if (mat) {
        const mx = mat as any;
        setPlano(planos.find(p => p.id === (mx.plano_id || mx.planoMensalidadeId)) ?? null);
        setMensalidades(mensalidadesData.filter(m => {
          const mens = m as any;
          return (mens.matricula_id || mens.matriculaId) === mat.id;
        }));
      } else {
        setPlano(null);
        setMensalidades([]);
      }
    } catch (err) {
      console.error('Erro ao carregar painel do aluno:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── computed ─────────────────────────────────────────────────────────────

  const mensalidadeStatus = (() => {
    if (!mensalidades.length) return { status: 'sem-matricula', label: 'Sem matrícula', color: 'gray' };
    const atrasadas = mensalidades.filter(m => {
      const s = (m as any).status;
      return s === 'ATRASADO' || s === 'VENCIDA';
    });
    if (atrasadas.length > 0)
      return { status: 'inadimplente', label: `${atrasadas.length} mensalidade(s) em atraso`, color: 'red' };
    return { status: 'em-dia', label: 'Em dia', color: 'green' };
  })();

  const docsEntregues = DOCS.filter(d => aluno?.[d.key]).length;

  const responsavel = responsaveis.find(r =>
    r.id === (aluno?.responsavel_id || aluno?.responsavelId)
  ) as any;

  // ── downloads ────────────────────────────────────────────────────────────

  const handleDownloadFicha = async () => {
    if (!aluno) return;
    try {
      const turma = turmas.find(t => t.id === (aluno.turma_id || aluno.turmaId));
      const contatos = aluno.contatos_emergencia ?? [];
      const mat = matricula as any;
      gerarFichaCompletaAlunoPDF({
        aluno: {
          nome: aluno.nome,
          data_nascimento: aluno.data_nascimento || aluno.dataNascimento,
          cpf: aluno.cpf,
          sexo: aluno.sexo || aluno.genero,
          matricula_numero: aluno.matricula_numero || aluno.matriculaNumero,
          parentesco_responsavel: aluno.parentesco_responsavel,
        },
        responsavel: responsavel ? {
          nome: responsavel.nome, cpf: responsavel.cpf, rg: responsavel.rg,
          data_nascimento: responsavel.data_nascimento || responsavel.dataNascimento,
          email: responsavel.email, telefone: responsavel.telefone, celular: responsavel.celular,
          endereco: responsavel.endereco, bairro: responsavel.bairro, complemento: responsavel.complemento,
          cidade: responsavel.cidade, estado: responsavel.estado, cep: responsavel.cep,
          profissao: responsavel.profissao,
          local_trabalho: responsavel.local_trabalho || responsavel.localTrabalho,
        } : { nome: aluno.responsavel?.nome || aluno.responsavel_nome || '-' },
        contatosEmergencia: contatos.length > 0 ? contatos : undefined,
        saude: {
          possui_alergia: aluno.possui_alergia, alergia_descricao: aluno.alergia_descricao,
          restricao_alimentar: aluno.restricao_alimentar, restricao_alimentar_descricao: aluno.restricao_alimentar_descricao,
          uso_medicamento: aluno.uso_medicamento, medicamento_descricao: aluno.medicamento_descricao,
          necessidade_especial: aluno.necessidade_especial, necessidade_especial_descricao: aluno.necessidade_especial_descricao,
        },
        autorizacoes: {
          autoriza_atividades: aluno.autoriza_atividades,
          autoriza_emergencia: aluno.autoriza_emergencia,
          autoriza_imagem: aluno.autoriza_imagem,
        },
        documentos: {
          doc_certidao_nascimento: aluno.doc_certidao_nascimento, doc_cpf_aluno: aluno.doc_cpf_aluno,
          doc_rg_cpf_responsavel: aluno.doc_rg_cpf_responsavel, doc_comprovante_residencia: aluno.doc_comprovante_residencia,
          doc_cartao_sus: aluno.doc_cartao_sus, doc_carteira_vacinacao: aluno.doc_carteira_vacinacao,
        },
        consideracoes: aluno.consideracoes,
        matricula: mat ? {
          ano_letivo: mat.ano_letivo || mat.anoLetivo,
          data_matricula: mat.data_matricula || mat.dataMatricula,
          valor_matricula: mat.valor_matricula || mat.valorMatricula || 0,
          desconto: mat.desconto || 0,
          status: mat.status,
          pago: true,
        } : undefined,
        turma: turma ? { nome: turma.nome, serie: turma.serie, turno: turma.turno, ano: turma.ano } : undefined,
        plano: plano ? { nome: plano.nome, valor: plano.valor } : undefined,
      }, escola ?? undefined);
    } catch {
      toast.error('Erro ao gerar ficha do aluno');
    }
  };

  const handleDownloadTermo = async () => {
    if (!aluno || !matricula) { toast.error('Dados de matrícula não encontrados'); return; }
    try {
      const turma = turmas.find(t => t.id === (aluno.turma_id || aluno.turmaId));
      const mat = matricula as any;
      gerarTermoMatriculaPDF({
        alunoNome: aluno.nome,
        alunoDataNascimento: aluno.data_nascimento || aluno.dataNascimento,
        responsavelNome: responsavel?.nome,
        responsavelCpf: responsavel?.cpf,
        responsavelTelefone: responsavel?.telefone,
        anoLetivo: mat.ano_letivo || mat.anoLetivo || new Date().getFullYear(),
        planoNome: plano?.nome || 'Não definido',
        valorMensalidade: plano?.valor || 0,
        valorMatricula: mat.valor_matricula || mat.valorMatricula || 0,
        desconto: mat.desconto || 0,
        dataMatricula: new Date(mat.data_matricula || mat.dataMatricula || mat.createdAt).toLocaleDateString('pt-BR'),
        turmaNome: turma?.nome,
      }, escola ?? undefined);
    } catch {
      toast.error('Erro ao gerar termo de matrícula');
    }
  };

  // ── termo de transferência ────────────────────────────────────────────────

  const handleSalvarDestino = async () => {
    if (!aluno) return;
    setSalvandoDestino(true);
    try {
      await alunoService.atualizar(aluno.id, {
        escola_destino: escolaDestino,
        endereco_escola_destino: enderecoEscolaDestino,
      });
      setAluno({ ...aluno, escola_destino: escolaDestino, endereco_escola_destino: enderecoEscolaDestino });
      setEditandoDestino(false);
      toast.success('Dados de destino salvos!');
    } catch {
      toast.error('Erro ao salvar dados de destino');
    } finally {
      setSalvandoDestino(false);
    }
  };

  const camposTransferenciaFaltando = (() => {
    if (!aluno || aluno.ativo !== false) return [];
    const faltando: string[] = [];
    if (!aluno.cpf) faltando.push('CPF do aluno');
    if (!aluno.data_nascimento && !aluno.dataNascimento) faltando.push('Data de nascimento');
    if (!aluno.nome_pai) faltando.push('Nome do pai (editar aluno)');
    if (!aluno.nome_mae) faltando.push('Nome da mãe (editar aluno)');
    if (!escolaDestino) faltando.push('Escola de destino (campo acima)');
    if (!enderecoEscolaDestino) faltando.push('Endereço da escola de destino (campo acima)');
    if (!escola?.nome) faltando.push('Nome da escola (Configurações)');
    if (!escola?.endereco) faltando.push('Endereço da escola (Configurações)');
    if (!escola?.cnpj) faltando.push('CNPJ da escola (Configurações)');
    if (!escola?.email) faltando.push('E-mail da escola (Configurações)');
    return faltando;
  })();

  const handleDownloadTransferencia = () => {
    if (!aluno) return;
    const turma = turmas.find(t => t.id === (aluno.turma_id || aluno.turmaId)) as any;
    const mat = matricula as any;
    try {
      gerarTermoTransferenciaPDF({
        alunoNome: aluno.nome,
        alunoDataNascimento: aluno.data_nascimento || aluno.dataNascimento,
        alunoCpf: aluno.cpf,
        nomePai: aluno.nome_pai,
        nomeMae: aluno.nome_mae,
        serieTurma: turma?.serie || turma?.nome,
        anoLetivo: mat?.ano_letivo || mat?.anoLetivo || turma?.ano,
        escolaDestino: escolaDestino,
        enderecoEscolaDestino: enderecoEscolaDestino,
        dataInicioMatricula: mat?.data_matricula || mat?.dataMatricula,
        dataDesativacao: aluno.data_desativacao,
      }, escola ?? undefined);
    } catch {
      toast.error('Erro ao gerar termo de transferência');
    }
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={!!alunoId}
      onClose={onClose}
      title="Painel do Aluno"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : !aluno ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Aluno não encontrado</div>
      ) : (
        <div className="max-h-[75vh] overflow-y-auto pr-1 space-y-6">

          {/* Foto e nome */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-3 relative group">
              <User size={36} className="text-primary-600" />
              <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={12} className="text-gray-500" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{aluno.nome}</h3>
            <p className="text-sm text-gray-500">
              Matrícula: {aluno.matricula_numero || aluno.matriculaNumero || '-'}
            </p>
          </div>

          {/* Status de mensalidades */}
          <div className={`p-3 rounded-lg border flex items-center gap-3 ${
            mensalidadeStatus.color === 'green' ? 'bg-green-50 border-green-200' :
            mensalidadeStatus.color === 'red'   ? 'bg-red-50 border-red-200' :
                                                  'bg-gray-50 border-gray-200'
          }`}>
            {mensalidadeStatus.color === 'green' ? <CheckCircle2 className="text-green-600 flex-shrink-0" size={22} /> :
             mensalidadeStatus.color === 'red'   ? <AlertTriangle className="text-red-600 flex-shrink-0" size={22} /> :
                                                   <Clock className="text-gray-500 flex-shrink-0" size={22} />}
            <div>
              <p className={`font-semibold text-sm ${
                mensalidadeStatus.color === 'green' ? 'text-green-800' :
                mensalidadeStatus.color === 'red'   ? 'text-red-800' : 'text-gray-700'
              }`}>
                {mensalidadeStatus.status === 'em-dia' ? 'Mensalidades em dia' :
                 mensalidadeStatus.status === 'inadimplente' ? 'Mensalidades em atraso' :
                 'Sem matrícula ativa'}
              </p>
              <p className={`text-xs ${
                mensalidadeStatus.color === 'green' ? 'text-green-600' :
                mensalidadeStatus.color === 'red'   ? 'text-red-600' : 'text-gray-500'
              }`}>{mensalidadeStatus.label}</p>
            </div>
          </div>

          {/* Dados básicos */}
          <section className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <User size={15} /> Dados Básicos
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <Row label="Idade" value={calcularIdade(aluno.data_nascimento || aluno.dataNascimento)} />
              <Row label="Data de Nascimento" value={formatDate(aluno.data_nascimento || aluno.dataNascimento)} />
              <Row label="Turma" value={aluno.turma?.nome || aluno.turma_nome || '-'} />
            </div>
          </section>

          {/* Responsável */}
          <section className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <User size={15} /> Responsável
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <p className="font-medium text-gray-900">{responsavel?.nome || '-'}</p>
              <p className="text-gray-500">{getParentescoLabel(aluno.parentesco_responsavel || '')}</p>
              {responsavel?.telefone && (
                <PhoneLink number={responsavel.telefone} />
              )}
              {responsavel?.celular && responsavel.celular !== responsavel.telefone && (
                <PhoneLink number={responsavel.celular} />
              )}
            </div>
          </section>

          {/* Contatos de emergência */}
          <section className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Phone size={15} /> Contatos de Emergência
            </h4>
            <div className="space-y-2">
              {aluno.contatos_emergencia?.length ? (
                aluno.contatos_emergencia.map((c: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{c.nome}</p>
                      <p className="text-xs text-gray-500">{getParentescoLabel(c.parentesco)}</p>
                    </div>
                    <PhoneLink number={c.telefone} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhum contato cadastrado</p>
              )}
            </div>
          </section>

          {/* Documentos */}
          <section className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <FileCheck size={15} /> Documentos Entregues
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{docsEntregues}/6</span>
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2">
              {DOCS.map(doc => (
                <div key={doc.key} className="flex items-center gap-2 text-sm">
                  {aluno[doc.key]
                    ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                    : <XCircle size={15} className="text-gray-300 flex-shrink-0" />}
                  <span className={aluno[doc.key] ? 'text-gray-700' : 'text-gray-400'}>{doc.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Escola de Destino - somente para inativos */}
          {aluno.ativo === false && (
            <section className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <GraduationCap size={15} className="text-orange-500" /> Escola de Destino (Transferência)
              </h4>
              {!editandoDestino ? (
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <Row label="Escola" value={escolaDestino || '-'} />
                  <Row label="Endereço" value={enderecoEscolaDestino || '-'} />
                  <button
                    onClick={() => setEditandoDestino(true)}
                    className="mt-2 flex items-center gap-1 text-xs text-primary-600 hover:underline"
                  >
                    <Pencil size={12} /> Alterar
                  </button>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nome da escola de destino</label>
                    <input
                      type="text"
                      value={escolaDestino}
                      onChange={(e) => setEscolaDestino(e.target.value)}
                      placeholder="Ex: Escola Municipal José da Silva"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Endereço da escola de destino</label>
                    <input
                      type="text"
                      value={enderecoEscolaDestino}
                      onChange={(e) => setEnderecoEscolaDestino(e.target.value)}
                      placeholder="Ex: Rua das Flores, 123 - Centro"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSalvarDestino}
                      disabled={salvandoDestino}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      <Save size={13} /> {salvandoDestino ? 'Salvando...' : 'Salvar'}
                    </button>
                    {aluno.escola_destino && (
                      <button
                        onClick={() => { setEscolaDestino(aluno.escola_destino); setEnderecoEscolaDestino(aluno.endereco_escola_destino); setEditandoDestino(false); }}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Downloads */}
          <section className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Download size={15} /> Downloads
            </h4>
            <div className="space-y-2">
              <DownloadButton icon={<FileText size={18} className="text-purple-500" />} label="Ficha do Aluno" onClick={handleDownloadFicha} />
              <DownloadButton icon={<FileText size={18} className="text-blue-500" />} label="Termo de Matrícula" onClick={handleDownloadTermo} disabled={!matricula} />
              {aluno.ativo === false && (
                <div className="space-y-1">
                  <DownloadButton
                    icon={<FileText size={18} className="text-orange-500" />}
                    label="Declaração de Transferência"
                    onClick={handleDownloadTransferencia}
                    disabled={camposTransferenciaFaltando.length > 0}
                  />
                  {camposTransferenciaFaltando.length > 0 && (
                    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-medium text-amber-700 mb-1">Dados necessários para o termo:</p>
                      <ul className="space-y-0.5">
                        {camposTransferenciaFaltando.map(campo => (
                          <li key={campo} className="text-xs text-amber-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-amber-500 rounded-full flex-shrink-0" />
                            {campo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Acesso rápido */}
          <section className="space-y-2">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <ExternalLink size={15} /> Acesso Rápido
            </h4>
            <div className={`grid gap-2 grid-cols-4`}>
              <QuickButton color="green"  icon={<DollarSign size={18} />}    label="Mensalidades" onClick={() => navigate('/mensalidades')} />
              <QuickButton color="blue"   icon={<BookOpen size={18} />}      label="Histórico"    onClick={() => navigate(`/alunos/${aluno.id}/historico`)} />
              <QuickButton color="purple" icon={<GraduationCap size={18} />} label="Notas"        onClick={() => navigate('/notas')} />
              {onChangeTurma
                ? <QuickButton color="orange" icon={<GraduationCap size={18} />} label="Turma" onClick={() => onChangeTurma(aluno)} />
                : onEdit && <QuickButton color="gray" icon={<Pencil size={18} />} label="Editar aluno" onClick={() => onEdit(aluno)} />
              }
            </div>
            {onChangeTurma && onEdit && (
              <div className="grid gap-2 grid-cols-4">
                <QuickButton color="gray" icon={<Pencil size={18} />} label="Editar aluno" onClick={() => onEdit(aluno)} />
              </div>
            )}
          </section>

          {/* Ações (somente quando callbacks disponíveis) */}
          {(onEdit || onDelete) && (
            <div className="pt-4 border-t border-gray-200 flex gap-2">
              {onEdit && aluno.ativo !== false && (
                <Button variant="secondary" className="flex-1" onClick={() => onEdit(aluno)}>
                  <Pencil size={15} /> Editar
                </Button>
              )}
              {onDelete && aluno.ativo !== false && (
                <Button variant="danger" className="flex-1" onClick={() => setIsConfirmDesmatricularOpen(true)}>
                  <Trash2 size={15} /> Desmatricular aluno
                </Button>
              )}
            </div>
          )}

        </div>
      )}
      {/* Modal de Confirmação de Desmatrícula */}
      <Modal
        isOpen={isConfirmDesmatricularOpen}
        onClose={() => setIsConfirmDesmatricularOpen(false)}
        title="Confirmar Desmatrícula"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Atenção:</strong> Ao desmatricular o aluno, as seguintes ações serão realizadas:
            </p>
            <ul className="list-disc list-inside text-yellow-700 text-sm mt-2 space-y-1">
              <li>A matrícula será marcada como <strong>CANCELADA</strong></li>
              <li>Mensalidades <strong>vencidas</strong> serão <strong>preservadas</strong> para cobrança</li>
              <li>Mensalidades <strong>futuras</strong> serão <strong>canceladas</strong></li>
              <li>O histórico escolar será <strong>preservado</strong></li>
            </ul>
          </div>

          {aluno && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Aluno:</strong> {aluno.nome}</p>
              {matricula && (
                <p className="text-gray-700">
                  <strong>Ano Letivo:</strong> {(matricula as any).anoLetivo || (matricula as any).ano_letivo}
                </p>
              )}
            </div>
          )}

          <p className="text-gray-600">Deseja realmente desmatricular este aluno?</p>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsConfirmDesmatricularOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setIsConfirmDesmatricularOpen(false);
                if (onDelete && aluno) onDelete(aluno.id);
              }}
            >
              Confirmar Desmatrícula
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function PhoneLink({ number }: { number: string }) {
  return (
    <a href={`tel:${number}`} className="flex items-center gap-1 text-primary-600 hover:underline text-sm">
      <Phone size={13} /> {formatPhone(number)}
    </a>
  );
}

function DownloadButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      <div className="flex items-center gap-3">{icon}<span className="font-medium">{label}</span></div>
      <Download size={15} className="text-gray-400" />
    </button>
  );
}

type QuickColor = 'green' | 'blue' | 'purple' | 'orange' | 'gray';
const colorMap: Record<QuickColor, string> = {
  green:  'bg-green-50 hover:bg-green-100 text-green-600 [&>span]:text-green-800',
  blue:   'bg-blue-50 hover:bg-blue-100 text-blue-600 [&>span]:text-blue-800',
  purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600 [&>span]:text-purple-800',
  orange: 'bg-orange-50 hover:bg-orange-100 text-orange-600 [&>span]:text-orange-800',
  gray:   'bg-gray-100 hover:bg-gray-200 text-gray-600 [&>span]:text-gray-800',
};

function QuickButton({ color, icon, label, onClick }: { color: QuickColor; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-3 rounded-lg transition-colors ${colorMap[color]}`}>
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );
}
