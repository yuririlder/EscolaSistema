import { 
  MensalidadeRepository,
  DespesaRepository,
  PagamentoFuncionarioRepository,
  AlunoRepository,
  MatriculaRepository,
  TurmaRepository,
  ProfessorRepository
} from '../../../infrastructure/repositories';

interface DashboardFinanceiro {
  receitas: {
    mensalidadesPagas: number;
    totalRecebido: number;
  };
  despesas: {
    despesasPagas: number;
    salariosPagos: number;
    totalGasto: number;
  };
  pendencias: {
    mensalidadesPendentes: number;
    mensalidadesAtrasadas: number;
    valorPendente: number;
    valorAtrasado: number;
    despesasPendentes: number;
    valorDespesasPendentes: number;
    salariosPendentes: number;
    valorSalariosPendentes: number;
  };
  resumo: {
    receitaBruta: number;
    despesaTotal: number;
    lucroLiquido: number;
  };
  inadimplentes: number;
  alunosMatriculados: number;
}

export class DashboardFinanceiroUseCase {
  private mensalidadeRepository: MensalidadeRepository;
  private despesaRepository: DespesaRepository;
  private pagamentoFuncionarioRepository: PagamentoFuncionarioRepository;
  private alunoRepository: AlunoRepository;
  private matriculaRepository: MatriculaRepository;
  private turmaRepository: TurmaRepository;
  private professorRepository: ProfessorRepository;

  constructor() {
    this.mensalidadeRepository = new MensalidadeRepository();
    this.despesaRepository = new DespesaRepository();
    this.pagamentoFuncionarioRepository = new PagamentoFuncionarioRepository();
    this.alunoRepository = new AlunoRepository();
    this.matriculaRepository = new MatriculaRepository();
    this.turmaRepository = new TurmaRepository();
    this.professorRepository = new ProfessorRepository();
  }

  async obterDashboard(mes: number, ano: number): Promise<DashboardFinanceiro> {
    // Mensalidades do mês
    const mensalidades = await this.mensalidadeRepository.buscarPorMesAno(mes, ano);
    const mensalidadesPagas = mensalidades.filter(m => m.status === 'PAGO');
    const mensalidadesPendentes = mensalidades.filter(m => m.status === 'PENDENTE');
    const mensalidadesAtrasadas = mensalidades.filter(m => m.status === 'ATRASADO');

    const totalRecebido = mensalidadesPagas.reduce((acc, m) => acc + (m.valorPago || m.valor), 0);
    const valorPendente = mensalidadesPendentes.reduce((acc, m) => acc + m.valor, 0);
    const valorAtrasado = mensalidadesAtrasadas.reduce(
      (acc, m) => acc + m.valor + (m.multa || 0) + (m.juros || 0), 
      0
    );

    // Despesas do mês
    const despesas = await this.despesaRepository.buscarPorMesAno(mes, ano);
    const despesasPagas = despesas.filter(d => d.status === 'PAGO');
    const despesasPendentes = despesas.filter(d => d.status === 'PENDENTE');

    const totalDespesasPagas = despesasPagas.reduce((acc, d) => acc + d.valor, 0);
    const valorDespesasPendentes = despesasPendentes.reduce((acc, d) => acc + d.valor, 0);

    // Pagamentos de funcionários do mês
    const pagamentos = await this.pagamentoFuncionarioRepository.buscarPorMesAno(mes, ano);
    const pagamentosRealizados = pagamentos.filter(p => p.status === 'PAGO');
    const pagamentosPendentes = pagamentos.filter(p => p.status === 'PENDENTE');

    const totalSalariosPagos = pagamentosRealizados.reduce((acc, p) => acc + p.valorLiquido, 0);
    const valorSalariosPendentes = pagamentosPendentes.reduce((acc, p) => acc + p.valorLiquido, 0);

    // Alunos matriculados
    const alunosMatriculados = await this.alunoRepository.buscarMatriculados();

    // Inadimplentes (alunos com mensalidades atrasadas)
    const todasAtrasadas = await this.mensalidadeRepository.buscarAtrasadas();
    const alunosInadimplentes = new Set(todasAtrasadas.map(m => m.alunoId));

    // Calcular resumo
    const receitaBruta = totalRecebido;
    const despesaTotal = totalDespesasPagas + totalSalariosPagos;
    const lucroLiquido = receitaBruta - despesaTotal;

    return {
      receitas: {
        mensalidadesPagas: mensalidadesPagas.length,
        totalRecebido,
      },
      despesas: {
        despesasPagas: despesasPagas.length,
        salariosPagos: pagamentosRealizados.length,
        totalGasto: despesaTotal,
      },
      pendencias: {
        mensalidadesPendentes: mensalidadesPendentes.length,
        mensalidadesAtrasadas: mensalidadesAtrasadas.length,
        valorPendente,
        valorAtrasado,
        despesasPendentes: despesasPendentes.length,
        valorDespesasPendentes,
        salariosPendentes: pagamentosPendentes.length,
        valorSalariosPendentes,
      },
      resumo: {
        receitaBruta,
        despesaTotal,
        lucroLiquido,
      },
      inadimplentes: alunosInadimplentes.size,
      alunosMatriculados: alunosMatriculados.length,
    };
  }

