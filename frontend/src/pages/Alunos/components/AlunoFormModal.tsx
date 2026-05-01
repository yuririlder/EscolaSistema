import { UserCheck, Heart, FileCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { MaskedInput } from '../../../components/ui/MaskedInput';
import { Autocomplete } from '../../../components/ui/Autocomplete';
import { Turma } from '../../../types';
import { PARENTESCO_OPTIONS } from '../../../utils/constants';
import { AlunoFormData, AlunoTab } from '../hooks/useAlunosPage';

interface AlunoFormModalProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent) => void;
  formData: AlunoFormData; setFormData: (d: AlunoFormData) => void;
  editingAluno: any; isSaving: boolean; activeTab: AlunoTab;
  setActiveTab: (t: AlunoTab) => void;
  responsavelOptions: { value: string; label: string }[];
  turmas: Turma[];
}

export function AlunoFormModal({
  isOpen, onClose, onSubmit, formData, setFormData, editingAluno, isSaving,
  activeTab, setActiveTab, responsavelOptions, turmas,
}: AlunoFormModalProps) {
  const set = (patch: Partial<AlunoFormData>) => setFormData({ ...formData, ...patch });
  const tabClass = (tab: AlunoTab) =>
    `px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingAluno ? 'Editar Aluno' : 'Novo Aluno'} size="xl">
      <form onSubmit={onSubmit}>
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button type="button" onClick={() => setActiveTab('dados')} className={tabClass('dados')}>
            <UserCheck size={16} /> Dados e Contatos
          </button>
          <button type="button" onClick={() => setActiveTab('saude')} className={tabClass('saude')}>
            <Heart size={16} /> Saúde
          </button>
          <button type="button" onClick={() => setActiveTab('autorizacoes')} className={tabClass('autorizacoes')}>
            <FileCheck size={16} /> Autorizações
          </button>
          <button type="button" onClick={() => setActiveTab('documentos')} className={tabClass('documentos')}>
            <AlertCircle size={16} /> Documentos
          </button>
        </div>

        {/* Dados e Contatos */}
        {activeTab === 'dados' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Dados do Aluno</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input label="Nome Completo" value={formData.nome} onChange={(e) => set({ nome: e.target.value })} required />
                </div>
                <Input label="Data de Nascimento" type="date" value={formData.data_nascimento} onChange={(e) => set({ data_nascimento: e.target.value })} required />
                <MaskedInput label="CPF" mask="cpf" value={formData.cpf} onChange={(v) => set({ cpf: v })} placeholder="000.000.000-00" />
                <Select label="Gênero" value={formData.sexo} onChange={(e) => set({ sexo: e.target.value })}
                  options={[{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }, { value: 'O', label: 'Outro' }]} />
                <Select label="Turma" value={formData.turma_id} onChange={(e) => set({ turma_id: e.target.value })}
                  options={turmas.map((t) => ({ value: t.id, label: `${t.nome} - ${t.serie || t.turno}` }))}
                  placeholder="Selecione uma turma" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filiação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome do Pai" value={formData.nome_pai} onChange={(e) => set({ nome_pai: e.target.value })} placeholder="Nome completo do pai" />
                <Input label="Nome da Mãe" value={formData.nome_mae} onChange={(e) => set({ nome_mae: e.target.value })} placeholder="Nome completo da mãe" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Responsável Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Autocomplete label="Responsável" value={formData.responsavel_id} options={responsavelOptions}
                  onChange={(v) => set({ responsavel_id: v })} placeholder="Digite o nome do responsável..." required />
                <Select label="Parentesco com Responsável" value={formData.parentesco_responsavel}
                  onChange={(e) => set({ parentesco_responsavel: e.target.value })}
                  options={PARENTESCO_OPTIONS} placeholder="Selecione" required />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Contatos de Emergência</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Contato 1</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Nome" value={formData.contato1_nome} onChange={(e) => set({ contato1_nome: e.target.value })} required />
                    <MaskedInput label="Telefone" mask="phone" value={formData.contato1_telefone}
                      onChange={(v) => set({ contato1_telefone: v })} placeholder="(00) 00000-0000" required />
                    <Select label="Parentesco" value={formData.contato1_parentesco}
                      onChange={(e) => set({ contato1_parentesco: e.target.value })}
                      options={PARENTESCO_OPTIONS} placeholder="Selecione" required />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Contato 2</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Nome" value={formData.contato2_nome} onChange={(e) => set({ contato2_nome: e.target.value })} required />
                    <MaskedInput label="Telefone" mask="phone" value={formData.contato2_telefone}
                      onChange={(v) => set({ contato2_telefone: v })} placeholder="(00) 00000-0000" required />
                    <Select label="Parentesco" value={formData.contato2_parentesco}
                      onChange={(e) => set({ contato2_parentesco: e.target.value })}
                      options={PARENTESCO_OPTIONS} placeholder="Selecione" required />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saúde */}
        {activeTab === 'saude' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Informações de Saúde</h3>
            {[
              { key: 'possui_alergia', label: 'Possui alergias?', descKey: 'alergia_descricao', descLabel: 'Quais alergias?', placeholder: 'Descreva as alergias...' },
              { key: 'restricao_alimentar', label: 'Possui restrição alimentar?', descKey: 'restricao_alimentar_descricao', descLabel: 'Quais restrições?', placeholder: 'Descreva as restrições alimentares...' },
              { key: 'uso_medicamento', label: 'Faz uso contínuo de medicamento?', descKey: 'medicamento_descricao', descLabel: 'Quais medicamentos?', placeholder: 'Descreva os medicamentos em uso...' },
              { key: 'necessidade_especial', label: 'Possui necessidades especiais ou laudo médico?', descKey: 'necessidade_especial_descricao', descLabel: 'Quais necessidades/laudos?', placeholder: 'Descreva as necessidades especiais ou laudos...' },
            ].map(({ key, label, descKey, descLabel, placeholder }) => (
              <div key={key} className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(formData as any)[key]}
                    onChange={(e) => set({ [key]: e.target.checked } as any)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  <span className="font-medium">{label}</span>
                </label>
                {(formData as any)[key] && (
                  <div className="mt-3">
                    <Input label={descLabel} value={(formData as any)[descKey]}
                      onChange={(e) => set({ [descKey]: e.target.value } as any)} placeholder={placeholder} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Autorizações */}
        {activeTab === 'autorizacoes' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Autorizações</h3>
            {[
              { key: 'autoriza_atividades', label: 'Autorizo a participação em atividades escolares', desc: 'Passeios, eventos, apresentações e outras atividades pedagógicas' },
              { key: 'autoriza_emergencia', label: 'Autorizo atendimento emergencial', desc: 'Em caso de emergência, autorizo a escola a encaminhar o aluno para atendimento médico' },
              { key: 'autoriza_imagem', label: 'Autorizo uso de imagem para fins pedagógicos', desc: 'Fotos e vídeos em atividades escolares para uso interno e divulgação da escola' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={(formData as any)[key]}
                    onChange={(e) => set({ [key]: e.target.checked } as any)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  <span className="font-medium">{label}</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Documentos */}
        {activeTab === 'documentos' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Check-list de Documentos Entregues</h3>
            <p className="text-xs text-gray-500 mb-4">Marque os documentos que foram entregues para arquivo na escola</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'doc_certidao_nascimento', label: 'Certidão de Nascimento' },
                { key: 'doc_cpf_aluno', label: 'CPF da Criança' },
                { key: 'doc_rg_cpf_responsavel', label: 'RG e CPF do Responsável' },
                { key: 'doc_comprovante_residencia', label: 'Comprovante de Residência' },
                { key: 'doc_cartao_sus', label: 'Cartão SUS' },
                { key: 'doc_carteira_vacinacao', label: 'Carteira de Vacinação' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={(formData as any)[key]}
                    onChange={(e) => set({ [key]: e.target.checked } as any)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Considerações Adicionais</h3>
              <textarea value={formData.consideracoes} onChange={(e) => set({ consideracoes: e.target.value })} rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Informações adicionais que o responsável deseja acrescentar..." />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{editingAluno ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
