import { CreateUsuarioDTO } from '../types';
declare class UsuarioService {
    criar(data: CreateUsuarioDTO): Promise<any>;
    buscarTodos(): Promise<any[]>;
    buscarPorId(id: string): Promise<any>;
    buscarPorEmail(email: string): Promise<any>;
    atualizar(id: string, data: any): Promise<any>;
    alterarSenha(id: string, novaSenha: string): Promise<void>;
    deletar(id: string): Promise<void>;
}
export declare const usuarioService: UsuarioService;
export {};
//# sourceMappingURL=usuarioService.d.ts.map