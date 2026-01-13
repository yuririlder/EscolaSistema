import { Router } from 'express';
import { ProfessorController } from '../controllers/ProfessorController';
import { authMiddleware, requireDiretorOuSecretario } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ProfessorController();

router.use(authMiddleware);

router.post('/', requireDiretorOuSecretario, controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.put('/:id', requireDiretorOuSecretario, controller.atualizar);
router.delete('/:id', requireDiretorOuSecretario, controller.deletar);
router.post('/:id/vincular-turma', requireDiretorOuSecretario, controller.vincularTurma);
router.post('/:id/desvincular-turma', requireDiretorOuSecretario, controller.desvincularTurma);

export default router;
