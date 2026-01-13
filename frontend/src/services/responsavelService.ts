import api from './api';
import { Responsavel } from '../types';

export const responsavelService = {
  async listar(): Promise<Responsavel[]> {
    const response = await api.get<Responsavel[]>('/responsaveis');
    return response.data;
  },

  async obterPorId(id: string): Promise<Responsavel> {
    const response = await api.get<Responsavel>(`/responsaveis/${id}`);
    return response.data;
  },

  async criar(data: Partial<Responsavel>): Promise<Responsavel> {
    const response = await api.post<Responsavel>('/responsaveis', data);
    return response.data;
  },

  async atualizar(id: string, data: Partial<Responsavel>): Promise<Responsavel> {
    const response = await api.put<Responsavel>(`/responsaveis/${id}`, data);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/responsaveis/${id}`);
  },
};
