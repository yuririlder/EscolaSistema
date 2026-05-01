import { useState } from 'react';
import { Usuario, PerfilUsuario } from '../../../types';
import { usuarioService } from '../../../services/usuarioService';
import toast from 'react-hot-toast';

interface UsuarioFormData {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

const initialForm: UsuarioFormData = {
  nome: '',
  email: '',
  senha: '',
  perfil: PerfilUsuario.SECRETARIO,
  ativo: true,
};

export function useUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UsuarioFormData>(initialForm);

  async function loadUsuarios() {
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenModal(usuario?: Usuario) {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({ nome: usuario.nome, email: usuario.email, senha: '', perfil: usuario.perfil, ativo: usuario.ativo });
    } else {
      setEditingUsuario(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingUsuario(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingUsuario) {
        await usuarioService.atualizar(editingUsuario.id, {
          nome: formData.nome,
          email: formData.email,
          perfil: formData.perfil,
          ativo: formData.ativo,
        });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await usuarioService.criar(formData);
        toast.success('Usuário criado com sucesso!');
      }
      handleCloseModal();
      loadUsuarios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await usuarioService.excluir(id);
      toast.success('Usuário excluído com sucesso!');
      loadUsuarios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir usuário');
    }
  }

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    usuarios: filteredUsuarios,
    isLoading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editingUsuario,
    isSaving,
    formData,
    setFormData,
    loadUsuarios,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  };
}
