import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface Aluno {
  id: number;
  nome: string;
  dataNascimento: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  responsavelId: number;
  turmaId?: number;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  responsavel?: {
    id: number;
    nome: string;
  };
  turma?: {
    id: number;
    nome: string;
  };
}

export interface CreateAlunoDTO {
  nome: string;
  dataNascimento: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  responsavelId: number;
  turmaId?: number;
}

export interface UpdateAlunoDTO extends Partial<CreateAlunoDTO> {
  ativo?: boolean;
}

export function useAlunos() {
  return useQuery({
    queryKey: ['alunos'],
    queryFn: async () => {
      const response = await api.get('/alunos');
      return response.data.data as Aluno[];
    },
  });
}

export function useAluno(id: number) {
  return useQuery({
    queryKey: ['alunos', id],
    queryFn: async () => {
      const response = await api.get(`/alunos/${id}`);
      return response.data.data as Aluno;
    },
    enabled: !!id,
  });
}

export function useCreateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAlunoDTO) => {
      const response = await api.post('/alunos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast.success('Aluno criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar aluno');
    },
  });
}

export function useUpdateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAlunoDTO }) => {
      const response = await api.put(`/alunos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast.success('Aluno atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar aluno');
    },
  });
}

export function useDeleteAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/alunos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast.success('Aluno deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar aluno');
    },
  });
}

export function useVincularTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alunoId, turmaId }: { alunoId: number; turmaId: number }) => {
      const response = await api.post(`/alunos/${alunoId}/vincular-turma`, { turmaId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast.success('Aluno vinculado à turma com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao vincular aluno à turma');
    },
  });
}
