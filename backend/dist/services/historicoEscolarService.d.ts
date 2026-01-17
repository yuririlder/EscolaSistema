declare class HistoricoEscolarService {
    /**
     * Vincular aluno a uma turma em um ano letivo específico
     */
    vincularAlunoTurma(data: {
        aluno_id: string;
        turma_id: string;
        ano_letivo: number;
        observacoes?: string;
    }): Promise<any>;
    /**
     * Desvincular aluno de uma turma
     */
    desvincularAlunoTurma(alunoId: string, anoLetivo: number): Promise<void>;
    /**
     * Buscar histórico completo de um aluno
     */
    buscarHistoricoAluno(alunoId: string): Promise<any[]>;
    /**
     * Buscar histórico por ID
     */
    buscarPorId(id: string): Promise<any>;
    /**
     * Buscar vínculo atual do aluno (ano corrente)
     */
    buscarVinculoAtual(alunoId: string): Promise<any>;
    /**
     * Listar alunos por turma e ano letivo
     */
    listarAlunosPorTurmaAno(turmaId: string, anoLetivo: number): Promise<any[]>;
    /**
     * Atualizar status do histórico (CURSANDO, APROVADO, REPROVADO, TRANSFERIDO)
     */
    atualizarStatus(id: string, status: string, observacoes?: string): Promise<any>;
    /**
     * Buscar todos os históricos (para admin)
     */
    buscarTodos(anoLetivo?: number): Promise<any[]>;
}
export declare const historicoEscolarService: HistoricoEscolarService;
export {};
//# sourceMappingURL=historicoEscolarService.d.ts.map