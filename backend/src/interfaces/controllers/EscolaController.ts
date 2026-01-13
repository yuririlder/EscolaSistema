import { Request, Response } from 'express';
import { GerenciarEscolaUseCase } from '../../application/useCases/escola/GerenciarEscolaUseCase';

export class EscolaController {
  private useCase: GerenciarEscolaUseCase;

  constructor() {
    this.useCase = new GerenciarEscolaUseCase();
  }

  buscar = async (req: Request, res: Response) => {
    try {
      const escola = await this.useCase.buscarDados();
      if (!escola) {
        return res.status(404).json({ error: 'Dados da escola não cadastrados' });
      }
      return res.json(escola);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  salvar = async (req: Request, res: Response) => {
    try {
      const escola = await this.useCase.criarOuAtualizar(req.body);
      return res.json(escola);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
