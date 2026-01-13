import { useEffect, useState } from 'react';
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

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await financeiroService.obterMetricasDashboard();
      setMetrics(data);
    } catch (error) {
      toast.error('Erro ao carregar métricas');
      // Dados mock para demonstração
      setMetrics({
        totalAlunos: 150,
        totalProfessores: 12,
        totalTurmas: 8,
        mensalidadesPendentes: 23,
        receitaMensal: 45000,
        despesaMensal: 32000,
        alunosPorTurma: [
          { turma: '1º Ano A', quantidade: 25 },
          { turma: '1º Ano B', quantidade: 22 },
          { turma: '2º Ano A', quantidade: 28 },
          { turma: '2º Ano B', quantidade: 24 },
          { turma: '3º Ano A', quantidade: 26 },
        ],
        mensalidadesPorStatus: [
          { status: 'Pago', quantidade: 120 },
          { status: 'Pendente', quantidade: 23 },
          { status: 'Atrasado', quantidade: 7 },
        ],
        receitaVsDespesa: [
          { mes: 'Jan', receita: 42000, despesa: 30000 },
          { mes: 'Fev', receita: 44000, despesa: 31000 },
          { mes: 'Mar', receita: 45000, despesa: 32000 },
          { mes: 'Abr', receita: 43000, despesa: 29000 },
          { mes: 'Mai', receita: 46000, despesa: 33000 },
          { mes: 'Jun', receita: 45000, despesa: 32000 },
        ],
      });
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

  if (!metrics) return null;

  const lucro = metrics.receitaMensal - metrics.despesaMensal;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Alunos por Turma</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.alunosPorTurma}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turma" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Status das Mensalidades</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.mensalidadesPorStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantidade"
                    nameKey="status"
                  >
                    {metrics.mensalidadesPorStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
