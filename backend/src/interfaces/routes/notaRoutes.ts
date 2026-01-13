import { Router } from 'express';
import { NotaController } from '../controllers/NotaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new NotaController();

router.use(authMiddleware);

router.post('/', controller.lancar);
router.get('/aluno/:alunoId', controller.buscarPorAluno);
router.get('/aluno/:alunoId/boletim', controller.buscarBoletim);
router.get('/turma/:turmaId', controller.buscarPorTurma);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;
