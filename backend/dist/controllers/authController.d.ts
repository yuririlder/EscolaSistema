import { Request, Response } from 'express';
declare class AuthController {
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    me(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    setup(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=authController.d.ts.map