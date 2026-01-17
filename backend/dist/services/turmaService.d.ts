declare class TurmaService {
    criar(data: any): Promise<any>;
    buscarTodas(): Promise<any[]>;
    buscarAtivas(): Promise<any[]>;
    buscarPorId(id: string): Promise<any>;
    buscarComAlunos(id: string): Promise<any>;
    buscarComProfessores(id: string): Promise<any>;
    atualizar(id: string, data: any): Promise<any>;
    deletar(id: string): Promise<void>;
    reativar(id: string): Promise<any>;
    vincularProfessor(turmaId: string, professorId: string, disciplina?: string): Promise<void>;
    desvincularProfessor(turmaId: string, professorId: string): Promise<void>;
}
export declare const turmaService: TurmaService;
export {};
//# sourceMappingURL=turmaService.d.ts.map