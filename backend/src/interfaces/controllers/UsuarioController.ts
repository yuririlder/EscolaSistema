import { Request, Response } from 'express';
import { GerenciarUsuariosUseCase } from '../../application/useCases/usuarios/GerenciarUsuariosUseCase';

export class UsuarioController {
  private useCase: GerenciarUsuariosUseCase;

  constructor() {
    this.useCase = new GerenciarUsuariosUseCase();
  }

  criar = async (req: Request, res: Response) => {
    try {
      const usuario = await this.useCase.criar(req.body);
      return res.status(201).json(usuario);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  listar = async (req: Request, res: Response) => {
    try {
      const usuarios = await this.useCase.buscarTodos();
      return res.json(usuarios);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const usuario = await this.useCase.buscarPorId(req.params.id);
      return res.json(usuario);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const usuario = await this.useCase.atualizar(req.params.id, req.body);
      return res.json(usuario);
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

  alterarSenha = async (req: Request, res: Response) => {
    try {
      const { senhaAtual, novaSenha } = req.body;
      await this.useCase.alterarSenha(req.params.id, senhaAtual, novaSenha);
      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
