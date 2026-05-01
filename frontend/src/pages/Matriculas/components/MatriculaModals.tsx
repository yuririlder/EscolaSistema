import { Matricula, PlanoMensalidade, StatusMatricula } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { formatCurrency } from '../../../utils/masks';

interface MatriculaFormData {
  alunoId: string; planoMensalidadeId: string; anoLetivo: string;
  valorMatricula: string; status: StatusMatricula; observacao: string;
}

interface MatriculaFormModalProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent) => void;
  formData: MatriculaFormData; setFormData: (d: MatriculaFormData) => void;
  editingMatricula: Matricula | null; isSaving: boolean;
  alunoOptions: { value: string; label: string }[];
  planos: PlanoMensalidade[];
  formatCurrencyInput: (v: string) => string;
  formatNumberInput: (v: string) => string;
}

export function MatriculaFormModal({
  isOpen, onClose, onSubmit, formData, setFormData,
  editingMatricula, isSaving, alunoOptions, planos,
  formatCurrencyInput, formatNumberInput,
}: MatriculaFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingMatricula ? 'Editar Matrícula' : 'Nova Matrícula'} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Autocomplete label="Aluno" value={formData.alunoId} options={alunoOptions}
            onChange={(value) => setFormData({ ...formData, alunoId: value })}
            placeholder="Digite o nome do aluno..." required />
          <Select label="Plano de Mensalidade" value={formData.planoMensalidadeId}
            onChange={(e) => setFormData({ ...formData, planoMensalidadeId: e.target.value })}
            options={planos.map((p) => ({ value: p.id, label: `${p.nome} - ${formatCurrency(p.valor)}` }))}
            placeholder="Selecione um plano" required />
          <Input label="Ano Letivo" type="text" value={formData.anoLetivo}
            onChange={(e) => setFormData({ ...formData, anoLetivo: formatNumberInput(e.target.value).slice(0, 4) })}
            maxLength={4} required />
          <Input label="Valor da Matrícula" type="text"
            value={formData.valorMatricula ? `R$ ${formData.valorMatricula}` : ''}
            onChange={(e) => setFormData({ ...formData, valorMatricula: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00" required />
          <Select label="Status" value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusMatricula })}
            options={[
              { value: StatusMatricula.ATIVA, label: 'Ativa' },
              { value: StatusMatricula.TRANCADA, label: 'Trancada' },
              { value: StatusMatricula.CANCELADA, label: 'Cancelada' },
              { value: StatusMatricula.CONCLUIDA, label: 'Concluída' },
            ]} />
          <div className="md:col-span-2">
            <Input label="Observação" value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingMatricula ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

interface ConfirmCancelModalProps {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; isCanceling: boolean;
  matricula: Matricula | null;
}

export function ConfirmCancelModal({ isOpen, onClose, onConfirm, isCanceling, matricula }: ConfirmCancelModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Desmatrícula" size="md">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm"><strong>Atenção:</strong> Ao desmatricular o aluno:</p>
          <ul className="list-disc list-inside text-yellow-700 text-sm mt-2 space-y-1">
            <li>A matrícula será marcada como <strong>CANCELADA</strong></li>
            <li>Mensalidades <strong>vencidas</strong> serão <strong>preservadas</strong></li>
            <li>Mensalidades <strong>futuras</strong> serão <strong>canceladas</strong></li>
            <li>O histórico escolar será <strong>preservado</strong></li>
          </ul>
        </div>
        {matricula && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700"><strong>Aluno:</strong> {(matricula as any).aluno?.nome || (matricula as any).aluno_nome}</p>
            <p className="text-gray-700"><strong>Ano Letivo:</strong> {(matricula as any).anoLetivo || (matricula as any).ano_letivo}</p>
          </div>
        )}
        <p className="text-gray-600">Deseja realmente desmatricular este aluno?</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isCanceling}>Confirmar Desmatrícula</Button>
        </div>
      </div>
    </Modal>
  );
}
