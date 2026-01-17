"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const usuarioRoutes_1 = __importDefault(require("./usuarioRoutes"));
const escolaRoutes_1 = __importDefault(require("./escolaRoutes"));
const alunoRoutes_1 = __importDefault(require("./alunoRoutes"));
const responsavelRoutes_1 = __importDefault(require("./responsavelRoutes"));
const turmaRoutes_1 = __importDefault(require("./turmaRoutes"));
const professorRoutes_1 = __importDefault(require("./professorRoutes"));
const notaRoutes_1 = __importDefault(require("./notaRoutes"));
const financeiroRoutes_1 = __importDefault(require("./financeiroRoutes"));
const historicoEscolarRoutes_1 = __importDefault(require("./historicoEscolarRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/usuarios', usuarioRoutes_1.default);
router.use('/escola', escolaRoutes_1.default);
router.use('/alunos', alunoRoutes_1.default);
router.use('/responsaveis', responsavelRoutes_1.default);
router.use('/turmas', turmaRoutes_1.default);
router.use('/professores', professorRoutes_1.default);
router.use('/notas', notaRoutes_1.default);
router.use('/financeiro', financeiroRoutes_1.default);
router.use('/historico-escolar', historicoEscolarRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map