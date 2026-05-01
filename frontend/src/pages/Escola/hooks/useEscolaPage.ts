import { useState } from 'react';
import { escolaService } from '../../../services/escolaService';
import { Escola } from '../../../types';
import toast from 'react-hot-toast';

interface EscolaFormData {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
}

const initialForm: EscolaFormData = {
  nome: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
};

export function useEscolaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EscolaFormData>(initialForm);

  async function loadEscola() {
    try {
      const data: Escola = await escolaService.obter();
      setFormData({
        nome: data.nome,
        cnpj: data.cnpj,
        endereco: data.endereco,
        telefone: data.telefone,
        email: data.email,
      });
    } catch {
      toast.error('Erro ao carregar dados da escola');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await escolaService.atualizar(formData);
      toast.success('Dados atualizados com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar dados');
    } finally {
      setIsSaving(false);
    }
  }

  return { isLoading, isSaving, formData, setFormData, loadEscola, handleSubmit };
}
