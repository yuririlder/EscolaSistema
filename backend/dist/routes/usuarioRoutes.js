"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.use(middlewares_1.requireDiretor);
router.post('/', (0, middlewares_1.validate)(middlewares_1.validateUsuario), controllers_1.usuarioController.criar);
router.get('/', controllers_1.usuarioController.listar);
router.get('/:id', controllers_1.usuarioController.buscarPorId);
router.put('/:id', controllers_1.usuarioController.atualizar);
router.delete('/:id', controllers_1.usuarioController.deletar);
router.patch('/:id/senha', controllers_1.usuarioController.alterarSenha);
exports.default = router;
//# sourceMappingURL=usuarioRoutes.js.map