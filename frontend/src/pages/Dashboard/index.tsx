import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { PainelAlunoModal } from '../../components/PainelAlunoModal';
import { formatCurrency } from '../../utils/masks';
import { NOMES_MESES } from '../../utils/constants';
import {
  Users2, GraduationCap, BookOpen, AlertCircle, TrendingUp, TrendingDown,
  UserPlus, Wallet, Sun, Sunset, Clock,
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { useDashboardPage } from './hooks/useDashboardPage';

const Skeleton = () => <div className="animate-pulse bg-gray-200 rounded h-7 w-16" />;

export function Dashboard() {
  const navigate = useNavigate();
  const {
    agora, metrics, isLoading, error, mesSelecionado, setMesSelecionado,
    anoSelecionado, setAnoSelecionado, alunoId, openPainel, closePainel, loadMetrics,
  } = useDashboardPage();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
        <button onClick={loadMetrics} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
          Tentar novamente
        </button>
      </div>
    );
  }

  const lucro = metrics.receitaMensal - metrics.despesaMensal;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => navigate('/onboarding-matricula')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            <UserPlus size={20} />
            <span className="font-medium">Nova Matrícula</span>
          </button>
        </div>

        <div
          className="bg-gradient-to-r from-primary-500 to-primary-700 text-white cursor-pointer hover:from-primary-600 hover:to-primary-800 transition-all rounded-xl shadow-lg"
          onClick={() => navigate('/onboarding-matricula')}
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-xl"><UserPlus size={32} /></div>
              <div>
                <h2 className="text-xl font-bold">Onboarding de Matrícula</h2>
                <p className="text-primary-100">Cadastre novos alunos em um processo guiado passo a passo</p>
              </div>
            </div>
            <div className="text-5xl font-bold opacity-50">→</div>
          </div>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card><CardContent className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><Users2 size={24} className="text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total de Alunos</p>{isLoading ? <Skeleton /> : <p className="text-2xl font-bold text-gray-900">{metrics.totalAlunos}</p>}</div>
          </CardContent></Card>

          <Card><CardContent className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><GraduationCap size={24} className="text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Professores</p>{isLoading ? <Skeleton /> : <p className="text-2xl font-bold text-gray-900">{metrics.totalProfessores}</p>}</div>
          </CardContent></Card>

          <Card><CardContent className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg"><BookOpen size={24} className="text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Turmas Ativas</p>{isLoading ? <Skeleton /> : <p className="text-2xl font-bold text-gray-900">{metrics.totalTurmas}</p>}</div>
          </CardContent></Card>

          <Card><CardContent className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg"><AlertCircle size={24} className="text-orange-600" /></div>
            <div><p className="text-sm text-gray-500">Mensalidades Pendentes</p>{isLoading ? <Skeleton /> : <p className="text-2xl font-bold text-gray-900">{metrics.mensalidadesPendentes}</p>}</div>
          </CardContent></Card>
        </div>

        {/* Alunos por período */}
        {(() => {
          const porPeriodo = (turno: string) => metrics.alunosPorTurma.filter((t) => t.turno === turno).reduce((acc, t) => acc + t.quantidade, 0);
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card><CardContent className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg"><Sun size={24} className="text-yellow-600" /></div>
                <div><p className="text-sm text-gray-500">Alunos Matutino</p>{isLoading ? <Skeleton /> : <p className="text-2xl font-bold text-gray-900">{porPeriodo('MATUTINO')}</p>}</div>
              </CardContent></Card>
              <Card><CardContent className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg"><Sunset size={24} className="text-indigo-600" /></div>
                <div><p className="text-sm text-gray-500">Alunos Vespertino</p>{isLoading ? <Skeleton /> : <p className="text-2xl font-bold text-gray-900">{porPeriodo('VESPERTINO')}</p>}</div>
              </CardContent></Card>
              <Card><CardContent className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-lg"><Clock size={24} className="text-teal-600" /></div>
                <div><p className="text-sm text-gray-500">Alunos Integral</p>{isLoading ? <Skeleton /> : <p className="text-2xl font-bold text-gray-900">{porPeriodo('INTEGRAL')}</p>}</div>
              </CardContent></Card>
            </div>
          );
        })()}

        {/* Financeiro do Mês */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Financeiro do Mês</h2>
            <div className="flex items-center gap-2">
              <select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))} className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
                {NOMES_MESES.map((nome, i) => <option key={i + 1} value={i + 1}>{nome}</option>)}
              </select>
              <select value={anoSelecionado} onChange={(e) => setAnoSelecionado(Number(e.target.value))} className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
                {Array.from({ length: 5 }, (_, i) => agora.getFullYear() - 2 + i).map((ano) => <option key={ano} value={ano}>{ano}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card><CardContent className="flex items-center justify-between py-3 px-4">
              <div><p className="text-xs text-gray-500">Receita</p>{isLoading ? <Skeleton /> : <p className="text-lg font-bold text-green-600">{formatCurrency(metrics.receitaMensal)}</p>}</div>
              <TrendingUp size={24} className="text-green-500" />
            </CardContent></Card>
            <Card><CardContent className="flex items-center justify-between py-3 px-4">
              <div><p className="text-xs text-gray-500">Despesa</p>{isLoading ? <Skeleton /> : <p className="text-lg font-bold text-red-600">{formatCurrency(metrics.despesaMensal)}</p>}</div>
              <TrendingDown size={24} className="text-red-500" />
            </CardContent></Card>
            <Card><CardContent className="flex items-center justify-between py-3 px-4">
              <div><p className="text-xs text-gray-500">Resultado</p>{isLoading ? <Skeleton /> : <p className={`text-lg font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(lucro)}</p>}</div>
              {lucro >= 0 ? <TrendingUp size={24} className="text-green-500" /> : <TrendingDown size={24} className="text-red-500" />}
            </CardContent></Card>
            <Card><CardContent className="flex items-center justify-between py-3 px-4">
              <div><p className="text-xs text-gray-500">Pendente</p>{isLoading ? <Skeleton /> : <p className="text-lg font-bold text-orange-600">{formatCurrency(metrics.despesasPendentes)}</p>}</div>
              <Wallet size={24} className="text-orange-500" />
            </CardContent></Card>
            <Card><CardContent className="flex items-center justify-between py-3 px-4">
              <div><p className="text-xs text-gray-500">Projeção</p>{isLoading ? <Skeleton /> : <p className={`text-lg font-bold ${(lucro - metrics.despesasPendentes) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(lucro - metrics.despesasPendentes)}</p>}</div>
              {(lucro - metrics.despesasPendentes) >= 0 ? <TrendingUp size={24} className="text-blue-500" /> : <TrendingDown size={24} className="text-red-500" />}
            </CardContent></Card>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900">Alunos por Turma</h2></CardHeader>
            <CardContent>
              <div className="h-80 overflow-auto">
                {metrics.alunosPorTurma.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 p-3 border-b border-gray-200 mb-2">
                      <span className="font-semibold text-gray-600 text-sm uppercase">Série</span>
                      <span className="font-semibold text-gray-600 text-sm uppercase">Turno</span>
                      <span className="font-semibold text-gray-600 text-sm uppercase text-right">Alunos</span>
                    </div>
                    <ul className="space-y-3">
                      {metrics.alunosPorTurma.map((item, index) => (
                        <li key={index} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-gray-700">{item.serie}</span>
                          <span className="text-gray-600">{item.turno}</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-center w-fit ml-auto">{item.quantidade}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Nenhuma turma com alunos</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900">Lista de Inadimplentes</h2></CardHeader>
            <CardContent>
              <div className="h-80 overflow-auto">
                {metrics.inadimplentes && metrics.inadimplentes.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 p-3 border-b border-gray-200 mb-2">
                      <span className="font-semibold text-gray-600 text-sm uppercase">Aluno</span>
                      <span className="font-semibold text-gray-600 text-sm uppercase">Telefone</span>
                      <span className="font-semibold text-gray-600 text-sm uppercase text-right">Dívida</span>
                    </div>
                    <ul className="space-y-2">
                      {metrics.inadimplentes.map((item, index) => (
                        <li key={index} onClick={() => item.alunoId && openPainel(item.alunoId)} className="grid grid-cols-3 gap-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-700 truncate" title={item.alunoNome}>{item.alunoNome}</span>
                            {item.responsavelNome && item.responsavelNome !== 'Não informado' && <span className="text-xs text-gray-400 truncate" title={item.responsavelNome}>{item.responsavelNome}</span>}
                          </div>
                          <span className="text-gray-600 truncate" title={item.responsavelTelefone}>{item.responsavelTelefone}</span>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold text-right text-sm">{formatCurrency(item.totalDivida)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Nenhum aluno inadimplente</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><h2 className="text-lg font-semibold text-gray-900">Receita vs Despesa</h2></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.receitaVsDespesa}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={2} name="Receita" />
                    <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} name="Despesa" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PainelAlunoModal alunoId={alunoId} onClose={closePainel} />
    </>
  );
}
