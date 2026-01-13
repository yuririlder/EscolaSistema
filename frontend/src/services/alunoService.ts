import api from './api';
import { Aluno } from '../types';

export const alunoService = {
  async listar(): Promise<Aluno[]> {
    const response = await api.get<Aluno[]>('/alunos');
    return response.data;
  },

  async obterPorId(id: string): Promise<Aluno> {
    const response = await api.get<Aluno>(`/alunos/${id}`);
    return response.data;
  },

  async criar(data: Partial<Aluno>): Promise<Aluno> {
    const response = await api.post<Aluno>('/alunos', data);
    return response.data;
  },

  async atualizar(id: string, data: Partial<Aluno>): Promise<Aluno> {
    const response = await api.put<Aluno>(`/alunos/${id}`, data);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/alunos/${id}`);
  },

  async listarNotas(alunoId: string): Promise<any[]> {
    const response = await api.get(`/alunos/${alunoId}/notas`);
    return response.data;
  },
};
