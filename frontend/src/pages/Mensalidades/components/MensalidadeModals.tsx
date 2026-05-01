import { Mensalidade } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/masks';
import { MESES_MENS } from '../hooks/useMensalidadesPage';

const FORMAS_PAGAMENTO = [
  { value: 'PIX', label: 'PIX' }, { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' }, { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
  { value: 'BOLETO', label: 'Boleto' }, { value: 'TRANSFERENCIA', label: 'Transferência' },
];

interface PagarMensalidadeModalProps {
  isOpen: boolean; onClose: () => void; onConfirmar: () => void; isPaying: boolean;
  selectedMensalidade: Mensalidade | null;
  formaPagamento: string; setFormaPagamento: (v: string) => void;
  descontoTipo: 'percentual' | 'valor'; setDescontoTipo: (v: 'percentual' | 'valor') => void;
  descontoValor: string; setDescontoValor: (v: string) => void;
  descontoMotivo: string; setDescontoMotivo: (v: string) => void;
  acrescimoTipo: 'percentual' | 'valor'; setAcrescimoTipo: (v: 'percentual' | 'valor') => void;
  acrescimoValor: string; setAcrescimoValor: (v: string) => void;
  acrescimoMotivo: string; setAcrescimoMotivo: (v: string) => void;
  calcularValorFinal: () => number;
  formatCurrencyInput: (v: string) => string;
  formatPercentInput: (v: string) => string;
}

export function PagarMensalidadeModal({
  isOpen, onClose, onConfirmar, isPaying, selectedMensalidade,
  formaPagamento, setFormaPagamento,
  descontoTipo, setDescontoTipo, descontoValor, setDescontoValor, descontoMotivo, setDescontoMotivo,
  acrescimoTipo, setAcrescimoTipo, acrescimoValor, setAcrescimoValor, acrescimoMotivo, setAcrescimoMotivo,
  calcularValorFinal, formatCurrencyInput, formatPercentInput,
}: PagarMensalidadeModalProps) {
  const mens = selectedMensalidade as any;
  const mesRef = mens ? (mens.mes_referencia || mens.mesReferencia || 1) : 1;
  const anoRef = mens ? (mens.ano_referencia || mens.anoReferencia || '') : '';
  const valorOriginal = mens ? (mens.valor || mens.valorFinal || 0) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pagamento">
      <div className="space-y-4">
        <p className="text-gray-600">
          Mensalidade de <strong>{MESES_MENS[mesRef - 1]}/{anoRef}</strong>
        </p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Valor Original</p>
          <p className="text-lg font-semibold text-gray-700">{formatCurrency(valorOriginal)}</p>
        </div>

        {/* Desconto */}
        <div className="border border-green-200 rounded-lg p-3 bg-green-50">
          <p className="text-sm font-medium text-green-700 mb-2">Desconto (opcional)</p>
          <div className="flex gap-2 mb-2">
            <select value={descontoTipo} onChange={(e) => { setDescontoTipo(e.target.value as any); setDescontoValor(''); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="valor">R$</option>
              <option value="percentual">%</option>
            </select>
            <input type="text" value={descontoValor}
              onChange={(e) => setDescontoValor(descontoTipo === 'percentual' ? formatPercentInput(e.target.value) : formatCurrencyInput(e.target.value))}
              placeholder={descontoTipo === 'percentual' ? 'Ex: 10' : 'Ex: 50,00'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {descontoValor && (
            <input type="text" value={descontoMotivo} onChange={(e) => setDescontoMotivo(e.target.value)}
              placeholder="Motivo do desconto (obrigatório)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          )}
        </div>

        {/* Acréscimo */}
        <div className="border border-red-200 rounded-lg p-3 bg-red-50">
          <p className="text-sm font-medium text-red-700 mb-2">Acréscimo (opcional)</p>
          <div className="flex gap-2 mb-2">
            <select value={acrescimoTipo} onChange={(e) => { setAcrescimoTipo(e.target.value as any); setAcrescimoValor(''); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="valor">R$</option>
              <option value="percentual">%</option>
            </select>
            <input type="text" value={acrescimoValor}
              onChange={(e) => setAcrescimoValor(acrescimoTipo === 'percentual' ? formatPercentInput(e.target.value) : formatCurrencyInput(e.target.value))}
              placeholder={acrescimoTipo === 'percentual' ? 'Ex: 5' : 'Ex: 25,00'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          {acrescimoValor && (
            <input type="text" value={acrescimoMotivo} onChange={(e) => setAcrescimoMotivo(e.target.value)}
              placeholder="Motivo do acréscimo (obrigatório)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          )}
        </div>

        <div className="bg-primary-50 p-3 rounded-lg border-2 border-primary-200">
          <p className="text-sm text-primary-600">Valor a Pagar</p>
          <p className="text-2xl font-bold text-primary-700">{formatCurrency(calcularValorFinal())}</p>
        </div>

        <Select label="Forma de Pagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} options={FORMAS_PAGAMENTO} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirmar} isLoading={isPaying} variant="success">Confirmar Pagamento</Button>
        </div>
      </div>
    </Modal>
  );
}

interface EditarValorModalProps {
  isOpen: boolean; onClose: () => void; onConfirmar: () => void; isEditing: boolean;
  selectedMensalidade: Mensalidade | null;
  novoValor: string; setNovoValor: (v: string) => void;
  motivoAlteracao: string; setMotivoAlteracao: (v: string) => void;
  aplicarEmTodas: boolean; setAplicarEmTodas: (v: boolean) => void;
  formatCurrencyInput: (v: string) => string;
}

export function EditarValorModal({
  isOpen, onClose, onConfirmar, isEditing, selectedMensalidade,
  novoValor, setNovoValor, motivoAlteracao, setMotivoAlteracao,
  aplicarEmTodas, setAplicarEmTodas, formatCurrencyInput,
}: EditarValorModalProps) {
  const mens = selectedMensalidade as any;
  const mesRef = mens ? (mens.mes_referencia || mens.mesReferencia || 1) : 1;
  const anoRef = mens ? (mens.ano_referencia || mens.anoReferencia || '') : '';
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Valor da Mensalidade">
      <div className="space-y-4">
        <p className="text-gray-600">Alterar valor de <strong>{MESES_MENS[mesRef - 1]}/{anoRef}</strong></p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Atenção:</strong> Apenas mensalidades futuras podem ter o valor alterado.
          </p>
        </div>
        <Input label="Novo Valor" type="text"
          value={novoValor ? `R$ ${novoValor}` : ''}
          onChange={(e) => setNovoValor(formatCurrencyInput(e.target.value))}
          placeholder="R$ 0,00" />
        <Input label="Motivo da Alteração" value={motivoAlteracao}
          onChange={(e) => setMotivoAlteracao(e.target.value)} required />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={aplicarEmTodas} onChange={(e) => setAplicarEmTodas(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
          <span className="text-sm text-gray-700">Aplicar em todas as mensalidades futuras deste aluno</span>
        </label>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirmar} isLoading={isEditing}>Confirmar Alteração</Button>
        </div>
      </div>
    </Modal>
  );
}
