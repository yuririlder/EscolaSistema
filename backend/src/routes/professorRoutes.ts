import { Router } from 'express';
import { professorController } from '../controllers';
import { authMiddleware, requireDiretorOuSecretario } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.post('/', requireDiretorOuSecretario, professorController.criar);
router.get('/', professorController.listar);
router.get('/:id', professorController.buscarPorId);
router.put('/:id', requireDiretorOuSecretario, professorController.atualizar);
router.delete('/:id', requireDiretorOuSecretario, professorController.deletar);
router.post('/:id/vincular-turma', requireDiretorOuSecretario, professorController.vincularTurma);
router.post('/:id/desvincular-turma', requireDiretorOuSecretario, professorController.desvincularTurma);

export default router;
