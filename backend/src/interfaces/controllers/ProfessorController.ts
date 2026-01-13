import { Request, Response } from 'express';
import { GerenciarProfessoresUseCase } from '../../application/useCases/professores/GerenciarProfessoresUseCase';

export class ProfessorController {
  private useCase: GerenciarProfessoresUseCase;

  constructor() {
    this.useCase = new GerenciarProfessoresUseCase();
  }

  criar = async (req: Request, res: Response) => {
    try {
      const professor = await this.useCase.criar(req.body);
      return res.status(201).json(professor);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listar = async (req: Request, res: Response) => {
    try {
      const professores = await this.useCase.buscarTodos();
      return res.json(professores);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const professor = await this.useCase.buscarPorId(req.params.id);
      return res.json(professor);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const professor = await this.useCase.atualizar(req.params.id, req.body);
      return res.json(professor);
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

  vincularTurma = async (req: Request, res: Response) => {
    try {
      const { turmaId, disciplina } = req.body;
      const vinculo = await this.useCase.vincularTurma(req.params.id, turmaId, disciplina);
      return res.json(vinculo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  desvincularTurma = async (req: Request, res: Response) => {
    try {
      const { turmaId } = req.body;
      await this.useCase.desvincularTurma(req.params.id, turmaId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
