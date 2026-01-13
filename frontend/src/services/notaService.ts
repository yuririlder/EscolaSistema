import api from './api';
import { Nota } from '../types';

export const notaService = {
  async listar(): Promise<Nota[]> {
    const response = await api.get<Nota[]>('/notas');
    return response.data;
  },

  async obterPorId(id: string): Promise<Nota> {
    const response = await api.get<Nota>(`/notas/${id}`);
    return response.data;
  },

  async criar(data: Partial<Nota>): Promise<Nota> {
    const response = await api.post<Nota>('/notas', data);
    return response.data;
  },

  async atualizar(id: string, data: Partial<Nota>): Promise<Nota> {
    const response = await api.put<Nota>(`/notas/${id}`, data);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/notas/${id}`);
  },

  async listarPorAluno(alunoId: string): Promise<Nota[]> {
    const response = await api.get<Nota[]>(`/notas/aluno/${alunoId}`);
    return response.data;
  },
};
