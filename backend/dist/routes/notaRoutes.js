"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.post('/', (0, middlewares_1.validate)(middlewares_1.validateNota), controllers_1.notaController.criar);
router.get('/', controllers_1.notaController.listar);
router.get('/aluno/:alunoId', controllers_1.notaController.buscarPorAluno);
router.get('/aluno/:alunoId/boletim', controllers_1.notaController.obterBoletim);
router.get('/turma/:turmaId', controllers_1.notaController.buscarPorTurma);
router.get('/:id', controllers_1.notaController.buscarPorId);
router.put('/:id', controllers_1.notaController.atualizar);
router.delete('/:id', controllers_1.notaController.deletar);
exports.default = router;
//# sourceMappingURL=notaRoutes.js.map