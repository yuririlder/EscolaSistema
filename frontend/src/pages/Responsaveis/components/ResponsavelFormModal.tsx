import { Responsavel } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { ESTADOS_BRASIL } from '../../../utils/constants';

interface ResponsavelFormData {
  nome: string; cpf: string; rg: string; data_nascimento: string;
  email: string; telefone: string; celular: string; endereco: string;
  bairro: string; complemento: string; cidade: string; estado: string;
  cep: string; profissao: string; local_trabalho: string; observacoes: string;
}

interface ResponsavelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ResponsavelFormData;
  setFormData: (data: ResponsavelFormData) => void;
  editingResponsavel: Responsavel | null;
  isSaving: boolean;
}

export function ResponsavelFormModal({ isOpen, onClose, onSubmit, formData, setFormData, editingResponsavel, isSaving }: ResponsavelFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingResponsavel ? 'Editar Responsável' : 'Novo Responsável'} size="xl">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input label="Nome Completo" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
            </div>
            <Input label="Data de Nascimento" type="date" value={formData.data_nascimento} onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })} />
            <MaskedInput label="CPF" mask="cpf" value={formData.cpf} onChange={(v) => setFormData({ ...formData, cpf: v })} placeholder="000.000.000-00" required />
            <Input label="RG" value={formData.rg} onChange={(e) => setFormData({ ...formData, rg: e.target.value })} />
            <Input label="Profissão" value={formData.profissao} onChange={(e) => setFormData({ ...formData, profissao: e.target.value })} />
            <Input label="Local de Trabalho" value={formData.local_trabalho} onChange={(e) => setFormData({ ...formData, local_trabalho: e.target.value })} />
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="E-mail" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <MaskedInput label="Telefone" mask="phone" value={formData.telefone} onChange={(v) => setFormData({ ...formData, telefone: v })} placeholder="(00) 00000-0000" required />
            <MaskedInput label="Celular" mask="phone" value={formData.celular} onChange={(v) => setFormData({ ...formData, celular: v })} placeholder="(00) 00000-0000" />
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input label="Rua" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} placeholder="Rua, Avenida, etc." />
            </div>
            <Input label="Bairro" value={formData.bairro} onChange={(e) => setFormData({ ...formData, bairro: e.target.value })} />
            <Input label="Complemento" value={formData.complemento} onChange={(e) => setFormData({ ...formData, complemento: e.target.value })} placeholder="Apto, Bloco, etc." />
            <Input label="Cidade" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} />
            <Select label="Estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} options={ESTADOS_BRASIL} placeholder="Selecione" />
            <MaskedInput label="CEP" mask="cep" value={formData.cep} onChange={(v) => setFormData({ ...formData, cep: v })} placeholder="00000-000" />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingResponsavel ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
