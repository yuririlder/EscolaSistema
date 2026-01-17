declare class NotaService {
    criar(data: any): Promise<any>;
    buscarTodas(): Promise<any[]>;
    buscarPorId(id: string): Promise<any>;
    buscarPorAluno(alunoId: string): Promise<any[]>;
    buscarPorTurma(turmaId: string): Promise<any[]>;
    obterBoletim(alunoId: string): Promise<{
        aluno: any;
        disciplinas: any[];
    }>;
    atualizar(id: string, data: any): Promise<any>;
    deletar(id: string): Promise<void>;
}
export declare const notaService: NotaService;
export {};
//# sourceMappingURL=notaService.d.ts.map