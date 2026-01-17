import api from './api';

export interface HistoricoEscolar {
  id: string;
  aluno_id: string;
  turma_id: string;
  ano_letivo: number;
  status: 'CURSANDO' | 'APROVADO' | 'REPROVADO' | 'TRANSFERIDO' | 'CANCELADO';
  data_entrada: string;
  data_saida?: string;
  observacoes?: string;
  turma_nome?: string;
  turma_serie?: string;
  turma_turno?: string;
  aluno_nome?: string;
  notas?: any[];
  professores?: any[];
}

export interface VincularAlunoTurmaDTO {
  aluno_id: string;
  turma_id: string;
  ano_letivo: number;
  observacoes?: string;
}

export const historicoEscolarService = {
  async listar(anoLetivo?: number): Promise<HistoricoEscolar[]> {
    const params = anoLetivo ? { ano_letivo: anoLetivo } : {};
    const response = await api.get<HistoricoEscolar[]>('/historico-escolar', { params });
    return response.data;
  },

  async buscarPorId(id: string): Promise<HistoricoEscolar> {
    const response = await api.get<HistoricoEscolar>(`/historico-escolar/${id}`);
    return response.data;
  },

  async buscarHistoricoAluno(alunoId: string): Promise<HistoricoEscolar[]> {
    const response = await api.get<HistoricoEscolar[]>(`/historico-escolar/aluno/${alunoId}`);
    return response.data;
  },

  async buscarVinculoAtual(alunoId: string): Promise<HistoricoEscolar | null> {
    const response = await api.get<HistoricoEscolar>(`/historico-escolar/aluno/${alunoId}/atual`);
    return response.data;
  },

  async listarAlunosPorTurmaAno(turmaId: string, anoLetivo: number): Promise<HistoricoEscolar[]> {
    const response = await api.get<HistoricoEscolar[]>(`/historico-escolar/turma/${turmaId}/ano/${anoLetivo}`);
    return response.data;
  },

  async vincularAlunoTurma(data: VincularAlunoTurmaDTO): Promise<HistoricoEscolar> {
    const response = await api.post<HistoricoEscolar>('/historico-escolar', data);
    return response.data;
  },

  async atualizarStatus(id: string, status: string, observacoes?: string): Promise<HistoricoEscolar> {
    const response = await api.patch<HistoricoEscolar>(`/historico-escolar/${id}/status`, { status, observacoes });
    return response.data;
  },

  async desvincularAlunoTurma(alunoId: string, anoLetivo: number): Promise<void> {
    await api.delete(`/historico-escolar/aluno/${alunoId}/ano/${anoLetivo}`);
  },
};
