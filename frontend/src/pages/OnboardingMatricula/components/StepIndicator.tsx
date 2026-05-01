import { Check, UserPlus, GraduationCap, FileText, CreditCard, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

const STEP_ICONS = [UserPlus, GraduationCap, FileText, CreditCard, BookOpen];

interface Step { id: number; title: string; }

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = STEP_ICONS[index];
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-primary-600' : 'text-gray-500'}`}>{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
