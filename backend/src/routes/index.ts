import { Router } from 'express';
import authRoutes from './authRoutes';
import usuarioRoutes from './usuarioRoutes';
import escolaRoutes from './escolaRoutes';
import alunoRoutes from './alunoRoutes';
import responsavelRoutes from './responsavelRoutes';
import turmaRoutes from './turmaRoutes';
import professorRoutes from './professorRoutes';
import notaRoutes from './notaRoutes';
import financeiroRoutes from './financeiroRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/escola', escolaRoutes);
router.use('/alunos', alunoRoutes);
router.use('/responsaveis', responsavelRoutes);
router.use('/turmas', turmaRoutes);
router.use('/professores', professorRoutes);
router.use('/notas', notaRoutes);
router.use('/financeiro', financeiroRoutes);

export default router;
