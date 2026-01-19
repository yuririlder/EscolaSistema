import { Router } from 'express';
import { financeiroController } from '../controllers';
import { authMiddleware, requireDiretorOuSecretario, validate, validateMatricula } from '../middlewares';

const router = Router();

router.use(authMiddleware);
router.use(requireDiretorOuSecretario);

// Planos de Mensalidade
router.post('/planos', financeiroController.criarPlano);
router.get('/planos', financeiroController.listarPlanos);
router.get('/planos/:id', financeiroController.buscarPlano);
router.put('/planos/:id', financeiroController.atualizarPlano);
router.delete('/planos/:id', financeiroController.deletarPlano);

// Matrículas
router.post('/matriculas', validate(validateMatricula), financeiroController.realizarMatricula);
router.get('/matriculas', financeiroController.listarMatriculas);
router.get('/matriculas/:id', financeiroController.buscarMatricula);
router.put('/matriculas/:id', financeiroController.atualizarMatricula);
router.post('/matriculas/:id/cancelar', financeiroController.cancelarMatricula);

// Mensalidades
router.get('/mensalidades', financeiroController.listarMensalidades);
router.get('/mensalidades/inadimplentes', financeiroController.listarInadimplentes);
router.get('/mensalidades/:id', financeiroController.buscarMensalidade);
router.put('/mensalidades/:id', financeiroController.alterarValorMensalidade);
router.post('/mensalidades/:id/pagar', financeiroController.registrarPagamentoMensalidade);

// Despesas
router.post('/despesas', financeiroController.criarDespesa);
router.get('/despesas', financeiroController.listarDespesas);
router.get('/despesas/:id', financeiroController.buscarDespesa);
router.put('/despesas/:id', financeiroController.atualizarDespesa);
router.post('/despesas/:id/pagar', financeiroController.pagarDespesa);
router.delete('/despesas/:id', financeiroController.deletarDespesa);

// Pagamentos de Funcionários
router.post('/pagamentos-funcionarios', financeiroController.criarPagamentoFuncionario);
router.post('/pagamentos-funcionarios/gerar-mes', financeiroController.gerarPagamentosMes);
router.get('/pagamentos-funcionarios', financeiroController.listarPagamentosFuncionarios);
router.get('/pagamentos-funcionarios/:id', financeiroController.buscarPagamentoFuncionario);
router.post('/pagamentos-funcionarios/:id/pagar', financeiroController.registrarPagamentoFuncionario);

// Dashboard
router.get('/dashboard', financeiroController.obterDashboard);
router.get('/dashboard/historico/:ano', financeiroController.obterHistoricoAnual);
router.get('/historico/:ano', financeiroController.obterHistoricoAnual);

export default router;
