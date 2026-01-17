import { Router } from 'express';
import { historicoEscolarController } from '../controllers/historicoEscolarController';
import { authMiddleware, requireDiretorOuSecretario } from '../middlewares';

const router = Router();

router.use(authMiddleware);

// Listar todos os históricos (com filtro opcional por ano letivo)
router.get('/', historicoEscolarController.listar);

// Buscar histórico por ID
router.get('/:id', historicoEscolarController.buscarPorId);

// Buscar histórico completo de um aluno
router.get('/aluno/:alunoId', historicoEscolarController.buscarHistoricoAluno);

// Buscar vínculo atual de um aluno (ano corrente)
router.get('/aluno/:alunoId/atual', historicoEscolarController.buscarVinculoAtual);

// Listar alunos por turma e ano letivo
router.get('/turma/:turmaId/ano/:anoLetivo', historicoEscolarController.listarAlunosPorTurmaAno);

// Vincular aluno a uma turma
router.post('/', requireDiretorOuSecretario, historicoEscolarController.vincularAlunoTurma);

// Atualizar status do histórico
router.patch('/:id/status', requireDiretorOuSecretario, historicoEscolarController.atualizarStatus);

// Desvincular aluno de uma turma
router.delete('/aluno/:alunoId/ano/:anoLetivo', requireDiretorOuSecretario, historicoEscolarController.desvincularAlunoTurma);

export default router;
