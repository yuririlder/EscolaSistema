import { Request, Response } from 'express';
import { GerenciarPlanosMensalidadeUseCase } from '../../application/useCases/financeiro/GerenciarPlanosMensalidadeUseCase';
import { GerenciarMatriculasUseCase } from '../../application/useCases/financeiro/GerenciarMatriculasUseCase';
import { GerenciarMensalidadesUseCase } from '../../application/useCases/financeiro/GerenciarMensalidadesUseCase';
import { GerenciarDespesasUseCase } from '../../application/useCases/financeiro/GerenciarDespesasUseCase';
import { GerenciarPagamentosFuncionariosUseCase } from '../../application/useCases/financeiro/GerenciarPagamentosFuncionariosUseCase';
import { DashboardFinanceiroUseCase } from '../../application/useCases/dashboard/DashboardFinanceiroUseCase';

export class FinanceiroController {
  // Planos de Mensalidade
  criarPlano = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPlanosMensalidadeUseCase();
      const plano = await useCase.criar(req.body);
      return res.status(201).json(plano);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listarPlanos = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPlanosMensalidadeUseCase();
      const { ativos } = req.query;
      const planos = ativos === 'true' 
        ? await useCase.buscarAtivos()
        : await useCase.buscarTodos();
      return res.json(planos);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  atualizarPlano = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPlanosMensalidadeUseCase();
      const plano = await useCase.atualizar(req.params.id, req.body);
      return res.json(plano);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  deletarPlano = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPlanosMensalidadeUseCase();
      await useCase.deletar(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // Matrículas
  realizarMatricula = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMatriculasUseCase();
      const matricula = await useCase.realizar(req.body);
      return res.status(201).json(matricula);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarMatricula = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMatriculasUseCase();
      const matricula = await useCase.buscarPorId(req.params.id);
      return res.json(matricula);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  listarMatriculas = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMatriculasUseCase();
      const { alunoId, anoLetivo, ativas } = req.query;

      let matriculas;
      if (alunoId) {
        matriculas = await useCase.buscarPorAluno(alunoId as string);
      } else if (anoLetivo) {
        matriculas = await useCase.buscarPorAnoLetivo(parseInt(anoLetivo as string));
      } else if (ativas === 'true') {
        matriculas = await useCase.buscarAtivas();
      } else {
        matriculas = await useCase.buscarAtivas();
      }

      return res.json(matriculas);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  cancelarMatricula = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMatriculasUseCase();
      const matricula = await useCase.cancelar(req.params.id);
      return res.json(matricula);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  gerarTermoMatricula = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMatriculasUseCase();
      const termo = await useCase.gerarTermoMatricula(req.params.id);
      return res.json(termo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // Mensalidades
  listarMensalidades = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMensalidadesUseCase();
      const { alunoId, matriculaId, mes, ano, pendentes, atrasadas } = req.query;

      let mensalidades;
      if (alunoId) {
        mensalidades = await useCase.buscarPorAluno(alunoId as string);
      } else if (matriculaId) {
        mensalidades = await useCase.buscarPorMatricula(matriculaId as string);
      } else if (mes && ano) {
        mensalidades = await useCase.buscarPorMesAno(
          parseInt(mes as string), 
          parseInt(ano as string)
        );
      } else if (pendentes === 'true') {
        mensalidades = await useCase.buscarPendentes();
      } else if (atrasadas === 'true') {
        mensalidades = await useCase.buscarAtrasadas();
      } else {
        mensalidades = await useCase.buscarPendentes();
      }

      return res.json(mensalidades);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarMensalidade = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMensalidadesUseCase();
      const mensalidade = await useCase.buscarPorId(req.params.id);
      return res.json(mensalidade);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  registrarPagamentoMensalidade = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMensalidadesUseCase();
      const mensalidade = await useCase.registrarPagamento({
        mensalidadeId: req.params.id,
        ...req.body,
      });
      return res.json(mensalidade);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  gerarComprovanteMensalidade = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMensalidadesUseCase();
      const comprovante = await useCase.gerarComprovantePagamento(req.params.id);
      return res.json(comprovante);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listarInadimplentes = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarMensalidadesUseCase();
      const inadimplentes = await useCase.listarInadimplentes();
      return res.json(inadimplentes);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // Despesas
  criarDespesa = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarDespesasUseCase();
      const despesa = await useCase.criar(req.body);
      return res.status(201).json(despesa);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listarDespesas = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarDespesasUseCase();
      const { categoria, mes, ano, pendentes } = req.query;

      let despesas;
      if (categoria) {
        despesas = await useCase.buscarPorCategoria(categoria as string);
      } else if (mes && ano) {
        despesas = await useCase.buscarPorMesAno(
          parseInt(mes as string), 
          parseInt(ano as string)
        );
      } else if (pendentes === 'true') {
        despesas = await useCase.buscarPendentes();
      } else {
        despesas = await useCase.buscarTodas();
      }

      return res.json(despesas);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarDespesa = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarDespesasUseCase();
      const despesa = await useCase.buscarPorId(req.params.id);
      return res.json(despesa);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  atualizarDespesa = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarDespesasUseCase();
      const despesa = await useCase.atualizar(req.params.id, req.body);
      return res.json(despesa);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  pagarDespesa = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarDespesasUseCase();
      const { dataPagamento } = req.body;
      const despesa = await useCase.registrarPagamento(
        req.params.id, 
        dataPagamento ? new Date(dataPagamento) : undefined
      );
      return res.json(despesa);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  deletarDespesa = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarDespesasUseCase();
      await useCase.deletar(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listarCategoriasDespesas = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarDespesasUseCase();
      const categorias = await useCase.listarCategorias();
      return res.json(categorias);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // Pagamentos de Funcionários
  criarPagamentoFuncionario = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPagamentosFuncionariosUseCase();
      const pagamento = await useCase.criar(req.body);
      return res.status(201).json(pagamento);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  gerarPagamentosMes = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPagamentosFuncionariosUseCase();
      const { mes, ano } = req.body;
      const pagamentos = await useCase.gerarPagamentosMes(mes, ano);
      return res.status(201).json(pagamentos);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listarPagamentosFuncionarios = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPagamentosFuncionariosUseCase();
      const { funcionarioId, mes, ano, pendentes } = req.query;

      let pagamentos;
      if (funcionarioId) {
        pagamentos = await useCase.buscarPorFuncionario(funcionarioId as string);
      } else if (mes && ano) {
        pagamentos = await useCase.buscarPorMesAno(
          parseInt(mes as string), 
          parseInt(ano as string)
        );
      } else if (pendentes === 'true') {
        pagamentos = await useCase.buscarPendentes();
      } else {
        pagamentos = await useCase.buscarPendentes();
      }

      return res.json(pagamentos);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPagamentoFuncionario = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPagamentosFuncionariosUseCase();
      const pagamento = await useCase.buscarPorId(req.params.id);
      return res.json(pagamento);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  registrarPagamentoFuncionario = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPagamentosFuncionariosUseCase();
      const { dataPagamento } = req.body;
      const pagamento = await useCase.registrarPagamento(
        req.params.id, 
        dataPagamento ? new Date(dataPagamento) : undefined
      );
      return res.json(pagamento);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  gerarComprovantePagamentoFuncionario = async (req: Request, res: Response) => {
    try {
      const useCase = new GerenciarPagamentosFuncionariosUseCase();
      const comprovante = await useCase.gerarComprovantePagamento(req.params.id);
      return res.json(comprovante);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // Dashboard
  obterDashboard = async (req: Request, res: Response) => {
    try {
      const useCase = new DashboardFinanceiroUseCase();
      const metricas = await useCase.obterMetricasFrontend();
      return res.json(metricas);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  obterDashboardFinanceiro = async (req: Request, res: Response) => {
    try {
      const useCase = new DashboardFinanceiroUseCase();
      const { mes, ano } = req.query;

      const hoje = new Date();
      const mesConsulta = mes ? parseInt(mes as string) : hoje.getMonth() + 1;
      const anoConsulta = ano ? parseInt(ano as string) : hoje.getFullYear();

      const dashboard = await useCase.obterDashboard(mesConsulta, anoConsulta);
      return res.json(dashboard);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  obterResumoGeral = async (req: Request, res: Response) => {
    try {
      const useCase = new DashboardFinanceiroUseCase();
      const resumo = await useCase.obterResumoGeral();
      return res.json(resumo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  obterHistoricoAnual = async (req: Request, res: Response) => {
    try {
      const useCase = new DashboardFinanceiroUseCase();
      const { ano } = req.params;
      const historico = await useCase.obterHistoricoAnual(parseInt(ano));
      return res.json(historico);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
