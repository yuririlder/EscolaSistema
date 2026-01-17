import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const validateLogin: ValidationChain[];
export declare const validateUsuario: ValidationChain[];
export declare const validateAluno: ValidationChain[];
export declare const validateResponsavel: ValidationChain[];
export declare const validateTurma: ValidationChain[];
export declare const validateNota: ValidationChain[];
export declare const validateMatricula: ValidationChain[];
export declare const validateId: ValidationChain[];
//# sourceMappingURL=validateMiddleware.d.ts.map