import { Router } from 'express';
import { escolaController } from '../controllers';
import { authMiddleware, requireDiretor } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/', escolaController.buscar);
router.put('/', requireDiretor, escolaController.atualizar);

export default router;
