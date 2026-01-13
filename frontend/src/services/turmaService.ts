import api from './api';
import { Turma } from '../types';

export const turmaService = {
  async listar(): Promise<Turma[]> {
    const response = await api.get<Turma[]>('/turmas');
    return response.data;
  },

  async obterPorId(id: string): Promise<Turma> {
    const response = await api.get<Turma>(`/turmas/${id}`);
    return response.data;
  },

  async criar(data: Partial<Turma>): Promise<Turma> {
    const response = await api.post<Turma>('/turmas', data);
    return response.data;
  },

  async atualizar(id: string, data: Partial<Turma>): Promise<Turma> {
    const response = await api.put<Turma>(`/turmas/${id}`, data);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/turmas/${id}`);
  },

  async vincularProfessor(turmaId: string, professorId: string): Promise<void> {
    await api.post(`/turmas/${turmaId}/professores/${professorId}`);
  },

  async desvincularProfessor(turmaId: string, professorId: string): Promise<void> {
    await api.delete(`/turmas/${turmaId}/professores/${professorId}`);
  },
};
