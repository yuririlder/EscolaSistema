import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

// Planos
export interface PlanoMensalidade {
  id: number;
  nome: string;
  valor: number;
  descricao?: string;
  ativo: boolean;
}

// Matrículas
export interface Matricula {
  id: number;
  alunoId: number;
  planoMensalidadeId: number;
  dataMatricula: string;
  dataInicio: string;
  dataFim?: string;
  valorMatricula: number;
  descontoMensalidade: number;
  status: 'ATIVA' | 'CANCELADA' | 'CONCLUIDA' | 'SUSPENSA';
  aluno?: { id: number; nome: string };
  plano?: { id: number; nome: string; valor: number };
}

// Mensalidades
export interface Mensalidade {
  id: number;
  matriculaId: number;
  mesReferencia: number;
  anoReferencia: number;
  valor: number;
  desconto: number;
  multa: number;
  juros: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  aluno?: { id: number; nome: string };
}

// Despesas
export interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  dataVencimento: string;
  dataPagamento?: string;
  fornecedor?: string;
  pago: boolean;
}

// Dashboard
export interface DashboardFinanceiro {
  receitasMes: number;
  despesasMes: number;
  saldoMes: number;
  inadimplentes: number;
  mensalidadesPendentes: number;
  totalAlunos: number;
  totalMatriculasAtivas: number;
}

// ========================
// PLANOS
// ========================

export function usePlanos() {
  return useQuery({
    queryKey: ['planos'],
    queryFn: async () => {
      const response = await api.get('/financeiro/planos');
      return response.data.data as PlanoMensalidade[];
    },
  });
}

export function useCreatePlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<PlanoMensalidade, 'id' | 'ativo'>) => {
      const response = await api.post('/financeiro/planos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar plano');
    },
  });
}

export function useUpdatePlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PlanoMensalidade> }) => {
      const response = await api.put(`/financeiro/planos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar plano');
    },
  });
}

export function useDeletePlano() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/financeiro/planos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar plano');
    },
  });
}

// ========================
// MATRÍCULAS
// ========================

export function useMatriculas() {
  return useQuery({
    queryKey: ['matriculas'],
    queryFn: async () => {
      const response = await api.get('/financeiro/matriculas');
      return response.data.data as Matricula[];
    },
  });
}

export function useRealizarMatricula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      alunoId: number;
      planoMensalidadeId: number;
      dataInicio: string;
      valorMatricula: number;
      descontoMensalidade?: number;
    }) => {
      const response = await api.post('/financeiro/matriculas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Matrícula realizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao realizar matrícula');
    },
  });
}

export function useCancelarMatricula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/financeiro/matriculas/${id}/cancelar`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
      toast.success('Matrícula cancelada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar matrícula');
    },
  });
}

// ========================
// MENSALIDADES
// ========================

export function useMensalidades(params?: { status?: string; mes?: number; ano?: number }) {
  return useQuery({
    queryKey: ['mensalidades', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.mes) queryParams.append('mes', String(params.mes));
      if (params?.ano) queryParams.append('ano', String(params.ano));
      
      const response = await api.get(`/financeiro/mensalidades?${queryParams}`);
      return response.data.data as Mensalidade[];
    },
  });
}

export function useInadimplentes() {
  return useQuery({
    queryKey: ['mensalidades', 'inadimplentes'],
    queryFn: async () => {
      const response = await api.get('/financeiro/mensalidades/inadimplentes');
      return response.data.data as Mensalidade[];
    },
  });
}

export function usePagarMensalidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/financeiro/mensalidades/${id}/pagar`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Pagamento registrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    },
  });
}

// ========================
// DESPESAS
// ========================

export function useDespesas(params?: { categoria?: string; mes?: number; ano?: number }) {
  return useQuery({
    queryKey: ['despesas', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.mes) queryParams.append('mes', String(params.mes));
      if (params?.ano) queryParams.append('ano', String(params.ano));
      
      const response = await api.get(`/financeiro/despesas?${queryParams}`);
      return response.data.data as Despesa[];
    },
  });
}

export function useCreateDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Despesa, 'id' | 'pago' | 'dataPagamento'>) => {
      const response = await api.post('/financeiro/despesas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Despesa criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar despesa');
    },
  });
}

export function useUpdateDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Despesa> }) => {
      const response = await api.put(`/financeiro/despesas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast.success('Despesa atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar despesa');
    },
  });
}

export function usePagarDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/financeiro/despesas/${id}/pagar`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Despesa paga com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao pagar despesa');
    },
  });
}

export function useDeleteDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/financeiro/despesas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast.success('Despesa deletada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar despesa');
    },
  });
}

// ========================
// DASHBOARD
// ========================

export function useDashboardFinanceiro() {
  return useQuery({
    queryKey: ['dashboard', 'financeiro'],
    queryFn: async () => {
      const response = await api.get('/financeiro/dashboard');
      return response.data.data as DashboardFinanceiro;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useHistoricoAnual(ano: number) {
  return useQuery({
    queryKey: ['dashboard', 'historico', ano],
    queryFn: async () => {
      const response = await api.get(`/financeiro/dashboard/historico/${ano}`);
      return response.data.data;
    },
    enabled: !!ano,
  });
}
