import { UserPlus, GraduationCap, FileText, CreditCard, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StepIndicator } from './components/StepIndicator';
import { StepResponsavel } from './components/StepResponsavel';
import { StepAluno } from './components/StepAluno';
import { StepMatricula } from './components/StepMatricula';
import { StepPagamento } from './components/StepPagamento';
import { StepTurma } from './components/StepTurma';
import { useOnboardingPage, ONBOARDING_STEPS } from './hooks/useOnboardingPage';

const STEP_ICONS = [UserPlus, GraduationCap, FileText, CreditCard, BookOpen];

export function OnboardingMatricula() {
  const hook = useOnboardingPage();

  if (hook.isLoading) return <LoadingSpinner />;

  const CurrentIcon = STEP_ICONS[hook.currentStep - 1];
  const currentStepInfo = ONBOARDING_STEPS[hook.currentStep - 1];

  const renderStep = () => {
    switch (hook.currentStep) {
      case 1:
        return (
          <StepResponsavel
            useExistingResponsavel={hook.useExistingResponsavel}
            setUseExistingResponsavel={hook.setUseExistingResponsavel}
            selectedResponsavelId={hook.selectedResponsavelId}
            setSelectedResponsavelId={hook.setSelectedResponsavelId}
            responsavelOptions={hook.responsavelOptions}
            responsavelForm={hook.responsavelForm}
            setResponsavelForm={hook.setResponsavelForm}
            isSaving={hook.isSaving}
            handleCreateResponsavel={hook.handleCreateResponsavel}
            handleSelectExistingResponsavel={hook.handleSelectExistingResponsavel}
          />
        );
      case 2:
        return (
          <StepAluno
            alunoForm={hook.alunoForm}
            setAlunoForm={hook.setAlunoForm}
            isSaving={hook.isSaving}
            createdResponsavel={hook.createdResponsavel}
            setCurrentStep={hook.setCurrentStep}
            handleCreateAluno={hook.handleCreateAluno}
          />
        );
      case 3:
        return (
          <StepMatricula
            matriculaForm={hook.matriculaForm}
            setMatriculaForm={hook.setMatriculaForm}
            planos={hook.planos}
            isSaving={hook.isSaving}
            createdAluno={hook.createdAluno}
            setCurrentStep={hook.setCurrentStep}
            handleCreateMatricula={hook.handleCreateMatricula}
            formatCurrency={hook.formatCurrency}
          />
        );
      case 4:
        return (
          <StepPagamento
            pagamentoForm={hook.pagamentoForm}
            setPagamentoForm={hook.setPagamentoForm}
            matriculaForm={hook.matriculaForm}
            createdAluno={hook.createdAluno}
            createdMatricula={hook.createdMatricula}
            isSaving={hook.isSaving}
            setCurrentStep={hook.setCurrentStep}
            handlePagarMatricula={hook.handlePagarMatricula}
            handleSkipPagamento={hook.handleSkipPagamento}
            formatCurrency={hook.formatCurrency}
          />
        );
      case 5:
        return (
          <StepTurma
            turmaForm={hook.turmaForm}
            setTurmaForm={hook.setTurmaForm}
            turmasFiltradas={hook.turmasFiltradas}
            turmas={hook.turmas}
            planos={hook.planos}
            isSaving={hook.isSaving}
            alunoVinculado={hook.alunoVinculado}
            matriculaPaga={hook.matriculaPaga}
            createdAluno={hook.createdAluno}
            createdResponsavel={hook.createdResponsavel}
            alunoForm={hook.alunoForm}
            responsavelForm={hook.responsavelForm}
            matriculaForm={hook.matriculaForm}
            setCurrentStep={hook.setCurrentStep}
            handleVincularTurma={hook.handleVincularTurma}
            handleImprimirFichaCompleta={hook.handleImprimirFichaCompleta}
            handleImprimirTermoMatricula={hook.handleImprimirTermoMatricula}
            handleNovaMatricula={hook.handleNovaMatricula}
            handleFinalizar={hook.handleFinalizar}
            formatCurrency={hook.formatCurrency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Onboarding de Matrícula</h1>
        <p className="text-gray-500">Processo completo de matrícula de novos alunos</p>
      </div>

      <StepIndicator steps={ONBOARDING_STEPS} currentStep={hook.currentStep} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CurrentIcon size={24} className="text-primary-600" />
            <div>
              <h2 className="text-lg font-semibold">{currentStepInfo.title}</h2>
              <p className="text-sm text-gray-500">{currentStepInfo.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
