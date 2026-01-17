import { Request, Response } from 'express';
declare class NotaController {
    criar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPorId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPorAluno(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPorTurma(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    obterBoletim(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deletar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const notaController: NotaController;
export {};
//# sourceMappingURL=notaController.d.ts.map