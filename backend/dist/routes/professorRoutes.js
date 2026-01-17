"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.post('/', middlewares_1.requireDiretorOuSecretario, controllers_1.professorController.criar);
router.get('/', controllers_1.professorController.listar);
router.get('/:id', controllers_1.professorController.buscarPorId);
router.put('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.professorController.atualizar);
router.delete('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.professorController.deletar);
router.post('/:id/vincular-turma', middlewares_1.requireDiretorOuSecretario, controllers_1.professorController.vincularTurma);
router.post('/:id/desvincular-turma', middlewares_1.requireDiretorOuSecretario, controllers_1.professorController.desvincularTurma);
exports.default = router;
//# sourceMappingURL=professorRoutes.js.map