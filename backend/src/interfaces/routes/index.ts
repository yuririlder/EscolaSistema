import { Router } from 'express';
import authRoutes from './authRoutes';
import usuarioRoutes from './usuarioRoutes';
import escolaRoutes from './escolaRoutes';
import professorRoutes from './professorRoutes';
import turmaRoutes from './turmaRoutes';
import responsavelRoutes from './responsavelRoutes';
import alunoRoutes from './alunoRoutes';
import notaRoutes from './notaRoutes';
import financeiroRoutes from './financeiroRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/escola', escolaRoutes);
router.use('/professores', professorRoutes);
router.use('/turmas', turmaRoutes);
router.use('/responsaveis', responsavelRoutes);
router.use('/alunos', alunoRoutes);
router.use('/notas', notaRoutes);
router.use('/financeiro', financeiroRoutes);

export default router;
