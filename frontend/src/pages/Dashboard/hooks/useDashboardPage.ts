import { useState, useEffect } from 'react';
import { financeiroService } from '../../../services/financeiroService';
import { DashboardMetrics } from '../../../types';
import { usePainelAluno } from '../../../hooks/usePainelAluno';
import toast from 'react-hot-toast';

const mockMetrics: DashboardMetrics = {
  totalAlunos: 0, totalProfessores: 0, totalTurmas: 0,
  mensalidadesPendentes: 0, receitaMensal: 0, despesaMensal: 0, despesasPendentes: 0,
  alunosPorTurma: [], mensalidadesPorStatus: [],
  receitaVsDespesa: [
    { mes: 'Ago', receita: 0, despesa: 0 }, { mes: 'Set', receita: 0, despesa: 0 },
    { mes: 'Out', receita: 0, despesa: 0 }, { mes: 'Nov', receita: 0, despesa: 0 },
    { mes: 'Dez', receita: 0, despesa: 0 }, { mes: 'Jan', receita: 0, despesa: 0 },
  ],
  inadimplentes: [],
};

export function useDashboardPage() {
  const agora = new Date();
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState(agora.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(agora.getFullYear());
  const { alunoId, openPainel, closePainel } = usePainelAluno();

  useEffect(() => { loadMetrics(); }, [mesSelecionado, anoSelecionado]);

  async function loadMetrics() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await financeiroService.obterMetricasDashboard(mesSelecionado, anoSelecionado);
      if (data) {
        setMetrics({
          ...mockMetrics, ...data,
          alunosPorTurma: data.alunosPorTurma || [],
          mensalidadesPorStatus: data.mensalidadesPorStatus || [],
          receitaVsDespesa: data.receitaVsDespesa || mockMetrics.receitaVsDespesa,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar métricas');
      toast.error('Erro ao carregar métricas do dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    agora, metrics, isLoading, error, mesSelecionado, setMesSelecionado,
    anoSelecionado, setAnoSelecionado, alunoId, openPainel, closePainel, loadMetrics,
  };
}
