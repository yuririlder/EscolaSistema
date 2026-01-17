import { Request, Response } from 'express';
declare class HistoricoEscolarController {
    vincularAlunoTurma(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    desvincularAlunoTurma(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarHistoricoAluno(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarVinculoAtual(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listarAlunosPorTurmaAno(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizarStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPorId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const historicoEscolarController: HistoricoEscolarController;
export {};
//# sourceMappingURL=historicoEscolarController.d.ts.map