import { Router } from 'express';
import { responsavelController } from '../controllers';
import { authMiddleware, requireDiretorOuSecretario, validate, validateResponsavel } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.post('/', requireDiretorOuSecretario, validate(validateResponsavel), responsavelController.criar);
router.get('/', responsavelController.listar);
router.get('/:id', responsavelController.buscarPorId);
router.get('/:id/filhos', responsavelController.buscarComFilhos);
router.put('/:id', requireDiretorOuSecretario, responsavelController.atualizar);
router.delete('/:id', requireDiretorOuSecretario, responsavelController.deletar);

export default router;