  async obterHistoricoAnual(ano: number) {
    const historico = [];

    for (let mes = 1; mes <= 12; mes++) {
      const dashboard = await this.obterDashboard(mes, ano);
      historico.push({
        mes,
        ano,
        ...dashboard.resumo,
        alunosMatriculados: dashboard.alunosMatriculados,
        inadimplentes: dashboard.inadimplentes,
      });
    }

    return historico;
  }

  async obterResumoGeral() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const dashboardAtual = await this.obterDashboard(mesAtual, anoAtual);
    const historicoAnual = await this.obterHistoricoAnual(anoAtual);

    // Totais do ano
    const totalReceitaAno = historicoAnual.reduce((acc, h) => acc + h.receitaBruta, 0);
    const totalDespesaAno = historicoAnual.reduce((acc, h) => acc + h.despesaTotal, 0);
    const lucroAno = totalReceitaAno - totalDespesaAno;

    return {
      mesAtual: dashboardAtual,
      anoAtual: {
        totalReceita: totalReceitaAno,
        totalDespesa: totalDespesaAno,
        lucro: lucroAno,
      },
      historico: historicoAnual,
    };
  }

  async obterMetricasFrontend() {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    // Totais
    const alunos = await this.alunoRepository.buscarTodos();
    const professores = await this.professorRepository.buscarTodos();
    const turmas = await this.turmaRepository.buscarTodas();

    // Mensalidades
    const mensalidades = await this.mensalidadeRepository.buscarPorMesAno(mes, ano);
    const mensalidadesPendentes = mensalidades.filter(m => m.status === 'PENDENTE' || m.status === 'ATRASADO');
    const mensalidadesPagas = mensalidades.filter(m => m.status === 'PAGO');

    const receitaMensal = mensalidadesPagas.reduce((acc, m) => acc + (m.valorPago || m.valor), 0);

    // Despesas do mês
    const despesas = await this.despesaRepository.buscarPorMesAno(mes, ano);
    const despesasPagas = despesas.filter(d => d.status === 'PAGO');
    const despesaMensal = despesasPagas.reduce((acc, d) => acc + d.valor, 0);

    // Alunos por turma
    const alunosPorTurma = turmas
      .filter(t => t.ativa)
      .map(t => ({
        turma: t.nome,
        quantidade: alunos.filter(a => a.turmaId === t.id).length
      }))
      .filter(t => t.quantidade > 0);

    // Mensalidades por status
    const statusCounts = mensalidades.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mensalidadesPorStatus = Object.entries(statusCounts).map(([status, quantidade]) => ({
      status: status === 'PAGO' ? 'Pago' : status === 'PENDENTE' ? 'Pendente' : 'Atrasado',
      quantidade
    }));

    // Receita vs Despesa (últimos 6 meses)
    const receitaVsDespesa = [];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      let mesCalc = mes - i;
      let anoCalc = ano;
      if (mesCalc <= 0) {
        mesCalc += 12;
        anoCalc -= 1;
      }
      
      const mensalidadesMes = await this.mensalidadeRepository.buscarPorMesAno(mesCalc, anoCalc);
      const despesasMes = await this.despesaRepository.buscarPorMesAno(mesCalc, anoCalc);
      
      const receita = mensalidadesMes
        .filter(m => m.status === 'PAGO')
        .reduce((acc, m) => acc + (m.valorPago || m.valor), 0);
      const despesa = despesasMes
        .filter(d => d.status === 'PAGO')
        .reduce((acc, d) => acc + d.valor, 0);
      
      receitaVsDespesa.push({
        mes: meses[mesCalc - 1],
        receita,
        despesa
      });
    }

    return {
      totalAlunos: alunos.length,
      totalProfessores: professores.length,
      totalTurmas: turmas.filter(t => t.ativa).length,
      mensalidadesPendentes: mensalidadesPendentes.length,
      receitaMensal,
      despesaMensal,
      alunosPorTurma,
      mensalidadesPorStatus,
      receitaVsDespesa
    };
  }
}
