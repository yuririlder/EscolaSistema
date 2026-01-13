import { Request, Response } from 'express';
import { GerenciarNotasUseCase } from '../../application/useCases/notas/GerenciarNotasUseCase';

export class NotaController {
  private useCase: GerenciarNotasUseCase;

  constructor() {
    this.useCase = new GerenciarNotasUseCase();
  }

  lancar = async (req: Request, res: Response) => {
    try {
      const nota = await this.useCase.lancar(req.body);
      return res.status(201).json(nota);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPorAluno = async (req: Request, res: Response) => {
    try {
      const { bimestre } = req.query;
      
      let notas;
      if (bimestre) {
        notas = await this.useCase.buscarPorAlunoEBimestre(
          req.params.alunoId, 
          parseInt(bimestre as string)
        );
      } else {
        notas = await this.useCase.buscarPorAluno(req.params.alunoId);
      }
      
      return res.json(notas);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPorTurma = async (req: Request, res: Response) => {
    try {
      const notas = await this.useCase.buscarPorTurma(req.params.turmaId);
      return res.json(notas);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarBoletim = async (req: Request, res: Response) => {
    try {
      const boletim = await this.useCase.buscarBoletim(req.params.alunoId);
      return res.json(boletim);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const nota = await this.useCase.atualizar(req.params.id, req.body);
      return res.json(nota);
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
