"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.post('/login', (0, middlewares_1.validate)(middlewares_1.validateLogin), controllers_1.authController.login);
router.get('/me', middlewares_1.authMiddleware, controllers_1.authController.me);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map