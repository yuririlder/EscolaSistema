import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface Turma {
  id: number;
  nome: string;
  ano: number;
  periodo: 'MATUTINO' | 'VESPERTINO' | 'NOTURNO' | 'INTEGRAL';
  serie?: string;
  capacidade: number;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  alunos?: Array<{ id: number; nome: string }>;
  professores?: Array<{ id: number; nome: string }>;
}

export interface CreateTurmaDTO {
  nome: string;
  ano: number;
  periodo: 'MATUTINO' | 'VESPERTINO' | 'NOTURNO' | 'INTEGRAL';
  serie?: string;
  capacidade: number;
}

export interface UpdateTurmaDTO extends Partial<CreateTurmaDTO> {
  ativo?: boolean;
}

export function useTurmas() {
  return useQuery({
    queryKey: ['turmas'],
    queryFn: async () => {
      const response = await api.get('/turmas');
      return response.data.data as Turma[];
    },
  });
}

export function useTurma(id: number) {
  return useQuery({
    queryKey: ['turmas', id],
    queryFn: async () => {
      const response = await api.get(`/turmas/${id}`);
      return response.data.data as Turma;
    },
    enabled: !!id,
  });
}

export function useTurmaComAlunos(id: number) {
  return useQuery({
    queryKey: ['turmas', id, 'alunos'],
    queryFn: async () => {
      const response = await api.get(`/turmas/${id}/alunos`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useTurmaComProfessores(id: number) {
  return useQuery({
    queryKey: ['turmas', id, 'professores'],
    queryFn: async () => {
      const response = await api.get(`/turmas/${id}/professores`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTurmaDTO) => {
      const response = await api.post('/turmas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Turma criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar turma');
    },
  });
}

export function useUpdateTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTurmaDTO }) => {
      const response = await api.put(`/turmas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Turma atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar turma');
    },
  });
}

export function useDeleteTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/turmas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Turma deletada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar turma');
    },
  });
}
