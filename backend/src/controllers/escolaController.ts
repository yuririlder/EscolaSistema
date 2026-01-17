import { Request, Response } from 'express';
import { escolaService } from '../services';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

class EscolaController {
  async buscar(req: Request, res: Response) {
    try {
      const escola = await escolaService.buscar();
      if (!escola) {
        return sendNotFound(res, 'Escola');
      }
      return sendSuccess(res, escola);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const escola = await escolaService.atualizar(req.body);
      return sendSuccess(res, escola, 'Dados da escola atualizados');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  }
}

export const escolaController = new EscolaController();
