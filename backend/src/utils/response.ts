import { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  } as SuccessResponse<T>);
};

export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

export const sendError = (res: Response, error: string, statusCode: number = 400, details?: any): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    details
  } as ErrorResponse);
};

export const sendNotFound = (res: Response, resource: string = 'Recurso'): Response => {
  return sendError(res, `${resource} não encontrado`, 404);
};

export const sendUnauthorized = (res: Response, message: string = 'Não autorizado'): Response => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message: string = 'Acesso negado'): Response => {
  return sendError(res, message, 403);
};

export const sendValidationError = (res: Response, errors: any[]): Response => {
  return sendError(res, 'Erro de validação', 422, errors);
};

export const sendServerError = (res: Response, error: Error): Response => {
  return sendError(res, 'Erro interno do servidor', 500, 
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
};
