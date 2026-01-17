import { LoginDTO, LoginResponse } from '../types';
declare class AuthService {
    login(data: LoginDTO): Promise<LoginResponse>;
    verificarToken(token: string): Promise<any | null>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=authService.d.ts.map