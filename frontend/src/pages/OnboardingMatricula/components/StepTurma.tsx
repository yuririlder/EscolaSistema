import { ChevronLeft, Check, AlertCircle, Printer, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Responsavel, Aluno, Turma, PlanoMensalidade } from '../../../types';
import { currencyToNumber, formatCPF } from '../../../utils/masks';
import { AlunoOnboardingForm, MatriculaOnboardingForm, ResponsavelForm, TurmaOnboardingForm } from '../hooks/useOnboardingPage';

interface StepTurmaProps {
  turmaForm: TurmaOnboardingForm;
  setTurmaForm: (f: TurmaOnboardingForm) => void;
  turmasFiltradas: Turma[];
  turmas: Turma[];
  planos: PlanoMensalidade[];
  isSaving: boolean;
  alunoVinculado: boolean;
  matriculaPaga: boolean;
  createdAluno: Aluno | null;
  createdResponsavel: Responsavel | null;
  alunoForm: AlunoOnboardingForm;
  responsavelForm: ResponsavelForm;
  matriculaForm: MatriculaOnboardingForm;
  setCurrentStep: (s: number) => void;
  handleVincularTurma: (e?: React.FormEvent) => void;
  handleImprimirFichaCompleta: () => void;
  handleImprimirTermoMatricula: () => void;
  handleNovaMatricula: () => void;
  handleFinalizar: () => void;
  formatCurrency: (v: number) => string;
}

