import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError, sendServerError } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Erro não tratado', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  return sendServerError(res, err);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, 'Rota não encontrada', 404);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
