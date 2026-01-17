declare class AlunoService {
    criar(data: any): Promise<any>;
    buscarTodos(): Promise<any[]>;
    buscarMatriculados(): Promise<any[]>;
    buscarPorResponsavel(responsavelId: string): Promise<any[]>;
    buscarPorTurma(turmaId: string): Promise<any[]>;
    buscarPorId(id: string): Promise<any>;
    atualizar(id: string, data: any): Promise<any>;
    deletar(id: string): Promise<void>;
    vincularTurma(alunoId: string, turmaId: string): Promise<any>;
    desvincularTurma(alunoId: string): Promise<any>;
}
export declare const alunoService: AlunoService;
export {};
//# sourceMappingURL=alunoService.d.ts.map