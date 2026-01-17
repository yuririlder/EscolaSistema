import { Request, Response } from 'express';
declare class UsuarioController {
    criar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPorId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deletar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    alterarSenha(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const usuarioController: UsuarioController;
export {};
//# sourceMappingURL=usuarioController.d.ts.map