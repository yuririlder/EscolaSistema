import { useState } from 'react';
import { Responsavel } from '../../../types';
import { responsavelService } from '../../../services/responsavelService';
import { formatCPF, formatPhone, removeMask } from '../../../utils/masks';
import toast from 'react-hot-toast';

interface ResponsavelFormData {
  nome: string; cpf: string; rg: string; data_nascimento: string;
  email: string; telefone: string; celular: string; endereco: string;
  bairro: string; complemento: string; cidade: string; estado: string;
  cep: string; profissao: string; local_trabalho: string; observacoes: string;
}

const initialForm: ResponsavelFormData = {
  nome: '', cpf: '', rg: '', data_nascimento: '', email: '', telefone: '', celular: '',
  endereco: '', bairro: '', complemento: '', cidade: '', estado: '', cep: '',
  profissao: '', local_trabalho: '', observacoes: '',
};

export function useResponsaveisPage() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponsavel, setEditingResponsavel] = useState<Responsavel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ResponsavelFormData>(initialForm);

  async function loadResponsaveis() {
    try {
      const data = await responsavelService.listar();
      setResponsaveis(data);
    } catch {
      toast.error('Erro ao carregar responsáveis');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(responsavel?: Responsavel) {
    if (responsavel) {
      setEditingResponsavel(responsavel);
      const r = responsavel as any;
      setFormData({
        nome: responsavel.nome,
        cpf: formatCPF(responsavel.cpf),
        rg: r.rg || '',
        data_nascimento: r.data_nascimento ? new Date(r.data_nascimento).toISOString().split('T')[0] : '',
        email: responsavel.email || '',
        telefone: formatPhone(responsavel.telefone),
        celular: formatPhone(r.celular || ''),
        endereco: responsavel.endereco || '',
        bairro: r.bairro || '',
        complemento: r.complemento || '',
        cidade: r.cidade || '',
        estado: r.estado || '',
        cep: r.cep || '',
        profissao: responsavel.profissao || '',
        local_trabalho: r.local_trabalho || '',
        observacoes: r.observacoes || '',
      });
    } else {
      setEditingResponsavel(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingResponsavel(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      ...formData,
      cpf: removeMask(formData.cpf),
      telefone: removeMask(formData.telefone),
      celular: removeMask(formData.celular),
      cep: removeMask(formData.cep),
    };
    try {
      if (editingResponsavel) {
        await responsavelService.atualizar(editingResponsavel.id, payload);
        toast.success('Responsável atualizado com sucesso!');
      } else {
        await responsavelService.criar(payload);
        toast.success('Responsável criado com sucesso!');
      }
      handleCloseModal();
      loadResponsaveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar responsável');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja desativar este responsável? O histórico será mantido.')) return;
    try {
      await responsavelService.excluir(id);
      toast.success('Responsável desativado com sucesso!');
      loadResponsaveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar responsável');
    }
  }

  const filteredResponsaveis = responsaveis.filter(
    (r) =>
      r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf.includes(searchTerm),
  );

  return {
    responsaveis: filteredResponsaveis,
    isLoading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editingResponsavel,
    isSaving,
    formData,
    setFormData,
    loadResponsaveis,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  };
}
