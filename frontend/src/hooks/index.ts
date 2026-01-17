// Auth
export { useLogin, useLogout, useCurrentUser } from './useAuth';

// Escola
export { useEscola, useUpdateEscola } from './useEscola';

// Usuarios
export {
  useUsuarios,
  useUsuario,
  useCreateUsuario,
  useUpdateUsuario,
  useDeleteUsuario,
  useAlterarSenha,
} from './useUsuarios';

// Alunos
export {
  useAlunos,
  useAluno,
  useCreateAluno,
  useUpdateAluno,
  useDeleteAluno,
  useVincularTurma,
} from './useAlunos';

// Turmas
export {
  useTurmas,
  useTurma,
  useTurmaComAlunos,
  useTurmaComProfessores,
  useCreateTurma,
  useUpdateTurma,
  useDeleteTurma,
} from './useTurmas';

// Professores
export {
  useProfessores,
  useProfessor,
  useCreateProfessor,
  useUpdateProfessor,
  useDeleteProfessor,
  useVincularProfessorTurma,
} from './useProfessores';

// Responsaveis
export {
  useResponsaveis,
  useResponsavel,
  useResponsavelComFilhos,
  useCreateResponsavel,
  useUpdateResponsavel,
  useDeleteResponsavel,
} from './useResponsaveis';

// Notas
export {
  useNotas,
  useNotasPorAluno,
  useNotasPorTurma,
  useBoletim,
  useCreateNota,
  useUpdateNota,
  useDeleteNota,
} from './useNotas';

// Financeiro
export {
  // Planos
  usePlanos,
  useCreatePlano,
  useUpdatePlano,
  useDeletePlano,
  // Matriculas
  useMatriculas,
  useRealizarMatricula,
  useCancelarMatricula,
  // Mensalidades
  useMensalidades,
  useInadimplentes,
  usePagarMensalidade,
  // Despesas
  useDespesas,
  useCreateDespesa,
  useUpdateDespesa,
  usePagarDespesa,
  useDeleteDespesa,
  // Dashboard
  useDashboardFinanceiro,
  useHistoricoAnual,
} from './useFinanceiro';
