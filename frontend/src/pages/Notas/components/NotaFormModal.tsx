import { Nota, Aluno, Professor } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

interface NotaFormData {
  alunoId: string; disciplina: string; bimestre: number;
  valor: number; observacao: string; professorId: string;
}

interface NotaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: NotaFormData;
  setFormData: (data: NotaFormData) => void;
  editingNota: Nota | null;
  isSaving: boolean;
  alunos: Aluno[];
  professores: Professor[];
}

export function NotaFormModal({ isOpen, onClose, onSubmit, formData, setFormData, editingNota, isSaving, alunos, professores }: NotaFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingNota ? 'Editar Nota' : 'Lançar Nota'} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Aluno"
            value={formData.alunoId}
            onChange={(e) => setFormData({ ...formData, alunoId: e.target.value })}
            options={alunos.map((a) => ({ value: a.id, label: `${a.nome} - ${a.matriculaNumero}` }))}
            placeholder="Selecione um aluno"
            required
          />
          <Select
            label="Professor"
            value={formData.professorId}
            onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
            options={professores.map((p) => ({ value: p.id, label: `${p.nome} - ${p.especialidade}` }))}
            placeholder="Selecione um professor"
            required
          />
          <Input label="Disciplina" value={formData.disciplina} onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })} required />
          <Select
            label="Bimestre"
            value={formData.bimestre.toString()}
            onChange={(e) => setFormData({ ...formData, bimestre: parseInt(e.target.value) })}
            options={[
              { value: '1', label: '1º Bimestre' }, { value: '2', label: '2º Bimestre' },
              { value: '3', label: '3º Bimestre' }, { value: '4', label: '4º Bimestre' },
            ]}
          />
          <Input
            label="Nota (0 a 10)"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
            required
          />
          <div className="md:col-span-2">
            <Input label="Observação" value={formData.observacao} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingNota ? 'Atualizar' : 'Lançar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
