import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Aluno } from '../../../types';
import { currencyToNumber } from '../../../utils/masks';
import { MatriculaOnboardingForm, PagamentoOnboardingForm } from '../hooks/useOnboardingPage';

interface StepPagamentoProps {
  pagamentoForm: PagamentoOnboardingForm;
  setPagamentoForm: (f: PagamentoOnboardingForm) => void;
  matriculaForm: MatriculaOnboardingForm;
  createdAluno: Aluno | null;
  createdMatricula: any;
  isSaving: boolean;
  setCurrentStep: (s: number) => void;
  handlePagarMatricula: () => void;
  handleSkipPagamento: () => void;
  formatCurrency: (v: number) => string;
}

export function StepPagamento({
  pagamentoForm, setPagamentoForm, matriculaForm, createdAluno, createdMatricula,
  isSaving, setCurrentStep, handlePagarMatricula, handleSkipPagamento, formatCurrency,
}: StepPagamentoProps) {
  const set = (patch: Partial<PagamentoOnboardingForm>) => setPagamentoForm({ ...pagamentoForm, ...patch });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm"><strong>Etapa 4:</strong> Registre o pagamento da taxa de matrícula.</p>
      </div>

      {createdMatricula && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Aluno:</span><p className="font-semibold">{createdAluno?.nome}</p></div>
              <div><span className="text-gray-500">Valor da Matrícula:</span><p className="font-semibold text-lg text-primary-600">{formatCurrency(currencyToNumber(matriculaForm.valor_matricula))}</p></div>
              <div><span className="text-gray-500">Ano Letivo:</span><p className="font-semibold">{matriculaForm.ano_letivo}</p></div>
              <div><span className="text-gray-500">Desconto:</span><p className="font-semibold">{matriculaForm.desconto}%</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <Select label="Forma de Pagamento" value={pagamentoForm.forma_pagamento}
          onChange={(e) => set({ forma_pagamento: e.target.value })}
          options={[
            { value: 'DINHEIRO', label: 'Dinheiro' }, { value: 'PIX', label: 'PIX' },
            { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' }, { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
            { value: 'BOLETO', label: 'Boleto' }, { value: 'TRANSFERENCIA', label: 'Transferência Bancária' },
          ]} />
        <Input label="Observação" value={pagamentoForm.observacao} onChange={(e) => set({ observacao: e.target.value })} />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={() => setCurrentStep(3)}>
          <ChevronLeft size={18} /> Voltar
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="danger" onClick={handleSkipPagamento}>Pular (Pagar depois)</Button>
          <Button onClick={handlePagarMatricula} isLoading={isSaving}>
            Registrar Pagamento <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
