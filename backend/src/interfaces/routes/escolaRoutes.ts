import { Router } from 'express';
import { EscolaController } from '../controllers/EscolaController';
import { authMiddleware, requireDiretor } from '../middlewares/authMiddleware';

const router = Router();
const controller = new EscolaController();

router.use(authMiddleware);

router.get('/', controller.buscar);
router.put('/', requireDiretor, controller.salvar);

export default router;
