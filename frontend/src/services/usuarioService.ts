import api from './api';
import { Usuario } from '../types';

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/usuarios');
    return response.data;
  },

  async obterPorId(id: string): Promise<Usuario> {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  async criar(data: Partial<Usuario> & { senha: string }): Promise<Usuario> {
    const response = await api.post<Usuario>('/usuarios', data);
    return response.data;
  },

  async atualizar(id: string, data: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};
