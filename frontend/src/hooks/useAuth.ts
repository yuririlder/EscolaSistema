import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../stores';
import toast from 'react-hot-toast';

interface LoginCredentials {
  email: string;
  senha: string;
}

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setAuth(data.data.token, data.data.usuario);
        toast.success('Login realizado com sucesso!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    toast.success('Logout realizado com sucesso!');
  };
}

export function useCurrentUser() {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data;
    },
    enabled: !!token && isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
