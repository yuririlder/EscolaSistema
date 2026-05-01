import { PlanoMensalidade } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { formatCurrencyInput } from '../../../utils/masks';

interface PlanoFormData {
  nome: string; valor: string; descricao: string; ativo: boolean;
}

interface PlanoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: PlanoFormData;
  setFormData: (data: PlanoFormData) => void;
  editingPlano: PlanoMensalidade | null;
  isSaving: boolean;
}

export function PlanoFormModal({ isOpen, onClose, onSubmit, formData, setFormData, editingPlano, isSaving }: PlanoFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingPlano ? 'Editar Plano' : 'Novo Plano'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
        <Input
          label="Valor"
          type="text"
          value={formData.valor ? `R$ ${formData.valor}` : ''}
          onChange={(e) => setFormData({ ...formData, valor: formatCurrencyInput(e.target.value) })}
          placeholder="R$ 0,00"
          required
        />
        <Input label="Descrição" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="ativo" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
          <label htmlFor="ativo" className="text-sm text-gray-700">Plano ativo</label>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingPlano ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
