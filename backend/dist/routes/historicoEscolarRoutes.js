"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const historicoEscolarController_1 = require("../controllers/historicoEscolarController");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
// Listar todos os históricos (com filtro opcional por ano letivo)
router.get('/', historicoEscolarController_1.historicoEscolarController.listar);
// Buscar histórico por ID
router.get('/:id', historicoEscolarController_1.historicoEscolarController.buscarPorId);
// Buscar histórico completo de um aluno
router.get('/aluno/:alunoId', historicoEscolarController_1.historicoEscolarController.buscarHistoricoAluno);
// Buscar vínculo atual de um aluno (ano corrente)
router.get('/aluno/:alunoId/atual', historicoEscolarController_1.historicoEscolarController.buscarVinculoAtual);
// Listar alunos por turma e ano letivo
router.get('/turma/:turmaId/ano/:anoLetivo', historicoEscolarController_1.historicoEscolarController.listarAlunosPorTurmaAno);
// Vincular aluno a uma turma
router.post('/', middlewares_1.requireDiretorOuSecretario, historicoEscolarController_1.historicoEscolarController.vincularAlunoTurma);
// Atualizar status do histórico
router.patch('/:id/status', middlewares_1.requireDiretorOuSecretario, historicoEscolarController_1.historicoEscolarController.atualizarStatus);
// Desvincular aluno de uma turma
router.delete('/aluno/:alunoId/ano/:anoLetivo', middlewares_1.requireDiretorOuSecretario, historicoEscolarController_1.historicoEscolarController.desvincularAlunoTurma);
exports.default = router;
//# sourceMappingURL=historicoEscolarRoutes.js.map