export function StepTurma({
  turmaForm, setTurmaForm, turmasFiltradas, turmas, planos, isSaving, alunoVinculado, matriculaPaga,
  createdAluno, createdResponsavel, alunoForm, responsavelForm, matriculaForm,
  setCurrentStep, handleVincularTurma, handleImprimirFichaCompleta, handleImprimirTermoMatricula,
  handleNovaMatricula, handleFinalizar, formatCurrency,
}: StepTurmaProps) {
  const anoAtual = new Date().getFullYear();

  if (!alunoVinculado) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm"><strong>Etapa 5:</strong> Vincule o aluno a uma turma para completar a matrícula.</p>
        </div>
        <form onSubmit={handleVincularTurma} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Ano Letivo" value={turmaForm.ano_letivo.toString()}
              onChange={(e) => setTurmaForm({ ...turmaForm, ano_letivo: parseInt(e.target.value) })}
              options={[
                { value: (anoAtual - 1).toString(), label: (anoAtual - 1).toString() },
                { value: anoAtual.toString(), label: anoAtual.toString() },
                { value: (anoAtual + 1).toString(), label: (anoAtual + 1).toString() },
              ]} />
            <Select label="Turma" value={turmaForm.turma_id}
              onChange={(e) => setTurmaForm({ ...turmaForm, turma_id: e.target.value })}
              options={turmasFiltradas.map((t) => ({ value: t.id, label: `${t.nome} - ${t.serie || ''} (${t.turno})` }))}
              placeholder="Selecione uma turma" required />
          </div>
          {turmasFiltradas.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={18} className="text-amber-600" />
              <p className="text-sm text-amber-700">Nenhuma turma ativa encontrada para o ano letivo {turmaForm.ano_letivo}</p>
            </div>
          )}
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => setCurrentStep(4)}>
              <ChevronLeft size={18} /> Voltar
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={!turmaForm.turma_id}>
              Vincular à Turma <Check size={18} />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const turmaSelecionada = turmas.find((t) => t.id === turmaForm.turma_id);
  const planoSelecionado = planos.find((p) => p.id === matriculaForm.plano_id);

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Matrícula Concluída!</h3>
            <p className="text-sm text-green-600">O processo de matrícula foi finalizado com sucesso.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Dados do Aluno</h4></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-gray-500">Nome:</span> {createdAluno?.nome}</p>
              <p><span className="text-gray-500">Data Nasc.:</span> {new Date(alunoForm.data_nascimento).toLocaleDateString('pt-BR')}</p>
              {alunoForm.cpf && <p><span className="text-gray-500">CPF:</span> {alunoForm.cpf}</p>}
              <p><span className="text-gray-500">Sexo:</span> {alunoForm.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
              <p><span className="text-gray-500">Matrícula:</span> {(createdAluno as any)?.matricula_numero || (createdAluno as any)?.matriculaNumero || '-'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Dados do Responsável</h4></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-gray-500">Nome:</span> {createdResponsavel?.nome}</p>
              <p><span className="text-gray-500">CPF:</span> {responsavelForm.cpf || formatCPF(createdResponsavel?.cpf || '')}</p>
              <p><span className="text-gray-500">Telefone:</span> {responsavelForm.telefone || createdResponsavel?.telefone}</p>
              {responsavelForm.email && <p><span className="text-gray-500">E-mail:</span> {responsavelForm.email}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Contatos de Emergência</h4></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {alunoForm.contato1_nome && <p><span className="text-gray-500">1º Contato:</span> {alunoForm.contato1_nome} - {alunoForm.contato1_telefone} ({alunoForm.contato1_parentesco})</p>}
              {alunoForm.contato2_nome && <p><span className="text-gray-500">2º Contato:</span> {alunoForm.contato2_nome} - {alunoForm.contato2_telefone} ({alunoForm.contato2_parentesco})</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Informações de Saúde</h4></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-gray-500">Alergias:</span> {alunoForm.possui_alergia ? alunoForm.alergia_descricao || 'Sim' : 'Não possui'}</p>
              <p><span className="text-gray-500">Restrições Alimentares:</span> {alunoForm.restricao_alimentar ? alunoForm.restricao_alimentar_descricao || 'Sim' : 'Não possui'}</p>
              <p><span className="text-gray-500">Uso de Medicamentos:</span> {alunoForm.uso_medicamento ? alunoForm.medicamento_descricao || 'Sim' : 'Não utiliza'}</p>
              <p><span className="text-gray-500">Necessidades Especiais:</span> {alunoForm.necessidade_especial ? alunoForm.necessidade_especial_descricao || 'Sim' : 'Não possui'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Autorizações</h4></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { key: 'autoriza_atividades', label: 'Atividades Externas' },
                { key: 'autoriza_emergencia', label: 'Atendimento de Emergência' },
                { key: 'autoriza_imagem', label: 'Uso de Imagem' },
              ].map(({ key, label }) => (
                <p key={key} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded ${(alunoForm as any)[key] ? 'bg-green-500' : 'bg-red-400'}`}></span>
                  <span className="text-gray-500">{label}:</span> {(alunoForm as any)[key] ? 'Autorizado' : 'Não autorizado'}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Documentos Entregues</h4></CardHeader>
            <CardContent className="space-y-1 text-sm">
              {[
                { key: 'doc_certidao_nascimento', label: 'Certidão de Nascimento' },
                { key: 'doc_cpf_aluno', label: 'CPF do Aluno' },
                { key: 'doc_rg_cpf_responsavel', label: 'RG/CPF do Responsável' },
                { key: 'doc_comprovante_residencia', label: 'Comprovante de Residência' },
                { key: 'doc_cartao_sus', label: 'Cartão SUS' },
                { key: 'doc_carteira_vacinacao', label: 'Carteira de Vacinação' },
              ].map(({ key, label }) => (
                <p key={key} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${(alunoForm as any)[key] ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {label}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Dados da Matrícula</h4></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-gray-500">Ano Letivo:</span> {matriculaForm.ano_letivo}</p>
              <p><span className="text-gray-500">Plano:</span> {planoSelecionado?.nome || '-'}</p>
              <p><span className="text-gray-500">Valor Matrícula:</span> {formatCurrency(currencyToNumber(matriculaForm.valor_matricula))}</p>
              <p><span className="text-gray-500">Status Pagamento:</span> <Badge variant={matriculaPaga ? 'success' : 'warning'}>{matriculaPaga ? 'Pago' : 'Pendente'}</Badge></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h4 className="font-semibold text-gray-700">Dados da Turma</h4></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {turmaSelecionada ? (
                <>
                  <p><span className="text-gray-500">Turma:</span> {turmaSelecionada.nome}</p>
                  <p><span className="text-gray-500">Série:</span> {turmaSelecionada.serie || '-'}</p>
                  <p><span className="text-gray-500">Turno:</span> {turmaSelecionada.turno}</p>
                  <p><span className="text-gray-500">Ano:</span> {turmaSelecionada.ano}</p>
                </>
              ) : <p>-</p>}
            </CardContent>
          </Card>
        </div>

        {alunoForm.consideracoes && (
          <div className="mt-4">
            <Card>
              <CardHeader><h4 className="font-semibold text-gray-700">Considerações Adicionais</h4></CardHeader>
              <CardContent className="text-sm"><p className="text-gray-600">{alunoForm.consideracoes}</p></CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={handleImprimirFichaCompleta} variant="secondary" className="flex items-center gap-2">
          <Printer size={18} /> Imprimir Ficha do Aluno
        </Button>
        <Button onClick={handleImprimirTermoMatricula} variant="secondary" className="flex items-center gap-2">
          <Printer size={18} /> Imprimir Termo de Matrícula
        </Button>
        <Button onClick={handleNovaMatricula} variant="secondary" className="flex items-center gap-2">
          <ArrowRight size={18} /> Nova Matrícula
        </Button>
        <Button onClick={handleFinalizar} className="flex items-center gap-2">
          <Check size={18} /> Finalizar e Imprimir
        </Button>
      </div>
    </div>
  );
}
