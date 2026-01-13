import api from './api';
import { Professor } from '../types';

export const professorService = {
  async listar(): Promise<Professor[]> {
    const response = await api.get<Professor[]>('/professores');
    return response.data;
  },

  async obterPorId(id: string): Promise<Professor> {
    const response = await api.get<Professor>(`/professores/${id}`);
    return response.data;
  },

  async criar(data: Partial<Professor>): Promise<Professor> {
    const response = await api.post<Professor>('/professores', data);
    return response.data;
  },

  async atualizar(id: string, data: Partial<Professor>): Promise<Professor> {
    const response = await api.put<Professor>(`/professores/${id}`, data);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/professores/${id}`);
  },
};
