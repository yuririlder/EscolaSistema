import { Professor } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { formatCurrencyInput } from '../../../utils/masks';

interface ProfessorFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  salario: string;
  formacao: string;
  especialidade: string;
}

interface ProfessorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ProfessorFormData;
  setFormData: (data: ProfessorFormData) => void;
  editingProfessor: Professor | null;
  isSaving: boolean;
}

export function ProfessorFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingProfessor,
  isSaving,
}: ProfessorFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProfessor ? 'Editar Professor' : 'Novo Professor'}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
          <MaskedInput
            label="CPF"
            mask="cpf"
            value={formData.cpf}
            onChange={(v) => setFormData({ ...formData, cpf: v })}
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <MaskedInput
            label="Telefone"
            mask="phone"
            value={formData.telefone}
            onChange={(v) => setFormData({ ...formData, telefone: v })}
            required
          />
          <Input
            label="Formação"
            value={formData.formacao}
            onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
            required
          />
          <Input
            label="Especialidade"
            value={formData.especialidade}
            onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
            required
          />
          <Input
            label="Salário"
            value={formData.salario}
            onChange={(e) => setFormData({ ...formData, salario: formatCurrencyInput(e.target.value) })}
            placeholder="0,00"
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Endereço"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>
            {editingProfessor ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

