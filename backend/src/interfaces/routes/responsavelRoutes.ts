import { Router } from 'express';
import { ResponsavelController } from '../controllers/ResponsavelController';
import { authMiddleware, requireDiretorOuSecretario } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ResponsavelController();

router.use(authMiddleware);

router.post('/', requireDiretorOuSecretario, controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.get('/:id/filhos', controller.buscarComFilhos);
router.put('/:id', requireDiretorOuSecretario, controller.atualizar);
router.delete('/:id', requireDiretorOuSecretario, controller.deletar);

export default router;
