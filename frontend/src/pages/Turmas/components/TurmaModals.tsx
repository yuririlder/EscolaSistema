import { Turma, Professor } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { TURNO_OPTIONS } from '../../../utils/constants';

interface TurmaFormData {
  nome: string; ano: number; serie: string; turno: string;
  capacidade: number; salaNumero: string; ativa: boolean;
}

interface TurmaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: TurmaFormData;
  setFormData: (data: TurmaFormData) => void;
  editingTurma: Turma | null;
  isSaving: boolean;
}

export function TurmaFormModal({ isOpen, onClose, onSubmit, formData, setFormData, editingTurma, isSaving }: TurmaFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTurma ? 'Editar Turma' : 'Nova Turma'} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
          <Input label="Série" value={formData.serie} onChange={(e) => setFormData({ ...formData, serie: e.target.value })} required />
          <Input label="Ano" type="number" value={formData.ano} onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })} required />
          <Select label="Turno" value={formData.turno} onChange={(e) => setFormData({ ...formData, turno: e.target.value })} options={TURNO_OPTIONS} />
          <Input label="Número da Sala" value={formData.salaNumero} onChange={(e) => setFormData({ ...formData, salaNumero: e.target.value })} required />
          <Input label="Capacidade" type="number" value={formData.capacidade} onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) })} required />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ativa" checked={formData.ativa} onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
            <label htmlFor="ativa" className="text-sm text-gray-700">Turma ativa</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingTurma ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

interface VincularProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVincular: () => void;
  selectedTurma: Turma | null;
  professores: Professor[];
  selectedProfessorId: string;
  setSelectedProfessorId: (id: string) => void;
  isSaving: boolean;
}

export function VincularProfessorModal({ isOpen, onClose, onVincular, selectedTurma, professores, selectedProfessorId, setSelectedProfessorId, isSaving }: VincularProfessorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vincular Professor" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Turma: <strong>{selectedTurma?.nome}</strong></p>
        <Select
          label="Professor"
          value={selectedProfessorId}
          onChange={(e) => setSelectedProfessorId(e.target.value)}
          options={professores.map((p) => ({ value: p.id, label: `${p.nome} - ${p.especialidade}` }))}
          placeholder="Selecione um professor"
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onVincular} isLoading={isSaving} disabled={!selectedProfessorId}>Vincular</Button>
        </div>
      </div>
    </Modal>
  );
}
