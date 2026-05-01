import { PagamentoFuncionario } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { formatCurrency } from '../../../utils/masks';
import { MESES } from '../hooks/usePagamentosFuncionariosPage';

interface PagamentoFormData {
  funcionarioId: string; mesReferencia: number; anoReferencia: string;
  valorBase: string; bonus: string; descontos: string; observacao: string;
}

interface PagamentoFormModalProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent) => void;
  formData: PagamentoFormData; setFormData: (d: PagamentoFormData) => void;
  isSaving: boolean; valorFinal: number;
  funcionarioOptions: { value: string; label: string }[];
  onFuncionarioChange: (id: string) => void;
  formatCurrencyInput: (v: string) => string;
  formatNumberInput: (v: string) => string;
}

export function PagamentoFormModal({
  isOpen, onClose, onSubmit, formData, setFormData, isSaving, valorFinal,
  funcionarioOptions, onFuncionarioChange, formatCurrencyInput, formatNumberInput,
}: PagamentoFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Pagamento de Funcionário" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Autocomplete label="Funcionário" value={formData.funcionarioId} options={funcionarioOptions}
            onChange={onFuncionarioChange} placeholder="Digite o nome do funcionário..." required />
          <div className="flex gap-4">
            <Select label="Mês" value={formData.mesReferencia.toString()}
              onChange={(e) => setFormData({ ...formData, mesReferencia: parseInt(e.target.value) })}
              options={MESES.map((mes, i) => ({ value: (i + 1).toString(), label: mes }))} />
            <Input label="Ano" type="text" value={formData.anoReferencia}
              onChange={(e) => setFormData({ ...formData, anoReferencia: formatNumberInput(e.target.value).slice(0, 4) })}
              maxLength={4} required />
          </div>
          <Input label="Valor Base (Salário)" type="text"
            value={formData.valorBase ? `R$ ${formData.valorBase}` : ''}
            onChange={(e) => setFormData({ ...formData, valorBase: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00" required />
          <Input label="Bônus" type="text"
            value={formData.bonus ? `R$ ${formData.bonus}` : ''}
            onChange={(e) => setFormData({ ...formData, bonus: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00" />
          <Input label="Descontos" type="text"
            value={formData.descontos ? `R$ ${formData.descontos}` : ''}
            onChange={(e) => setFormData({ ...formData, descontos: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00" />
          <div className="flex items-end">
            <div className="text-lg">
              <span className="text-gray-500">Valor Final: </span>
              <span className="font-bold text-green-600">{formatCurrency(valorFinal)}</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <Input label="Observação" value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>Criar Pagamento</Button>
        </div>
      </form>
    </Modal>
  );
}

const FORMAS_PAGAMENTO = [
  { value: 'TRANSFERENCIA', label: 'Transferência Bancária' },
  { value: 'PIX', label: 'PIX' }, { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CHEQUE', label: 'Cheque' },
];

interface ConfirmarPagamentoModalProps {
  isOpen: boolean; onClose: () => void; onConfirmar: () => void; isPaying: boolean;
  selectedPagamento: PagamentoFuncionario | null;
  formaPagamento: string; setFormaPagamento: (v: string) => void;
}

export function ConfirmarPagamentoModal({
  isOpen, onClose, onConfirmar, isPaying, selectedPagamento, formaPagamento, setFormaPagamento,
}: ConfirmarPagamentoModalProps) {
  const pag = selectedPagamento as any;
  const mes = pag ? (pag.mes_referencia || pag.mesReferencia || 1) : 1;
  const ano = pag ? (pag.ano_referencia || pag.anoReferencia || '') : '';
  const valorLiquido = pag ? (pag.valor_liquido || pag.valorFinal || 0) : 0;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Pagamento de Funcionário">
      <div className="space-y-4">
        <p className="text-gray-600">
          Confirmar pagamento: <strong>{pag?.funcionario?.nome || pag?.funcionario_nome || ''}</strong>
        </p>
        <p className="text-gray-600">Referência: <strong>{MESES[mes - 1]}/{ano}</strong></p>
        <p className="text-2xl font-bold text-green-600">{formatCurrency(valorLiquido)}</p>
        <Select label="Forma de Pagamento" value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)} options={FORMAS_PAGAMENTO} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirmar} isLoading={isPaying} variant="success">Confirmar Pagamento</Button>
        </div>
      </div>
    </Modal>
  );
}
