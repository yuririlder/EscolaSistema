import { useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Usuario } from '../../types';
import { useUsuariosPage } from './hooks/useUsuariosPage';
import { UsuarioFormModal } from './components/UsuarioFormModal';

export function Usuarios() {
  const {
    usuarios,
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
  } = useUsuariosPage();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    {
      key: 'perfil',
      header: 'Perfil',
      render: (u: Usuario) => <Badge variant="info">{u.perfil}</Badge>,
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (u: Usuario) => (
        <Badge variant={u.ativo ? 'success' : 'danger'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (u: Usuario) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(u)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar usuário..." />
        </CardHeader>
        <CardContent className="p-0">
          <Table data={usuarios} columns={columns} keyExtractor={(u) => u.id} />
        </CardContent>
      </Card>

      <UsuarioFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingUsuario={editingUsuario}
        isSaving={isSaving}
      />
    </div>
  );
}
