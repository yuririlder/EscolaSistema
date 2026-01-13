import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware, requireDiretor } from '../middlewares/authMiddleware';

const router = Router();
const controller = new UsuarioController();

// Todas as rotas requerem autenticação e perfil de Diretor
router.use(authMiddleware);
router.use(requireDiretor);

router.post('/', controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);
router.post('/:id/alterar-senha', controller.alterarSenha);

export default router;
