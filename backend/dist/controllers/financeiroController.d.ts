import { Request, Response } from 'express';
declare class FinanceiroController {
    criarPlano(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listarPlanos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPlano(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizarPlano(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deletarPlano(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    realizarMatricula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listarMatriculas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarMatricula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizarMatricula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelarMatricula(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listarMensalidades(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listarInadimplentes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarMensalidade(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    registrarPagamentoMensalidade(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    alterarValorMensalidade(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    criarDespesa(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listarDespesas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarDespesa(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizarDespesa(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    pagarDespesa(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deletarDespesa(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    criarPagamentoFuncionario(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    gerarPagamentosMes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listarPagamentosFuncionarios(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPagamentoFuncionario(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    registrarPagamentoFuncionario(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    obterDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    obterHistoricoAnual(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const financeiroController: FinanceiroController;
export {};
//# sourceMappingURL=financeiroController.d.ts.map