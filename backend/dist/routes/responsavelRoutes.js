"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.post('/', middlewares_1.requireDiretorOuSecretario, (0, middlewares_1.validate)(middlewares_1.validateResponsavel), controllers_1.responsavelController.criar);
router.get('/', controllers_1.responsavelController.listar);
router.get('/:id', controllers_1.responsavelController.buscarPorId);
router.get('/:id/filhos', controllers_1.responsavelController.buscarComFilhos);
router.put('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.responsavelController.atualizar);
router.delete('/:id', middlewares_1.requireDiretorOuSecretario, controllers_1.responsavelController.deletar);
exports.default = router;
//# sourceMappingURL=responsavelRoutes.js.map