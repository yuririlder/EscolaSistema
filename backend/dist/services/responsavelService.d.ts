declare class ResponsavelService {
    criar(data: any): Promise<any>;
    buscarTodos(incluirInativos?: boolean): Promise<any[]>;
    buscarPorId(id: string): Promise<any>;
    buscarComFilhos(id: string): Promise<any>;
    atualizar(id: string, data: any): Promise<any>;
    deletar(id: string): Promise<void>;
    reativar(id: string): Promise<any>;
}
export declare const responsavelService: ResponsavelService;
export {};
//# sourceMappingURL=responsavelService.d.ts.map