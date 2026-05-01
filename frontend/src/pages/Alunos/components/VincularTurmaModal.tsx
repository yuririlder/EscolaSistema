import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Turma } from '../../../types';

interface VincularTurmaModalProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent) => void;
  selectedAluno: any; isSaving: boolean;
  turmaFormData: { turma_id: string; ano_letivo: number };
  setTurmaFormData: (d: { turma_id: string; ano_letivo: number }) => void;
  turmasFiltradas: Turma[];
}

export function VincularTurmaModal({
  isOpen, onClose, onSubmit, selectedAluno, isSaving,
  turmaFormData, setTurmaFormData, turmasFiltradas,
}: VincularTurmaModalProps) {
  const anoAtual = new Date().getFullYear();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vincular Aluno à Turma">
      <form onSubmit={onSubmit} className="space-y-4">
        {selectedAluno && (
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm text-gray-500">Aluno selecionado:</p>
            <p className="font-semibold">{selectedAluno.nome}</p>
          </div>
        )}
        <Select label="Ano Letivo" value={turmaFormData.ano_letivo.toString()}
          onChange={(e) => setTurmaFormData({ ...turmaFormData, ano_letivo: parseInt(e.target.value) })}
          options={[
            { value: (anoAtual - 1).toString(), label: (anoAtual - 1).toString() },
            { value: anoAtual.toString(), label: anoAtual.toString() },
            { value: (anoAtual + 1).toString(), label: (anoAtual + 1).toString() },
          ]} />
        <Select label="Turma" value={turmaFormData.turma_id}
          onChange={(e) => setTurmaFormData({ ...turmaFormData, turma_id: e.target.value })}
          options={turmasFiltradas.map((t) => ({ value: t.id, label: `${t.nome} - ${t.serie || ''} (${t.turno})` }))}
          placeholder="Selecione uma turma" required />
        {turmasFiltradas.length === 0 && (
          <p className="text-sm text-amber-600">Nenhuma turma ativa encontrada para o ano letivo {turmaFormData.ano_letivo}</p>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving} disabled={!turmaFormData.turma_id}>Vincular</Button>
        </div>
      </form>
    </Modal>
  );
}
