import { Request, Response } from 'express';
import { GerenciarAlunosUseCase } from '../../application/useCases/alunos/GerenciarAlunosUseCase';

export class AlunoController {
  private useCase: GerenciarAlunosUseCase;

  constructor() {
    this.useCase = new GerenciarAlunosUseCase();
  }

  criar = async (req: Request, res: Response) => {
    try {
      const aluno = await this.useCase.criar(req.body);
      return res.status(201).json(aluno);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listar = async (req: Request, res: Response) => {
    try {
      const { matriculados, responsavelId, turmaId } = req.query;
      
      let alunos;
      if (matriculados === 'true') {
        alunos = await this.useCase.buscarMatriculados();
      } else if (responsavelId) {
        alunos = await this.useCase.buscarPorResponsavel(responsavelId as string);
      } else if (turmaId) {
        alunos = await this.useCase.buscarPorTurma(turmaId as string);
      } else {
        alunos = await this.useCase.buscarTodos();
      }
      
      return res.json(alunos);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const aluno = await this.useCase.buscarPorId(req.params.id);
      return res.json(aluno);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const aluno = await this.useCase.atualizar(req.params.id, req.body);
      return res.json(aluno);
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
      const { turmaId } = req.body;
      const aluno = await this.useCase.vincularTurma(req.params.id, turmaId);
      return res.json(aluno);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  desvincularTurma = async (req: Request, res: Response) => {
    try {
      const aluno = await this.useCase.desvincularTurma(req.params.id);
      return res.json(aluno);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
