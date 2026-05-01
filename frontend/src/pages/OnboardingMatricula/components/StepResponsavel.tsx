import { ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { ESTADOS_BRASIL } from '../../../utils/constants';
import { ResponsavelForm } from '../hooks/useOnboardingPage';

interface StepResponsavelProps {
  useExistingResponsavel: boolean;
  setUseExistingResponsavel: (v: boolean) => void;
  selectedResponsavelId: string;
  setSelectedResponsavelId: (v: string) => void;
  responsavelOptions: { value: string; label: string }[];
  responsavelForm: ResponsavelForm;
  setResponsavelForm: (f: ResponsavelForm) => void;
  isSaving: boolean;
  handleCreateResponsavel: () => void;
  handleSelectExistingResponsavel: () => void;
}

export function StepResponsavel({
  useExistingResponsavel, setUseExistingResponsavel,
  selectedResponsavelId, setSelectedResponsavelId,
  responsavelOptions, responsavelForm, setResponsavelForm,
  isSaving, handleCreateResponsavel, handleSelectExistingResponsavel,
}: StepResponsavelProps) {
  const set = (patch: Partial<ResponsavelForm>) => setResponsavelForm({ ...responsavelForm, ...patch });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm"><strong>Etapa 1:</strong> Cadastre um novo responsável ou selecione um já existente no sistema.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant={!useExistingResponsavel ? 'primary' : 'secondary'} onClick={() => setUseExistingResponsavel(false)}>Novo Responsável</Button>
        <Button variant={useExistingResponsavel ? 'primary' : 'secondary'} onClick={() => setUseExistingResponsavel(true)}>Responsável Existente</Button>
      </div>

      {useExistingResponsavel ? (
        <div className="space-y-4">
          <Autocomplete label="Selecionar Responsável" value={selectedResponsavelId} options={responsavelOptions}
            onChange={setSelectedResponsavelId} placeholder="Digite o nome ou CPF do responsável..." />
          <div className="flex justify-end">
            <Button onClick={handleSelectExistingResponsavel} disabled={!selectedResponsavelId}>
              Continuar <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleCreateResponsavel(); }} className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input label="Nome Completo" value={responsavelForm.nome} onChange={(e) => set({ nome: e.target.value })} required />
              </div>
              <Input label="Data de Nascimento" type="date" value={responsavelForm.data_nascimento} onChange={(e) => set({ data_nascimento: e.target.value })} />
              <MaskedInput label="CPF" mask="cpf" value={responsavelForm.cpf} onChange={(v) => set({ cpf: v })} required />
              <Input label="RG" value={responsavelForm.rg} onChange={(e) => set({ rg: e.target.value })} />
              <Input label="Profissão" value={responsavelForm.profissao} onChange={(e) => set({ profissao: e.target.value })} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="E-mail" type="email" value={responsavelForm.email} onChange={(e) => set({ email: e.target.value })} />
              <MaskedInput label="Telefone" mask="phone" value={responsavelForm.telefone} onChange={(v) => set({ telefone: v })} required />
              <MaskedInput label="Celular" mask="phone" value={responsavelForm.celular} onChange={(v) => set({ celular: v })} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input label="Rua" value={responsavelForm.endereco} onChange={(e) => set({ endereco: e.target.value })} placeholder="Rua, Avenida, etc." />
              </div>
              <Input label="Bairro" value={responsavelForm.bairro} onChange={(e) => set({ bairro: e.target.value })} />
              <Input label="Complemento" value={responsavelForm.complemento} onChange={(e) => set({ complemento: e.target.value })} placeholder="Apto, Bloco, etc." />
              <Input label="Cidade" value={responsavelForm.cidade} onChange={(e) => set({ cidade: e.target.value })} />
              <Select label="Estado" value={responsavelForm.estado} onChange={(e) => set({ estado: e.target.value })}
                options={ESTADOS_BRASIL} placeholder="UF" />
              <MaskedInput label="CEP" mask="cep" value={responsavelForm.cep} onChange={(v) => set({ cep: v })} placeholder="00000-000" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Cadastrar e Continuar <ChevronRight size={18} />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
