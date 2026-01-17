import { Request, Response } from 'express';
declare class AlunoController {
    criar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPorId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deletar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    vincularTurma(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    desvincularTurma(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const alunoController: AlunoController;
export {};
//# sourceMappingURL=alunoController.d.ts.map