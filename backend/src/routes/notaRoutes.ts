import { Router } from 'express';
import { notaController } from '../controllers';
import { authMiddleware, validate, validateNota } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(validateNota), notaController.criar);
router.get('/', notaController.listar);
router.get('/aluno/:alunoId', notaController.buscarPorAluno);
router.get('/aluno/:alunoId/boletim', notaController.obterBoletim);
router.get('/turma/:turmaId', notaController.buscarPorTurma);
router.get('/:id', notaController.buscarPorId);
router.put('/:id', notaController.atualizar);
router.delete('/:id', notaController.deletar);

export default router;
