import api from './api';
import { Escola } from '../types';

export const escolaService = {
  async obter(): Promise<Escola> {
    const response = await api.get<Escola>('/escola');
    return response.data;
  },

  async atualizar(data: Partial<Escola>): Promise<Escola> {
    const response = await api.put<Escola>('/escola', data);
    return response.data;
  },
};
