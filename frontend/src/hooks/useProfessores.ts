import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface Professor {
  id: number;
  funcionarioId: number;
  especialidade?: string;
  formacao?: string;
  registro?: string;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  funcionario?: {
    id: number;
    nome: string;
    cpf: string;
    email?: string;
    telefone?: string;
  };
  turmas?: Array<{ id: number; nome: string }>;
}

export interface CreateProfessorDTO {
  nome: string;
  cpf: string;
  dataNascimento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  salario: number;
  dataContratacao: string;
  especialidade?: string;
  formacao?: string;
  registro?: string;
}

export interface UpdateProfessorDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  salario?: number;
  especialidade?: string;
  formacao?: string;
  registro?: string;
  ativo?: boolean;
}

export function useProfessores() {
  return useQuery({
    queryKey: ['professores'],
    queryFn: async () => {
      const response = await api.get('/professores');
      return response.data.data as Professor[];
    },
  });
}

export function useProfessor(id: number) {
  return useQuery({
    queryKey: ['professores', id],
    queryFn: async () => {
      const response = await api.get(`/professores/${id}`);
      return response.data.data as Professor;
    },
    enabled: !!id,
  });
}

export function useCreateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProfessorDTO) => {
      const response = await api.post('/professores', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar professor');
    },
  });
}

export function useUpdateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProfessorDTO }) => {
      const response = await api.put(`/professores/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar professor');
    },
  });
}

export function useDeleteProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/professores/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar professor');
    },
  });
}

export function useVincularProfessorTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ professorId, turmaId }: { professorId: number; turmaId: number }) => {
      const response = await api.post(`/professores/${professorId}/vincular-turma`, { turmaId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Professor vinculado à turma com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao vincular professor à turma');
    },
  });
}
