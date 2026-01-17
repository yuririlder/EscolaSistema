import { Router } from 'express';
import { alunoController } from '../controllers';
import { authMiddleware, requireDiretorOuSecretario, validate, validateAluno } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.post('/', requireDiretorOuSecretario, validate(validateAluno), alunoController.criar);
router.get('/', alunoController.listar);
router.get('/:id', alunoController.buscarPorId);
router.put('/:id', requireDiretorOuSecretario, alunoController.atualizar);
router.delete('/:id', requireDiretorOuSecretario, alunoController.deletar);
router.post('/:id/vincular-turma', requireDiretorOuSecretario, alunoController.vincularTurma);
router.post('/:id/desvincular-turma', requireDiretorOuSecretario, alunoController.desvincularTurma);

export default router;
