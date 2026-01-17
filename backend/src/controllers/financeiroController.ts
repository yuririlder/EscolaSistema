import { Request, Response } from 'express';
import { financeiroService } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

class FinanceiroController {
  // ==================== PLANOS ====================
  
  async criarPlano(req: Request, res: Response) {
    try {
      const plano = await financeiroService.criarPlano(req.body);
      return sendCreated(res, plano, 'Plano criado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar plano', error);
      return sendError(res, error.message);
    }
  }

  async listarPlanos(req: Request, res: Response) {
    try {
      const { ativos } = req.query;
      const planos = ativos === 'true'
        ? await financeiroService.listarPlanosAtivos()
        : await financeiroService.listarPlanos();
      return sendSuccess(res, planos);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPlano(req: Request, res: Response) {
    try {
      const plano = financeiroService.buscarPlanoPorId(req.params.id);
      if (!plano) {
        return sendNotFound(res, 'Plano');
      }
      return sendSuccess(res, plano);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizarPlano(req: Request, res: Response) {
    try {
      const plano = await financeiroService.atualizarPlano(req.params.id, req.body);
      return sendSuccess(res, plano, 'Plano atualizado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletarPlano(req: Request, res: Response) {
    try {
      await financeiroService.deletarPlano(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // ==================== MATRÍCULAS ====================

  async realizarMatricula(req: Request, res: Response) {
    try {
      const matricula = await financeiroService.realizarMatricula(req.body);
      return sendCreated(res, matricula, 'Matrícula realizada com sucesso');
    } catch (error: any) {
      logger.error('Erro ao realizar matrícula', error);
      return sendError(res, error.message);
    }
  }

  async listarMatriculas(req: Request, res: Response) {
    try {
      const matriculas = await financeiroService.listarMatriculas();
      return sendSuccess(res, matriculas);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarMatricula(req: Request, res: Response) {
    try {
      const matricula = await financeiroService.buscarMatriculaPorId(req.params.id);
      if (!matricula) {
        return sendNotFound(res, 'Matrícula');
      }
      return sendSuccess(res, matricula);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizarMatricula(req: Request, res: Response) {
    try {
      const matricula = await financeiroService.atualizarMatricula(req.params.id, req.body);
      return sendSuccess(res, matricula, 'Matrícula atualizada com sucesso');
    } catch (error: any) {
      logger.error('Erro ao atualizar matrícula', error);
      return sendError(res, error.message);
    }
  }

  async cancelarMatricula(req: Request, res: Response) {
    try {
      const matricula = await financeiroService.cancelarMatricula(req.params.id);
      return sendSuccess(res, matricula, 'Matrícula cancelada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // ==================== MENSALIDADES ====================

  async listarMensalidades(req: Request, res: Response) {
    try {
      const { mes, ano, status } = req.query;
      const mensalidades = await financeiroService.listarMensalidades({
        mes: mes ? parseInt(mes as string) : undefined,
        ano: ano ? parseInt(ano as string) : undefined,
        status: status as string
      });
      return sendSuccess(res, mensalidades);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async listarInadimplentes(req: Request, res: Response) {
    try {
      const inadimplentes = await financeiroService.listarInadimplentes();
      return sendSuccess(res, inadimplentes);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarMensalidade(req: Request, res: Response) {
    try {
      const mensalidade = await financeiroService.buscarMensalidadePorId(req.params.id);
      if (!mensalidade) {
        return sendNotFound(res, 'Mensalidade');
      }
      return sendSuccess(res, mensalidade);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async registrarPagamentoMensalidade(req: Request, res: Response) {
    try {
      const mensalidade = await financeiroService.registrarPagamentoMensalidade(req.params.id, req.body);
      return sendSuccess(res, mensalidade, 'Pagamento registrado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // ==================== DESPESAS ====================

  async criarDespesa(req: Request, res: Response) {
    try {
      const despesa = await financeiroService.criarDespesa(req.body);
      return sendCreated(res, despesa, 'Despesa criada com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar despesa', error);
      return sendError(res, error.message);
    }
  }

  async listarDespesas(req: Request, res: Response) {
    try {
      const { mes, ano, categoria } = req.query;
      const despesas = await financeiroService.listarDespesas({
        mes: mes ? parseInt(mes as string) : undefined,
        ano: ano ? parseInt(ano as string) : undefined,
        categoria: categoria as string
      });
      return sendSuccess(res, despesas);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarDespesa(req: Request, res: Response) {
    try {
      const despesa = await financeiroService.buscarDespesaPorId(req.params.id);
      if (!despesa) {
        return sendNotFound(res, 'Despesa');
      }
      return sendSuccess(res, despesa);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizarDespesa(req: Request, res: Response) {
    try {
      const despesa = await financeiroService.atualizarDespesa(req.params.id, req.body);
      return sendSuccess(res, despesa, 'Despesa atualizada com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async pagarDespesa(req: Request, res: Response) {
    try {
      const despesa = await financeiroService.pagarDespesa(req.params.id, req.body);
      return sendSuccess(res, despesa, 'Despesa paga com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async deletarDespesa(req: Request, res: Response) {
    try {
      await financeiroService.deletarDespesa(req.params.id);
      return sendNoContent(res);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // ==================== PAGAMENTOS FUNCIONÁRIOS ====================

  async criarPagamentoFuncionario(req: Request, res: Response) {
    try {
      const pagamento = await financeiroService.criarPagamentoFuncionario(req.body);
      return sendCreated(res, pagamento, 'Pagamento criado com sucesso');
    } catch (error: any) {
      logger.error('Erro ao criar pagamento', error);
      return sendError(res, error.message);
    }
  }

  async gerarPagamentosMes(req: Request, res: Response) {
    try {
      const { mes, ano } = req.body;
      const pagamentos = await financeiroService.gerarPagamentosMes(mes, ano);
      return sendSuccess(res, pagamentos, `${pagamentos.length} pagamentos gerados`);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async listarPagamentosFuncionarios(req: Request, res: Response) {
    try {
      const { mes, ano } = req.query;
      const pagamentos = await financeiroService.listarPagamentosFuncionarios({
        mes: mes ? parseInt(mes as string) : undefined,
        ano: ano ? parseInt(ano as string) : undefined
      });
      return sendSuccess(res, pagamentos);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async buscarPagamentoFuncionario(req: Request, res: Response) {
    try {
      const pagamento = await financeiroService.buscarPagamentoPorId(req.params.id);
      if (!pagamento) {
        return sendNotFound(res, 'Pagamento');
      }
      return sendSuccess(res, pagamento);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async registrarPagamentoFuncionario(req: Request, res: Response) {
    try {
      const pagamento = await financeiroService.registrarPagamentoFuncionario(req.params.id, req.body);
      return sendSuccess(res, pagamento, 'Pagamento registrado com sucesso');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  // ==================== DASHBOARD ====================

  async obterDashboard(req: Request, res: Response) {
    try {
      const dashboard = await financeiroService.obterDashboard();
      return sendSuccess(res, dashboard);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async obterHistoricoAnual(req: Request, res: Response) {
    try {
      const { ano } = req.params;
      const historico = await financeiroService.obterHistoricoAnual(parseInt(ano));
      return sendSuccess(res, historico);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const financeiroController = new FinanceiroController();
