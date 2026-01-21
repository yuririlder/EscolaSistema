import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { financeiroService } from '../services/financeiroService';
import { DashboardMetrics } from '../types';
import {
  Users2,
  GraduationCap,
  BookOpen,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Wallet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

// Dados mock para fallback
const mockMetrics: DashboardMetrics = {
  totalAlunos: 0,
  totalProfessores: 0,
  totalTurmas: 0,
  mensalidadesPendentes: 0,
  receitaMensal: 0,
  despesaMensal: 0,
  despesasPendentes: 0,
  alunosPorTurma: [],
  mensalidadesPorStatus: [],
  receitaVsDespesa: [
    { mes: 'Ago', receita: 0, despesa: 0 },
    { mes: 'Set', receita: 0, despesa: 0 },
    { mes: 'Out', receita: 0, despesa: 0 },
    { mes: 'Nov', receita: 0, despesa: 0 },
    { mes: 'Dez', receita: 0, despesa: 0 },
    { mes: 'Jan', receita: 0, despesa: 0 },
  ],
  inadimplentes: [],
};

export function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setError(null);
      const data = await financeiroService.obterMetricasDashboard();
      if (data) {
        setMetrics({
          ...mockMetrics,
          ...data,
          alunosPorTurma: data.alunosPorTurma || [],
          mensalidadesPorStatus: data.mensalidadesPorStatus || [],
          receitaVsDespesa: data.receitaVsDespesa || mockMetrics.receitaVsDespesa,
        });
      }
    } catch (err: any) {
      console.error('Erro ao carregar métricas:', err);
      setError(err.message || 'Erro ao carregar métricas');
      toast.error('Erro ao carregar métricas do dashboard');
    } finally {
      setIsLoading(false);
    }
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadMetrics}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const lucro = metrics.receitaMensal - metrics.despesaMensal;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {/* Botão de acesso rápido para Nova Matrícula */}
        <button
          onClick={() => navigate('/onboarding-matricula')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
        >
          <UserPlus size={20} />
          <span className="font-medium">Nova Matrícula</span>
        </button>
      </div>

      {/* Card de Acesso Rápido - Nova Matrícula */}
      <div 
        className="bg-gradient-to-r from-primary-500 to-primary-700 text-white cursor-pointer hover:from-primary-600 hover:to-primary-800 transition-all rounded-xl shadow-lg"
        onClick={() => navigate('/onboarding-matricula')}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-xl">
              <UserPlus size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Onboarding de Matrícula</h2>
              <p className="text-primary-100">
                Cadastre novos alunos em um processo guiado passo a passo
              </p>
            </div>
          </div>
          <div className="text-5xl font-bold opacity-50">→</div>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users2 size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Alunos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalAlunos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Professores</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalProfessores}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Turmas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalTurmas}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mensalidades Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.mensalidadesPendentes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Receita Mensal</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.receitaMensal)}
              </p>
            </div>
            <TrendingUp size={32} className="text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Despesa Mensal</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(metrics.despesaMensal)}
              </p>
            </div>
            <TrendingDown size={32} className="text-red-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resultado</p>
              <p className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(lucro)}
              </p>
            </div>
            {lucro >= 0 ? (
              <TrendingUp size={32} className="text-green-500" />
            ) : (
              <TrendingDown size={32} className="text-red-500" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Despesas Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(metrics.despesasPendentes)}
              </p>
            </div>
            <Wallet size={32} className="text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Alunos por Turma</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80 overflow-auto">
              {metrics.alunosPorTurma.length > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 mb-2">
                    <span className="font-semibold text-gray-600 text-sm uppercase">Série</span>
                    <span className="font-semibold text-gray-600 text-sm uppercase">Alunos</span>
                  </div>
                  <ul className="space-y-3">
                    {metrics.alunosPorTurma.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-700">{item.turma}</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                          {item.quantidade}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Nenhuma turma cadastrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Lista de Inadimplentes</h2>
          </CardHeader>
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
                      <li
                        key={index}
                        className="grid grid-cols-3 gap-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <span className="font-medium text-gray-700 truncate" title={item.alunoNome}>
                          {item.alunoNome}
                        </span>
                        <span className="text-gray-600 truncate" title={item.responsavelTelefone}>
                          {item.responsavelTelefone}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold text-right text-sm">
                          {formatCurrency(item.totalDivida)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Nenhum aluno inadimplente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Receita vs Despesa</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.receitaVsDespesa}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Receita"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesa"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Despesa"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
