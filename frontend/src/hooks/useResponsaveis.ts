import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface Responsavel {
  id: number;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  profissao?: string;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  filhos?: Array<{ id: number; nome: string }>;
}

export interface CreateResponsavelDTO {
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  profissao?: string;
}

export interface UpdateResponsavelDTO extends Partial<CreateResponsavelDTO> {
  ativo?: boolean;
}

export function useResponsaveis() {
  return useQuery({
    queryKey: ['responsaveis'],
    queryFn: async () => {
      const response = await api.get('/responsaveis');
      return response.data.data as Responsavel[];
    },
  });
}

export function useResponsavel(id: number) {
  return useQuery({
    queryKey: ['responsaveis', id],
    queryFn: async () => {
      const response = await api.get(`/responsaveis/${id}`);
      return response.data.data as Responsavel;
    },
    enabled: !!id,
  });
}

export function useResponsavelComFilhos(id: number) {
  return useQuery({
    queryKey: ['responsaveis', id, 'filhos'],
    queryFn: async () => {
      const response = await api.get(`/responsaveis/${id}/filhos`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateResponsavel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResponsavelDTO) => {
      const response = await api.post('/responsaveis', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsaveis'] });
      toast.success('Responsável criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar responsável');
    },
  });
}

export function useUpdateResponsavel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateResponsavelDTO }) => {
      const response = await api.put(`/responsaveis/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsaveis'] });
      toast.success('Responsável atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar responsável');
    },
  });
}

export function useDeleteResponsavel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/responsaveis/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsaveis'] });
      toast.success('Responsável deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar responsável');
    },
  });
}
