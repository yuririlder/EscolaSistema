import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PlanoMensalidade, Aluno } from '../../../types';
import { formatCurrencyInput } from '../../../utils/masks';
import { MatriculaOnboardingForm } from '../hooks/useOnboardingPage';

interface StepMatriculaProps {
  matriculaForm: MatriculaOnboardingForm;
  setMatriculaForm: (f: MatriculaOnboardingForm) => void;
  planos: PlanoMensalidade[];
  isSaving: boolean;
  createdAluno: Aluno | null;
  setCurrentStep: (s: number) => void;
  handleCreateMatricula: () => void;
  formatCurrency: (v: number) => string;
}

export function StepMatricula({ matriculaForm, setMatriculaForm, planos, isSaving, createdAluno, setCurrentStep, handleCreateMatricula, formatCurrency }: StepMatriculaProps) {
  const anoAtual = new Date().getFullYear();
  const set = (patch: Partial<MatriculaOnboardingForm>) => setMatriculaForm({ ...matriculaForm, ...patch });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Etapa 3:</strong> Registre a matrícula do aluno <strong>{createdAluno?.nome}</strong> para o ano letivo.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleCreateMatricula(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Plano de Mensalidade" value={matriculaForm.plano_id}
            onChange={(e) => set({ plano_id: e.target.value })}
            options={planos.map((p) => ({ value: p.id, label: `${p.nome} - ${formatCurrency(p.valor)}` }))}
            placeholder="Selecione um plano" required />
          <Select label="Ano Letivo" value={matriculaForm.ano_letivo.toString()}
            onChange={(e) => set({ ano_letivo: parseInt(e.target.value) })}
            options={[
              { value: (anoAtual - 1).toString(), label: (anoAtual - 1).toString() },
              { value: anoAtual.toString(), label: anoAtual.toString() },
              { value: (anoAtual + 1).toString(), label: (anoAtual + 1).toString() },
            ]} />
          <Input label="Valor da Matrícula" type="text"
            value={matriculaForm.valor_matricula ? `R$ ${matriculaForm.valor_matricula}` : ''}
            onChange={(e) => set({ valor_matricula: formatCurrencyInput(e.target.value) })}
            placeholder="R$ 0,00" required />
          <Input label="Observações" value={matriculaForm.observacoes} onChange={(e) => set({ observacoes: e.target.value })} />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="secondary" onClick={() => setCurrentStep(2)}>
            <ChevronLeft size={18} /> Voltar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Registrar Matrícula <ChevronRight size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
