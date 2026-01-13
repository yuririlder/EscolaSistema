import { DespesaRepository } from '../../../infrastructure/repositories';

interface CriarDespesaDTO {
  descricao: string;
  categoria: string;
  valor: number;
  dataVencimento: Date;
  fornecedor?: string;
  observacoes?: string;
}

interface AtualizarDespesaDTO {
  descricao?: string;
  categoria?: string;
  valor?: number;
  dataVencimento?: Date;
  fornecedor?: string;
  observacoes?: string;
}

export class GerenciarDespesasUseCase {
  private despesaRepository: DespesaRepository;

  constructor() {
    this.despesaRepository = new DespesaRepository();
  }

  async criar(dados: CriarDespesaDTO) {
    return this.despesaRepository.criar({
      ...dados,
      status: 'PENDENTE',
    });
  }

  async buscarTodas() {
    return this.despesaRepository.buscarTodas();
  }

  async buscarPorId(id: string) {
    const despesa = await this.despesaRepository.buscarPorId(id);
    if (!despesa) {
      throw new Error('Despesa não encontrada');
    }
    return despesa;
  }

  async buscarPorCategoria(categoria: string) {
    return this.despesaRepository.buscarPorCategoria(categoria);
  }

  async buscarPorMesAno(mes: number, ano: number) {
    return this.despesaRepository.buscarPorMesAno(mes, ano);
  }

  async buscarPendentes() {
    return this.despesaRepository.buscarPendentes();
  }

  async registrarPagamento(id: string, dataPagamento?: Date) {
    const despesa = await this.despesaRepository.buscarPorId(id);
    if (!despesa) {
      throw new Error('Despesa não encontrada');
    }

    if (despesa.status === 'PAGO') {
      throw new Error('Despesa já foi paga');
    }

    return this.despesaRepository.registrarPagamento(id, dataPagamento || new Date());
  }

  async atualizar(id: string, dados: AtualizarDespesaDTO) {
    const despesa = await this.despesaRepository.buscarPorId(id);
    if (!despesa) {
      throw new Error('Despesa não encontrada');
    }

    return this.despesaRepository.atualizar(id, dados);
  }

  async cancelar(id: string) {
    const despesa = await this.despesaRepository.buscarPorId(id);
    if (!despesa) {
      throw new Error('Despesa não encontrada');
    }

    return this.despesaRepository.atualizar(id, { status: 'CANCELADO' });
  }

  async deletar(id: string) {
    const despesa = await this.despesaRepository.buscarPorId(id);
    if (!despesa) {
      throw new Error('Despesa não encontrada');
    }

    await this.despesaRepository.deletar(id);
  }

  async listarCategorias() {
    const despesas = await this.despesaRepository.buscarTodas();
    const categorias = [...new Set(despesas.map(d => d.categoria))];
    return categorias.sort();
  }
}
