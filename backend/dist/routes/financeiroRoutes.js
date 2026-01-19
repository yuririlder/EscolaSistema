"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authMiddleware);
router.use(middlewares_1.requireDiretorOuSecretario);
// Planos de Mensalidade
router.post('/planos', controllers_1.financeiroController.criarPlano);
router.get('/planos', controllers_1.financeiroController.listarPlanos);
router.get('/planos/:id', controllers_1.financeiroController.buscarPlano);
router.put('/planos/:id', controllers_1.financeiroController.atualizarPlano);
router.delete('/planos/:id', controllers_1.financeiroController.deletarPlano);
// Matrículas
router.post('/matriculas', (0, middlewares_1.validate)(middlewares_1.validateMatricula), controllers_1.financeiroController.realizarMatricula);
router.get('/matriculas', controllers_1.financeiroController.listarMatriculas);
router.get('/matriculas/:id', controllers_1.financeiroController.buscarMatricula);
router.put('/matriculas/:id', controllers_1.financeiroController.atualizarMatricula);
router.post('/matriculas/:id/cancelar', controllers_1.financeiroController.cancelarMatricula);
// Mensalidades
router.get('/mensalidades', controllers_1.financeiroController.listarMensalidades);
router.get('/mensalidades/inadimplentes', controllers_1.financeiroController.listarInadimplentes);
router.get('/mensalidades/:id', controllers_1.financeiroController.buscarMensalidade);
router.put('/mensalidades/:id', controllers_1.financeiroController.alterarValorMensalidade);
router.post('/mensalidades/:id/pagar', controllers_1.financeiroController.registrarPagamentoMensalidade);
// Despesas
router.post('/despesas', controllers_1.financeiroController.criarDespesa);
router.get('/despesas', controllers_1.financeiroController.listarDespesas);
router.get('/despesas/:id', controllers_1.financeiroController.buscarDespesa);
router.put('/despesas/:id', controllers_1.financeiroController.atualizarDespesa);
router.post('/despesas/:id/pagar', controllers_1.financeiroController.pagarDespesa);
router.delete('/despesas/:id', controllers_1.financeiroController.deletarDespesa);
// Pagamentos de Funcionários
router.post('/pagamentos-funcionarios', controllers_1.financeiroController.criarPagamentoFuncionario);
router.post('/pagamentos-funcionarios/gerar-mes', controllers_1.financeiroController.gerarPagamentosMes);
router.get('/pagamentos-funcionarios', controllers_1.financeiroController.listarPagamentosFuncionarios);
router.get('/pagamentos-funcionarios/:id', controllers_1.financeiroController.buscarPagamentoFuncionario);
router.post('/pagamentos-funcionarios/:id/pagar', controllers_1.financeiroController.registrarPagamentoFuncionario);
// Dashboard
router.get('/dashboard', controllers_1.financeiroController.obterDashboard);
router.get('/dashboard/historico/:ano', controllers_1.financeiroController.obterHistoricoAnual);
router.get('/historico/:ano', controllers_1.financeiroController.obterHistoricoAnual);
exports.default = router;
//# sourceMappingURL=financeiroRoutes.js.map