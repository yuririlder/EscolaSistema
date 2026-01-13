import { Request, Response } from 'express';
import { GerenciarTurmasUseCase } from '../../application/useCases/turmas/GerenciarTurmasUseCase';

export class TurmaController {
  private useCase: GerenciarTurmasUseCase;

  constructor() {
    this.useCase = new GerenciarTurmasUseCase();
  }

  criar = async (req: Request, res: Response) => {
    try {
      const turma = await this.useCase.criar(req.body);
      return res.status(201).json(turma);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listar = async (req: Request, res: Response) => {
    try {
      const { ativas } = req.query;
      const turmas = ativas === 'true' 
        ? await this.useCase.buscarAtivas()
        : await this.useCase.buscarTodas();
      return res.json(turmas);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const turma = await this.useCase.buscarPorId(req.params.id);
      return res.json(turma);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  buscarAlunos = async (req: Request, res: Response) => {
    try {
      const turma = await this.useCase.buscarComAlunos(req.params.id);
      return res.json(turma);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  buscarProfessores = async (req: Request, res: Response) => {
    try {
      const turma = await this.useCase.buscarComProfessores(req.params.id);
      return res.json(turma);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const turma = await this.useCase.atualizar(req.params.id, req.body);
      return res.json(turma);
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

  vincularAluno = async (req: Request, res: Response) => {
    try {
      const { alunoId } = req.body;
      const aluno = await this.useCase.vincularAluno(req.params.id, alunoId);
      return res.json(aluno);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  desvincularAluno = async (req: Request, res: Response) => {
    try {
      const { alunoId } = req.body;
      await this.useCase.desvincularAluno(alunoId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  vincularProfessor = async (req: Request, res: Response) => {
    try {
      const { professorId, disciplina } = req.body;
      const vinculo = await this.useCase.vincularProfessor(req.params.id, professorId, disciplina);
      return res.json(vinculo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  desvincularProfessor = async (req: Request, res: Response) => {
    try {
      const { professorId } = req.body;
      await this.useCase.desvincularProfessor(req.params.id, professorId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
