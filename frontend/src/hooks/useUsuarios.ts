import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'DIRETOR' | 'SECRETARIO' | 'COORDENADOR';
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: 'DIRETOR' | 'SECRETARIO' | 'COORDENADOR';
}

export interface UpdateUsuarioDTO {
  nome?: string;
  email?: string;
  perfil?: 'DIRETOR' | 'SECRETARIO' | 'COORDENADOR';
  ativo?: boolean;
}

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get('/usuarios');
      return response.data.data as Usuario[];
    },
  });
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: async () => {
      const response = await api.get(`/usuarios/${id}`);
      return response.data.data as Usuario;
    },
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUsuarioDTO) => {
      const response = await api.post('/usuarios', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar usuário');
    },
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUsuarioDTO }) => {
      const response = await api.put(`/usuarios/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuário');
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar usuário');
    },
  });
}

export function useAlterarSenha() {
  return useMutation({
    mutationFn: async ({ id, novaSenha }: { id: number; novaSenha: string }) => {
      const response = await api.patch(`/usuarios/${id}/senha`, { novaSenha });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    },
  });
}
