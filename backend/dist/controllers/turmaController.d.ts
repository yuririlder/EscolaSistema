import { Request, Response } from 'express';
declare class TurmaController {
    criar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarPorId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarComAlunos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    buscarComProfessores(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deletar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    vincularProfessor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    desvincularProfessor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const turmaController: TurmaController;
export {};
//# sourceMappingURL=turmaController.d.ts.map