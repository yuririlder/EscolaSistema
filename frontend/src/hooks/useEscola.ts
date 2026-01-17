import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface Escola {
  id: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logo?: string;
  anoLetivo: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface UpdateEscolaDTO {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logo?: string;
  anoLetivo?: number;
}

export function useEscola() {
  return useQuery({
    queryKey: ['escola'],
    queryFn: async () => {
      const response = await api.get('/escola');
      return response.data.data as Escola;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

export function useUpdateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEscolaDTO) => {
      const response = await api.put('/escola', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola'] });
      toast.success('Configurações da escola atualizadas!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar escola');
    },
  });
}
