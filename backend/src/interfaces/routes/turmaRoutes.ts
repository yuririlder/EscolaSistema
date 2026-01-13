import { Router } from 'express';
import { TurmaController } from '../controllers/TurmaController';
import { authMiddleware, requireDiretorOuSecretario } from '../middlewares/authMiddleware';

const router = Router();
const controller = new TurmaController();

router.use(authMiddleware);

router.post('/', requireDiretorOuSecretario, controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.get('/:id/alunos', controller.buscarAlunos);
router.get('/:id/professores', controller.buscarProfessores);
router.put('/:id', requireDiretorOuSecretario, controller.atualizar);
router.delete('/:id', requireDiretorOuSecretario, controller.deletar);
router.post('/:id/vincular-aluno', requireDiretorOuSecretario, controller.vincularAluno);
router.post('/:id/desvincular-aluno', requireDiretorOuSecretario, controller.desvincularAluno);
router.post('/:id/vincular-professor', requireDiretorOuSecretario, controller.vincularProfessor);
router.post('/:id/desvincular-professor', requireDiretorOuSecretario, controller.desvincularProfessor);

export default router;
