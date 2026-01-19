"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeiroController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class FinanceiroController {
    // ==================== PLANOS ====================
    async criarPlano(req, res) {
        try {
            const plano = await services_1.financeiroService.criarPlano(req.body);
            return (0, response_1.sendCreated)(res, plano, 'Plano criado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar plano', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listarPlanos(req, res) {
        try {
            const { ativos } = req.query;
            const planos = ativos === 'true'
                ? await services_1.financeiroService.listarPlanosAtivos()
                : await services_1.financeiroService.listarPlanos();
            return (0, response_1.sendSuccess)(res, planos);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPlano(req, res) {
        try {
            const plano = services_1.financeiroService.buscarPlanoPorId(req.params.id);
            if (!plano) {
                return (0, response_1.sendNotFound)(res, 'Plano');
            }
            return (0, response_1.sendSuccess)(res, plano);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizarPlano(req, res) {
        try {
            const plano = await services_1.financeiroService.atualizarPlano(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, plano, 'Plano atualizado com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletarPlano(req, res) {
        try {
            await services_1.financeiroService.deletarPlano(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    // ==================== MATRÍCULAS ====================
    async realizarMatricula(req, res) {
        try {
            const matricula = await services_1.financeiroService.realizarMatricula(req.body);
            return (0, response_1.sendCreated)(res, matricula, 'Matrícula realizada com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao realizar matrícula', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listarMatriculas(req, res) {
        try {
            const matriculas = await services_1.financeiroService.listarMatriculas();
            return (0, response_1.sendSuccess)(res, matriculas);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarMatricula(req, res) {
        try {
            const matricula = await services_1.financeiroService.buscarMatriculaPorId(req.params.id);
            if (!matricula) {
                return (0, response_1.sendNotFound)(res, 'Matrícula');
            }
            return (0, response_1.sendSuccess)(res, matricula);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizarMatricula(req, res) {
        try {
            const matricula = await services_1.financeiroService.atualizarMatricula(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, matricula, 'Matrícula atualizada com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao atualizar matrícula', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async cancelarMatricula(req, res) {
        try {
            const matricula = await services_1.financeiroService.cancelarMatricula(req.params.id);
            return (0, response_1.sendSuccess)(res, matricula, 'Matrícula cancelada com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    // ==================== MENSALIDADES ====================
    async listarMensalidades(req, res) {
        try {
            const { mes, ano, status } = req.query;
            const mensalidades = await services_1.financeiroService.listarMensalidades({
                mes: mes ? parseInt(mes) : undefined,
                ano: ano ? parseInt(ano) : undefined,
                status: status
            });
            return (0, response_1.sendSuccess)(res, mensalidades);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listarInadimplentes(req, res) {
        try {
            const inadimplentes = await services_1.financeiroService.listarInadimplentes();
            return (0, response_1.sendSuccess)(res, inadimplentes);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarMensalidade(req, res) {
        try {
            const mensalidade = await services_1.financeiroService.buscarMensalidadePorId(req.params.id);
            if (!mensalidade) {
                return (0, response_1.sendNotFound)(res, 'Mensalidade');
            }
            return (0, response_1.sendSuccess)(res, mensalidade);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async registrarPagamentoMensalidade(req, res) {
        try {
            const mensalidade = await services_1.financeiroService.registrarPagamentoMensalidade(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, mensalidade, 'Pagamento registrado com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async alterarValorMensalidade(req, res) {
        try {
            const mensalidade = await services_1.financeiroService.alterarValorMensalidade(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, mensalidade, 'Valor da mensalidade alterado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao alterar valor da mensalidade', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    // ==================== DESPESAS ====================
    async criarDespesa(req, res) {
        try {
            const despesa = await services_1.financeiroService.criarDespesa(req.body);
            return (0, response_1.sendCreated)(res, despesa, 'Despesa criada com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar despesa', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listarDespesas(req, res) {
        try {
            const { mes, ano, categoria } = req.query;
            const despesas = await services_1.financeiroService.listarDespesas({
                mes: mes ? parseInt(mes) : undefined,
                ano: ano ? parseInt(ano) : undefined,
                categoria: categoria
            });
            return (0, response_1.sendSuccess)(res, despesas);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarDespesa(req, res) {
        try {
            const despesa = await services_1.financeiroService.buscarDespesaPorId(req.params.id);
            if (!despesa) {
                return (0, response_1.sendNotFound)(res, 'Despesa');
            }
            return (0, response_1.sendSuccess)(res, despesa);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async atualizarDespesa(req, res) {
        try {
            const despesa = await services_1.financeiroService.atualizarDespesa(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, despesa, 'Despesa atualizada com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async pagarDespesa(req, res) {
        try {
            const despesa = await services_1.financeiroService.pagarDespesa(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, despesa, 'Despesa paga com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async deletarDespesa(req, res) {
        try {
            await services_1.financeiroService.deletarDespesa(req.params.id);
            return (0, response_1.sendNoContent)(res);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    // ==================== PAGAMENTOS FUNCIONÁRIOS ====================
    async criarPagamentoFuncionario(req, res) {
        try {
            const pagamento = await services_1.financeiroService.criarPagamentoFuncionario(req.body);
            return (0, response_1.sendCreated)(res, pagamento, 'Pagamento criado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar pagamento', error);
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async gerarPagamentosMes(req, res) {
        try {
            const { mes, ano } = req.body;
            const pagamentos = await services_1.financeiroService.gerarPagamentosMes(mes, ano);
            return (0, response_1.sendSuccess)(res, pagamentos, `${pagamentos.length} pagamentos gerados`);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async listarPagamentosFuncionarios(req, res) {
        try {
            const { mes, ano } = req.query;
            const pagamentos = await services_1.financeiroService.listarPagamentosFuncionarios({
                mes: mes ? parseInt(mes) : undefined,
                ano: ano ? parseInt(ano) : undefined
            });
            return (0, response_1.sendSuccess)(res, pagamentos);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async buscarPagamentoFuncionario(req, res) {
        try {
            const pagamento = await services_1.financeiroService.buscarPagamentoPorId(req.params.id);
            if (!pagamento) {
                return (0, response_1.sendNotFound)(res, 'Pagamento');
            }
            return (0, response_1.sendSuccess)(res, pagamento);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async registrarPagamentoFuncionario(req, res) {
        try {
            const pagamento = await services_1.financeiroService.registrarPagamentoFuncionario(req.params.id, req.body);
            return (0, response_1.sendSuccess)(res, pagamento, 'Pagamento registrado com sucesso');
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    // ==================== DASHBOARD ====================
    async obterDashboard(req, res) {
        try {
            const dashboard = await services_1.financeiroService.obterDashboard();
            return (0, response_1.sendSuccess)(res, dashboard);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
    async obterHistoricoAnual(req, res) {
        try {
            const { ano } = req.params;
            const historico = await services_1.financeiroService.obterHistoricoAnual(parseInt(ano));
            return (0, response_1.sendSuccess)(res, historico);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message);
        }
    }
}
exports.financeiroController = new FinanceiroController();
//# sourceMappingURL=financeiroController.js.map