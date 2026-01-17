import { Router } from 'express';
import { turmaController } from '../controllers';
import { authMiddleware, requireDiretorOuSecretario, validate, validateTurma } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.post('/', requireDiretorOuSecretario, validate(validateTurma), turmaController.criar);
router.get('/', turmaController.listar);
router.get('/:id', turmaController.buscarPorId);
router.get('/:id/alunos', turmaController.buscarComAlunos);
router.get('/:id/professores', turmaController.buscarComProfessores);
router.put('/:id', requireDiretorOuSecretario, turmaController.atualizar);
router.delete('/:id', requireDiretorOuSecretario, turmaController.deletar);

export default router;
