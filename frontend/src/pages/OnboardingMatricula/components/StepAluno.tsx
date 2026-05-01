import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { PARENTESCO_OPTIONS } from '../../../utils/constants';
import { Responsavel } from '../../../types';
import { AlunoOnboardingForm } from '../hooks/useOnboardingPage';

interface StepAlunoProps {
  alunoForm: AlunoOnboardingForm;
  setAlunoForm: (f: AlunoOnboardingForm) => void;
  isSaving: boolean;
  createdResponsavel: Responsavel | null;
  setCurrentStep: (s: number) => void;
  handleCreateAluno: () => void;
}

export function StepAluno({ alunoForm, setAlunoForm, isSaving, createdResponsavel, setCurrentStep, handleCreateAluno }: StepAlunoProps) {
  const set = (patch: Partial<AlunoOnboardingForm>) => setAlunoForm({ ...alunoForm, ...patch });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Etapa 2:</strong> Cadastre os dados do aluno. Responsável vinculado: <strong>{createdResponsavel?.nome}</strong>
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleCreateAluno(); }} className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Dados do Aluno</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input label="Nome Completo do Aluno" value={alunoForm.nome} onChange={(e) => set({ nome: e.target.value })} required />
            </div>
            <Input label="Data de Nascimento" type="date" value={alunoForm.data_nascimento} onChange={(e) => set({ data_nascimento: e.target.value })} required />
            <MaskedInput label="CPF (opcional)" mask="cpf" value={alunoForm.cpf} onChange={(v) => set({ cpf: v })} />
            <Select label="Sexo" value={alunoForm.sexo} onChange={(e) => set({ sexo: e.target.value })}
              options={[{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }, { value: 'O', label: 'Outro' }]} />
            <Select label="Parentesco do Responsável" value={alunoForm.parentesco_responsavel}
              onChange={(e) => set({ parentesco_responsavel: e.target.value })}
              options={PARENTESCO_OPTIONS} placeholder="Selecione o parentesco" required />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Contatos de Emergência (obrigatório 2 contatos)</h3>
          <div className="space-y-3">
            {[1, 2].map((num) => {
              const nomeKey = `contato${num}_nome` as keyof AlunoOnboardingForm;
              const telKey = `contato${num}_telefone` as keyof AlunoOnboardingForm;
              const parKey = `contato${num}_parentesco` as keyof AlunoOnboardingForm;
              return (
                <div key={num} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Contato {num}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Nome" value={alunoForm[nomeKey] as string} onChange={(e) => set({ [nomeKey]: e.target.value } as any)} required />
                    <MaskedInput label="Telefone" mask="phone" value={alunoForm[telKey] as string} onChange={(v) => set({ [telKey]: v } as any)} required />
                    <Select label="Parentesco" value={alunoForm[parKey] as string} onChange={(e) => set({ [parKey]: e.target.value } as any)}
                      options={PARENTESCO_OPTIONS} placeholder="Selecione" required />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Informações de Saúde</h3>
          <div className="space-y-3">
            {[
              { key: 'possui_alergia', label: 'Possui alergias?', descKey: 'alergia_descricao', placeholder: 'Descreva as alergias...' },
              { key: 'restricao_alimentar', label: 'Possui restrição alimentar?', descKey: 'restricao_alimentar_descricao', placeholder: 'Descreva as restrições alimentares...' },
              { key: 'uso_medicamento', label: 'Faz uso contínuo de medicamento?', descKey: 'medicamento_descricao', placeholder: 'Descreva os medicamentos...' },
              { key: 'necessidade_especial', label: 'Possui necessidades especiais ou laudo médico?', descKey: 'necessidade_especial_descricao', placeholder: 'Descreva as necessidades especiais ou laudos...' },
            ].map(({ key, label, descKey, placeholder }) => (
              <div key={key} className="p-3 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(alunoForm as any)[key]} onChange={(e) => set({ [key]: e.target.checked } as any)}
                    className="w-4 h-4 text-primary-600 rounded" />
                  <span className="font-medium text-sm">{label}</span>
                </label>
                {(alunoForm as any)[key] && (
                  <div className="mt-2">
                    <Input value={(alunoForm as any)[descKey]} onChange={(e) => set({ [descKey]: e.target.value } as any)} placeholder={placeholder} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Autorizações</h3>
          <div className="space-y-3">
            {[
              { key: 'autoriza_atividades', label: 'Autorizo a participação em atividades escolares (passeios, eventos, etc.)' },
              { key: 'autoriza_emergencia', label: 'Autorizo atendimento emergencial' },
              { key: 'autoriza_imagem', label: 'Autorizo uso de imagem para fins pedagógicos' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                <input type="checkbox" checked={(alunoForm as any)[key]} onChange={(e) => set({ [key]: e.target.checked } as any)}
                  className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Documentos Entregues</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'doc_certidao_nascimento', label: 'Certidão de Nascimento' },
              { key: 'doc_cpf_aluno', label: 'CPF da Criança' },
              { key: 'doc_rg_cpf_responsavel', label: 'RG/CPF Responsável' },
              { key: 'doc_comprovante_residencia', label: 'Comprovante Residência' },
              { key: 'doc_cartao_sus', label: 'Cartão SUS' },
              { key: 'doc_carteira_vacinacao', label: 'Carteira Vacinação' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm">
                <input type="checkbox" checked={(alunoForm as any)[key]} onChange={(e) => set({ [key]: e.target.checked } as any)}
                  className="w-4 h-4 text-primary-600 rounded" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Considerações Adicionais</h3>
          <textarea value={alunoForm.consideracoes} onChange={(e) => set({ consideracoes: e.target.value })} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Informações adicionais que o responsável deseja acrescentar..." />
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="secondary" onClick={() => setCurrentStep(1)}>
            <ChevronLeft size={18} /> Voltar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Cadastrar e Continuar <ChevronRight size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
