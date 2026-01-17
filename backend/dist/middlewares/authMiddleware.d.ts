import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            usuario?: {
                id: string;
                email: string;
                perfil: string;
            };
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireDiretor: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireDiretorOuSecretario: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAnyAuth: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=authMiddleware.d.ts.map