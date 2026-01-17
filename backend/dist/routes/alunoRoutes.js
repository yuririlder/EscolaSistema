"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.post('/', middlewares_1.requireDiretorOuSecretario, (0, middlewares_1.validate)(middlewares_1.validateAluno), controllers_1.alunoController.criar);
router.get('/', controllers_1.alunoController.listar);
router.get('/:id', controllers_1.alunoController.buscarPorId);
router.put('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.alunoController.atualizar);
router.delete('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.alunoController.deletar);
router.post('/:id/vincular-turma', middlewares_1.requireDiretorOuSecretario, controllers_1.alunoController.vincularTurma);
router.post('/:id/desvincular-turma', middlewares_1.requireDiretorOuSecretario, controllers_1.alunoController.desvincularTurma);
exports.default = router;
//# sourceMappingURL=alunoRoutes.js.map