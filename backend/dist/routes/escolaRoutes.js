"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.get('/', controllers_1.escolaController.buscar);
router.put('/', middlewares_1.requireDiretor, controllers_1.escolaController.atualizar);
exports.default = router;
//# sourceMappingURL=escolaRoutes.js.map