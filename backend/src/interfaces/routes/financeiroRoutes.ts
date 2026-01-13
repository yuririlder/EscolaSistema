import { Router } from 'express';
import { FinanceiroController } from '../controllers/FinanceiroController';
import { authMiddleware, requireDiretorOuSecretario } from '../middlewares/authMiddleware';

const router = Router();
const controller = new FinanceiroController();

router.use(authMiddleware);
router.use(requireDiretorOuSecretario);

// Planos de Mensalidade
router.post('/planos', controller.criarPlano);
router.get('/planos', controller.listarPlanos);
router.put('/planos/:id', controller.atualizarPlano);
router.delete('/planos/:id', controller.deletarPlano);

// Matrículas
router.post('/matriculas', controller.realizarMatricula);
router.get('/matriculas', controller.listarMatriculas);
router.get('/matriculas/:id', controller.buscarMatricula);
router.post('/matriculas/:id/cancelar', controller.cancelarMatricula);
router.get('/matriculas/:id/termo', controller.gerarTermoMatricula);

// Mensalidades
router.get('/mensalidades', controller.listarMensalidades);
router.get('/mensalidades/inadimplentes', controller.listarInadimplentes);
router.get('/mensalidades/:id', controller.buscarMensalidade);
router.post('/mensalidades/:id/pagar', controller.registrarPagamentoMensalidade);
router.get('/mensalidades/:id/comprovante', controller.gerarComprovanteMensalidade);

// Despesas
router.post('/despesas', controller.criarDespesa);
router.get('/despesas', controller.listarDespesas);
router.get('/despesas/categorias', controller.listarCategoriasDespesas);
router.get('/despesas/:id', controller.buscarDespesa);
router.put('/despesas/:id', controller.atualizarDespesa);
router.post('/despesas/:id/pagar', controller.pagarDespesa);
router.delete('/despesas/:id', controller.deletarDespesa);

// Pagamentos de Funcionários
router.post('/pagamentos-funcionarios', controller.criarPagamentoFuncionario);
router.post('/pagamentos-funcionarios/gerar-mes', controller.gerarPagamentosMes);
router.get('/pagamentos-funcionarios', controller.listarPagamentosFuncionarios);
router.get('/pagamentos-funcionarios/:id', controller.buscarPagamentoFuncionario);
router.post('/pagamentos-funcionarios/:id/pagar', controller.registrarPagamentoFuncionario);
router.get('/pagamentos-funcionarios/:id/comprovante', controller.gerarComprovantePagamentoFuncionario);

// Dashboard
router.get('/dashboard', controller.obterDashboard);
router.get('/dashboard/resumo', controller.obterResumoGeral);
router.get('/dashboard/historico/:ano', controller.obterHistoricoAnual);

export default router;
