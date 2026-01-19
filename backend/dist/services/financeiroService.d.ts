declare class FinanceiroService {
    criarPlano(data: any): Promise<any>;
    listarPlanos(): Promise<any[]>;
    listarPlanosAtivos(): Promise<any[]>;
    buscarPlanoPorId(id: string): Promise<any>;
    atualizarPlano(id: string, data: any): Promise<any>;
    deletarPlano(id: string): Promise<void>;
    realizarMatricula(data: any): Promise<any>;
    listarMatriculas(): Promise<any[]>;
    buscarMatriculaPorId(id: string): Promise<any>;
    atualizarMatricula(id: string, data: any): Promise<any>;
    cancelarMatricula(id: string): Promise<any>;
    /**
     * Calcula o status real da mensalidade baseado na data atual
     * - PAGO: já foi paga
     * - VENCIDA: data de vencimento passou e não foi paga
     * - PENDENTE: mês atual, ainda não venceu
     * - FUTURA: meses futuros
     */
    private calcularStatusMensalidade;
    listarMensalidades(filtros: {
        mes?: number;
        ano?: number;
        status?: string;
    }): Promise<any[]>;
    listarInadimplentes(): Promise<any[]>;
    buscarMensalidadePorId(id: string): Promise<any>;
    registrarPagamentoMensalidade(id: string, data: any): Promise<any>;
    /**
     * Altera o valor de uma mensalidade futura
     * Apenas mensalidades com status FUTURA podem ter o valor alterado
     */
    alterarValorMensalidade(id: string, data: {
        valor: number;
        motivo: string;
        aplicarEmTodas?: boolean;
    }): Promise<any>;
    criarDespesa(data: any): Promise<any>;
    listarDespesas(filtros: {
        mes?: number;
        ano?: number;
        categoria?: string;
    }): Promise<any[]>;
    buscarDespesaPorId(id: string): Promise<any>;
    atualizarDespesa(id: string, data: any): Promise<any>;
    pagarDespesa(id: string, data?: any): Promise<any>;
    deletarDespesa(id: string): Promise<void>;
    criarPagamentoFuncionario(data: any): Promise<any>;
    gerarPagamentosMes(mes: number, ano: number): Promise<any[]>;
    listarPagamentosFuncionarios(filtros: {
        mes?: number;
        ano?: number;
    }): Promise<any[]>;
    buscarPagamentoPorId(id: string): Promise<any>;
    registrarPagamentoFuncionario(id: string, data?: any): Promise<any>;
    obterDashboard(): Promise<{
        totalAlunos: number;
        totalProfessores: number;
        totalTurmas: number;
        mensalidadesPendentes: number;
        receitaMensal: number;
        despesaMensal: number;
        alunosPorTurma: {
            turma: any;
            quantidade: number;
        }[];
        mensalidadesPorStatus: {
            status: any;
            quantidade: number;
        }[];
        receitaVsDespesa: {
            mes: string;
            receita: number;
            despesa: number;
        }[];
    }>;
    obterHistoricoAnual(ano: number): Promise<{
        mes: number;
        receita: number;
        despesa: number;
        saldo: number;
    }[]>;
}
export declare const financeiroService: FinanceiroService;
export {};
//# sourceMappingURL=financeiroService.d.ts.map