"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.post('/', middlewares_1.requireDiretorOuSecretario, (0, middlewares_1.validate)(middlewares_1.validateTurma), controllers_1.turmaController.criar);
router.get('/', controllers_1.turmaController.listar);
router.get('/:id', controllers_1.turmaController.buscarPorId);
router.get('/:id/alunos', controllers_1.turmaController.buscarComAlunos);
router.get('/:id/professores', controllers_1.turmaController.buscarComProfessores);
router.post('/:id/professores/:professorId', middlewares_1.requireDiretorOuSecretario, controllers_1.turmaController.vincularProfessor);
router.delete('/:id/professores/:professorId', middlewares_1.requireDiretorOuSecretario, controllers_1.turmaController.desvincularProfessor);
router.put('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.turmaController.atualizar);
router.delete('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.turmaController.deletar);
exports.default = router;
//# sourceMappingURL=turmaRoutes.js.map