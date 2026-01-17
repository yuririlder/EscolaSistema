declare class ProfessorService {
    criar(data: any): Promise<any>;
    buscarTodos(incluirInativos?: boolean): Promise<any[]>;
    buscarAtivos(): Promise<any[]>;
    buscarPorId(id: string): Promise<any>;
    atualizar(id: string, data: any): Promise<any>;
    deletar(id: string): Promise<void>;
    reativar(id: string): Promise<any>;
    vincularTurma(professorId: string, turmaId: string, disciplina?: string): Promise<void>;
    desvincularTurma(professorId: string, turmaId: string): Promise<void>;
}
export declare const professorService: ProfessorService;
export {};
//# sourceMappingURL=professorService.d.ts.map