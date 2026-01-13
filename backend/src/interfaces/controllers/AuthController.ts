import { Request, Response } from 'express';
import { AutenticarUsuarioUseCase } from '../../application/useCases/auth/AutenticarUsuarioUseCase';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const useCase = new AutenticarUsuarioUseCase();
      const result = await useCase.executar({ email, senha });

      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      return res.json(req.usuario);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
