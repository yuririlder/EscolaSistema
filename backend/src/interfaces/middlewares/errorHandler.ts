import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erro:', err);

  if (err.message) {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Erro interno do servidor' });
};

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({ error: 'Rota não encontrada' });
};
