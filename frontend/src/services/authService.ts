import api from './api';
import { LoginDTO, AuthResponse } from '../types';

export const authService = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async me(): Promise<AuthResponse['usuario']> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },
};
