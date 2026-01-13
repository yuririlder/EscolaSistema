import { Request, Response } from 'express';
import { GerenciarResponsaveisUseCase } from '../../application/useCases/responsaveis/GerenciarResponsaveisUseCase';

export class ResponsavelController {
  private useCase: GerenciarResponsaveisUseCase;

  constructor() {
    this.useCase = new GerenciarResponsaveisUseCase();
  }

  criar = async (req: Request, res: Response) => {
    try {
      const responsavel = await this.useCase.criar(req.body);
      return res.status(201).json(responsavel);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listar = async (req: Request, res: Response) => {
    try {
      const responsaveis = await this.useCase.buscarTodos();
      return res.json(responsaveis);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const responsavel = await this.useCase.buscarPorId(req.params.id);
      return res.json(responsavel);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  buscarComFilhos = async (req: Request, res: Response) => {
    try {
      const responsavel = await this.useCase.buscarComFilhos(req.params.id);
      return res.json(responsavel);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const responsavel = await this.useCase.atualizar(req.params.id, req.body);
      return res.json(responsavel);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  deletar = async (req: Request, res: Response) => {
    try {
      await this.useCase.deletar(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
