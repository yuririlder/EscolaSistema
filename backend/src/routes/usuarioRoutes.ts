import { Router } from 'express';
import { usuarioController } from '../controllers';
import { authMiddleware, requireDiretor, validate, validateUsuario } from '../middlewares';

const router = Router();

router.use(authMiddleware);
router.use(requireDiretor);

router.post('/', validate(validateUsuario), usuarioController.criar);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.put('/:id', usuarioController.atualizar);
router.delete('/:id', usuarioController.deletar);
router.patch('/:id/senha', usuarioController.alterarSenha);

export default router;
