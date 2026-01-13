import { PagamentoFuncionarioRepository, FuncionarioRepository } from '../../../infrastructure/repositories';

interface CriarPagamentoDTO {
  funcionarioId: string;
  mesReferencia: number;
  anoReferencia: number;
  salarioBase: number;
  bonus?: number;
  descontos?: number;
  observacoes?: string;
}

export class GerenciarPagamentosFuncionariosUseCase {
  private pagamentoRepository: PagamentoFuncionarioRepository;
  private funcionarioRepository: FuncionarioRepository;

  constructor() {
    this.pagamentoRepository = new PagamentoFuncionarioRepository();
    this.funcionarioRepository = new FuncionarioRepository();
  }

  async criar(dados: CriarPagamentoDTO) {
    // Verificar se funcionário existe
    const funcionario = await this.funcionarioRepository.buscarPorId(dados.funcionarioId);
    if (!funcionario) {
      throw new Error('Funcionário não encontrado');
    }

    // Calcular valor líquido
    const bonus = dados.bonus || 0;
    const descontos = dados.descontos || 0;
    const valorLiquido = dados.salarioBase + bonus - descontos;

    return this.pagamentoRepository.criar({
      funcionarioId: dados.funcionarioId,
      mesReferencia: dados.mesReferencia,
      anoReferencia: dados.anoReferencia,
      salarioBase: dados.salarioBase,
      bonus,
      descontos,
      valorLiquido,
      observacoes: dados.observacoes,
      status: 'PENDENTE',
    });
  }

  async gerarPagamentosMes(mes: number, ano: number) {
    const funcionariosAtivos = await this.funcionarioRepository.buscarAtivos();
    const pagamentosGerados = [];

    for (const funcionario of funcionariosAtivos) {
      // Verificar se já existe pagamento para este mês/ano
      const pagamentosExistentes = await this.pagamentoRepository.buscarPorFuncionario(funcionario.id);
      const jaExiste = pagamentosExistentes.some(
        p => p.mesReferencia === mes && p.anoReferencia === ano
      );

      if (!jaExiste) {
        const pagamento = await this.pagamentoRepository.criar({
          funcionarioId: funcionario.id,
          mesReferencia: mes,
          anoReferencia: ano,
          salarioBase: funcionario.salario,
          bonus: 0,
          descontos: 0,
          valorLiquido: funcionario.salario,
          status: 'PENDENTE',
        });
        pagamentosGerados.push(pagamento);
      }
    }

    return pagamentosGerados;
  }

  async buscarPorId(id: string) {
    const pagamento = await this.pagamentoRepository.buscarPorId(id);
    if (!pagamento) {
      throw new Error('Pagamento não encontrado');
    }
    return pagamento;
  }

  async buscarPorFuncionario(funcionarioId: string) {
    return this.pagamentoRepository.buscarPorFuncionario(funcionarioId);
  }

  async buscarPorMesAno(mes: number, ano: number) {
    return this.pagamentoRepository.buscarPorMesAno(mes, ano);
  }

  async buscarPendentes() {
    return this.pagamentoRepository.buscarPendentes();
  }

  async registrarPagamento(id: string, dataPagamento?: Date) {
    const pagamento = await this.pagamentoRepository.buscarPorId(id);
    if (!pagamento) {
      throw new Error('Pagamento não encontrado');
    }

    if (pagamento.status === 'PAGO') {
      throw new Error('Pagamento já foi realizado');
    }

    return this.pagamentoRepository.registrarPagamento(id, dataPagamento || new Date());
  }

  async atualizar(id: string, dados: Partial<CriarPagamentoDTO>) {
    const pagamento = await this.pagamentoRepository.buscarPorId(id);
    if (!pagamento) {
      throw new Error('Pagamento não encontrado');
    }

    if (pagamento.status === 'PAGO') {
      throw new Error('Não é possível alterar pagamento já realizado');
    }

    const dadosAtualizados: any = { ...dados };

    // Recalcular valor líquido se necessário
    if (dados.salarioBase || dados.bonus !== undefined || dados.descontos !== undefined) {
      const salarioBase = dados.salarioBase ?? pagamento.salarioBase;
      const bonus = dados.bonus ?? pagamento.bonus;
      const descontos = dados.descontos ?? pagamento.descontos;
      dadosAtualizados.valorLiquido = salarioBase + bonus - descontos;
    }

    return this.pagamentoRepository.atualizar(id, dadosAtualizados);
  }

  async gerarComprovantePagamento(id: string) {
    const pagamento = await this.pagamentoRepository.buscarPorId(id);
    if (!pagamento) {
      throw new Error('Pagamento não encontrado');
    }

    if (pagamento.status !== 'PAGO') {
      throw new Error('Pagamento ainda não foi realizado');
    }

    return {
      pagamento,
      funcionario: pagamento.funcionario,
      dataGeracao: new Date(),
    };
  }
}
