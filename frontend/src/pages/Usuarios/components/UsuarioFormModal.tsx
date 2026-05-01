import { Usuario, PerfilUsuario } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

interface UsuarioFormData {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: UsuarioFormData;
  setFormData: (data: UsuarioFormData) => void;
  editingUsuario: Usuario | null;
  isSaving: boolean;
}

export function UsuarioFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingUsuario,
  isSaving,
}: UsuarioFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
        <Input
          label="E-mail"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        {!editingUsuario && (
          <Input
            label="Senha"
            type="password"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            required
          />
        )}
        <Select
          label="Perfil"
          value={formData.perfil}
          onChange={(e) => setFormData({ ...formData, perfil: e.target.value as PerfilUsuario })}
          options={[
            { value: PerfilUsuario.DIRETOR, label: 'Diretor' },
            { value: PerfilUsuario.SECRETARIO, label: 'Secretário' },
            { value: PerfilUsuario.COORDENADOR, label: 'Coordenador' },
          ]}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ativo"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="ativo" className="text-sm text-gray-700">Usuário ativo</label>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>
            {editingUsuario ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
