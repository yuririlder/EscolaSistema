import { Despesa } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { formatCurrencyInput } from '../../../utils/masks';

interface DespesaFormData {
  descricao: string; valor: string; categoria: string;
  dataVencimento: string; fornecedor: string; observacao: string;
}

const CATEGORIAS = [
  { value: 'ALUGUEL', label: 'Aluguel' }, { value: 'ENERGIA', label: 'Energia' },
  { value: 'AGUA', label: 'Água' }, { value: 'INTERNET', label: 'Internet' },
  { value: 'TELEFONE', label: 'Telefone' }, { value: 'MATERIAL', label: 'Material' },
  { value: 'MANUTENCAO', label: 'Manutenção' }, { value: 'LIMPEZA', label: 'Limpeza' },
  { value: 'OUTROS', label: 'Outros' },
];

const FORMAS_PAGAMENTO = [
  { value: 'PIX', label: 'PIX' }, { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' }, { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
  { value: 'BOLETO', label: 'Boleto' }, { value: 'TRANSFERENCIA', label: 'Transferência' },
];

interface DespesaFormModalProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent) => void;
  formData: DespesaFormData; setFormData: (data: DespesaFormData) => void;
  editingDespesa: Despesa | null; isSaving: boolean;
}

export function DespesaFormModal({ isOpen, onClose, onSubmit, formData, setFormData, editingDespesa, isSaving }: DespesaFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingDespesa ? 'Editar Despesa' : 'Nova Despesa'} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Descrição" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} required />
          </div>
          <Input
            label="Valor" type="text"
            value={formData.valor ? `R$ ${formData.valor}` : ''}
            onChange={(e) => setFormData({ ...formData, valor: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00" required
          />
          <Select label="Categoria" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} options={CATEGORIAS} placeholder="Selecione uma categoria" required />
          <Input label="Data de Vencimento" type="date" value={formData.dataVencimento} onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })} required />
          <Input label="Fornecedor" value={formData.fornecedor} onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })} />
          <div className="md:col-span-2">
            <Input label="Observação" value={formData.observacao} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingDespesa ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

interface PagarDespesaModalProps {
  isOpen: boolean; onClose: () => void;
  selectedDespesa: Despesa | null; formaPagamento: string;
  setFormaPagamento: (v: string) => void;
  onConfirmar: () => void; isPaying: boolean;
  formatCurrency: (v: number) => string;
}

export function PagarDespesaModal({ isOpen, onClose, selectedDespesa, formaPagamento, setFormaPagamento, onConfirmar, isPaying, formatCurrency }: PagarDespesaModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pagamento de Despesa">
      <div className="space-y-4">
        <p className="text-gray-600">Registrar pagamento da despesa: <strong>{selectedDespesa?.descricao}</strong></p>
        <p className="text-2xl font-bold text-red-600">{selectedDespesa ? formatCurrency(selectedDespesa.valor) : ''}</p>
        <Select label="Forma de Pagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} options={FORMAS_PAGAMENTO} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirmar} isLoading={isPaying} variant="success">Confirmar Pagamento</Button>
        </div>
      </div>
    </Modal>
  );
}
