import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface Nota {
  id: number;
  alunoId: number;
  disciplina: string;
  bimestre: 1 | 2 | 3 | 4;
  ano: number;
  nota: number;
  criadoEm?: string;
  atualizadoEm?: string;
  aluno?: {
    id: number;
    nome: string;
  };
}

export interface Boletim {
  aluno: {
    id: number;
    nome: string;
  };
  notas: {
    disciplina: string;
    bimestres: {
      bimestre: number;
      nota: number;
    }[];
    media: number;
  }[];
  mediaGeral: number;
}

export interface CreateNotaDTO {
  alunoId: number;
  disciplina: string;
  bimestre: 1 | 2 | 3 | 4;
  ano: number;
  nota: number;
}

export interface UpdateNotaDTO {
  disciplina?: string;
  bimestre?: 1 | 2 | 3 | 4;
  ano?: number;
  nota?: number;
}

export function useNotas() {
  return useQuery({
    queryKey: ['notas'],
    queryFn: async () => {
      const response = await api.get('/notas');
      return response.data.data as Nota[];
    },
  });
}

export function useNotasPorAluno(alunoId: number) {
  return useQuery({
    queryKey: ['notas', 'aluno', alunoId],
    queryFn: async () => {
      const response = await api.get(`/notas/aluno/${alunoId}`);
      return response.data.data as Nota[];
    },
    enabled: !!alunoId,
  });
}

export function useNotasPorTurma(turmaId: number) {
  return useQuery({
    queryKey: ['notas', 'turma', turmaId],
    queryFn: async () => {
      const response = await api.get(`/notas/turma/${turmaId}`);
      return response.data.data as Nota[];
    },
    enabled: !!turmaId,
  });
}

export function useBoletim(alunoId: number, ano?: number) {
  return useQuery({
    queryKey: ['boletim', alunoId, ano],
    queryFn: async () => {
      const params = ano ? `?ano=${ano}` : '';
      const response = await api.get(`/notas/aluno/${alunoId}/boletim${params}`);
      return response.data.data as Boletim;
    },
    enabled: !!alunoId,
  });
}

export function useCreateNota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNotaDTO) => {
      const response = await api.post('/notas', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      queryClient.invalidateQueries({ queryKey: ['notas', 'aluno', variables.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['boletim', variables.alunoId] });
      toast.success('Nota lançada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao lançar nota');
    },
  });
}

export function useUpdateNota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateNotaDTO }) => {
      const response = await api.put(`/notas/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      toast.success('Nota atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar nota');
    },
  });
}

export function useDeleteNota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/notas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      toast.success('Nota deletada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar nota');
    },
  });
}
