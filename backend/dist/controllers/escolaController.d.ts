import { Request, Response } from 'express';
declare class EscolaController {
    buscar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    atualizar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const escolaController: EscolaController;
export {};
//# sourceMappingURL=escolaController.d.ts.map