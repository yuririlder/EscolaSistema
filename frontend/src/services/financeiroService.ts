import api from './api';
import { PlanoMensalidade, Matricula, Mensalidade, Despesa, PagamentoFuncionario, DashboardMetrics } from '../types';

export const financeiroService = {
  // Planos de Mensalidade
  async listarPlanos(): Promise<PlanoMensalidade[]> {
    const response = await api.get<PlanoMensalidade[]>('/financeiro/planos');
    return response.data;
  },

  async criarPlano(data: Partial<PlanoMensalidade>): Promise<PlanoMensalidade> {
    const response = await api.post<PlanoMensalidade>('/financeiro/planos', data);
    return response.data;
  },

  async atualizarPlano(id: string, data: Partial<PlanoMensalidade>): Promise<PlanoMensalidade> {
    const response = await api.put<PlanoMensalidade>(`/financeiro/planos/${id}`, data);
    return response.data;
  },

  async excluirPlano(id: string): Promise<void> {
    await api.delete(`/financeiro/planos/${id}`);
  },

  // Matrículas
  async listarMatriculas(): Promise<Matricula[]> {
    const response = await api.get<Matricula[]>('/financeiro/matriculas');
    return response.data;
  },

  async criarMatricula(data: Partial<Matricula>): Promise<Matricula> {
    const response = await api.post<Matricula>('/financeiro/matriculas', data);
    return response.data;
  },

  async atualizarMatricula(id: string, data: Partial<Matricula>): Promise<Matricula> {
    const response = await api.put<Matricula>(`/financeiro/matriculas/${id}`, data);
    return response.data;
  },

  // Mensalidades
  async listarMensalidades(): Promise<Mensalidade[]> {
    const response = await api.get<Mensalidade[]>('/financeiro/mensalidades');
    return response.data;
  },

  async gerarMensalidades(matriculaId: string, ano: number): Promise<Mensalidade[]> {
    const response = await api.post<Mensalidade[]>('/financeiro/mensalidades/gerar', {
      matriculaId,
      ano,
    });
    return response.data;
  },

  async pagarMensalidade(id: string, data: { formaPagamento: string }): Promise<Mensalidade> {
    const response = await api.post<Mensalidade>(`/financeiro/mensalidades/${id}/pagar`, data);
    return response.data;
  },

  // Despesas
  async listarDespesas(): Promise<Despesa[]> {
    const response = await api.get<Despesa[]>('/financeiro/despesas');
    return response.data;
  },

  async criarDespesa(data: Partial<Despesa>): Promise<Despesa> {
    const response = await api.post<Despesa>('/financeiro/despesas', data);
    return response.data;
  },

  async atualizarDespesa(id: string, data: Partial<Despesa>): Promise<Despesa> {
    const response = await api.put<Despesa>(`/financeiro/despesas/${id}`, data);
    return response.data;
  },

  async pagarDespesa(id: string, data?: { forma_pagamento: string }): Promise<Despesa> {
    const response = await api.post<Despesa>(`/financeiro/despesas/${id}/pagar`, data || {});
    return response.data;
  },

  async excluirDespesa(id: string): Promise<void> {
    await api.delete(`/financeiro/despesas/${id}`);
  },

  // Pagamentos de Funcionários
  async listarPagamentosFuncionarios(): Promise<PagamentoFuncionario[]> {
    const response = await api.get<PagamentoFuncionario[]>('/financeiro/pagamentos-funcionarios');
    return response.data;
  },

  async criarPagamentoFuncionario(data: Partial<PagamentoFuncionario>): Promise<PagamentoFuncionario> {
    const response = await api.post<PagamentoFuncionario>('/financeiro/pagamentos-funcionarios', data);
    return response.data;
  },

  async pagarFuncionario(id: string, data?: { forma_pagamento: string }): Promise<PagamentoFuncionario> {
    const response = await api.post<PagamentoFuncionario>(`/financeiro/pagamentos-funcionarios/${id}/pagar`, data || {});
    return response.data;
  },

  // Dashboard
  async obterMetricasDashboard(): Promise<DashboardMetrics> {
    const response = await api.get<DashboardMetrics>('/financeiro/dashboard');
    return response.data;
  },
};
