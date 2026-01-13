import { MensalidadeRepository, AlunoRepository } from '../../../infrastructure/repositories';

interface RegistrarPagamentoDTO {
  mensalidadeId: string;
  valorPago: number;
  formaPagamento: string;
  dataPagamento?: Date;
  observacoes?: string;
}

export class GerenciarMensalidadesUseCase {
  private mensalidadeRepository: MensalidadeRepository;
  private alunoRepository: AlunoRepository;

  constructor() {
    this.mensalidadeRepository = new MensalidadeRepository();
    this.alunoRepository = new AlunoRepository();
  }

  async buscarPorId(id: string) {
    const mensalidade = await this.mensalidadeRepository.buscarPorId(id);
    if (!mensalidade) {
      throw new Error('Mensalidade não encontrada');
    }
    return mensalidade;
  }

  async buscarPorAluno(alunoId: string) {
    return this.mensalidadeRepository.buscarPorAluno(alunoId);
  }

  async buscarPorMatricula(matriculaId: string) {
    return this.mensalidadeRepository.buscarPorMatricula(matriculaId);
  }

  async buscarPendentes() {
    return this.mensalidadeRepository.buscarPendentes();
  }

  async buscarAtrasadas() {
    return this.mensalidadeRepository.buscarAtrasadas();
  }

  async buscarPorMesAno(mes: number, ano: number) {
    return this.mensalidadeRepository.buscarPorMesAno(mes, ano);
  }

  async registrarPagamento(dados: RegistrarPagamentoDTO) {
    const mensalidade = await this.mensalidadeRepository.buscarPorId(dados.mensalidadeId);
    if (!mensalidade) {
      throw new Error('Mensalidade não encontrada');
    }

    if (mensalidade.status === 'PAGO') {
      throw new Error('Mensalidade já foi paga');
    }

    if (mensalidade.status === 'CANCELADO') {
      throw new Error('Mensalidade foi cancelada');
    }

    return this.mensalidadeRepository.registrarPagamento(dados.mensalidadeId, {
      valorPago: dados.valorPago,
      formaPagamento: dados.formaPagamento,
      dataPagamento: dados.dataPagamento || new Date(),
    });
  }

  async aplicarMultaJuros(id: string, multa: number, juros: number) {
    const mensalidade = await this.mensalidadeRepository.buscarPorId(id);
    if (!mensalidade) {
      throw new Error('Mensalidade não encontrada');
    }

    return this.mensalidadeRepository.atualizar(id, {
      multa,
      juros,
      status: 'ATRASADO',
    });
  }

  async gerarComprovantePagamento(id: string) {
    const mensalidade = await this.mensalidadeRepository.buscarPorId(id);
    if (!mensalidade) {
      throw new Error('Mensalidade não encontrada');
    }

    if (mensalidade.status !== 'PAGO') {
      throw new Error('Mensalidade ainda não foi paga');
    }

    return {
      mensalidade,
      aluno: mensalidade.aluno,
      responsavel: mensalidade.aluno.responsavel,
      dataGeracao: new Date(),
    };
  }

  async atualizarStatusAtrasadas() {
    const hoje = new Date();
    const pendentes = await this.mensalidadeRepository.buscarPendentes();
    
    let atualizadas = 0;
    for (const mensalidade of pendentes) {
      if (new Date(mensalidade.dataVencimento) < hoje) {
        await this.mensalidadeRepository.atualizar(mensalidade.id, {
          status: 'ATRASADO',
        });
        atualizadas++;
      }
    }

    return { atualizadas };
  }

  async listarInadimplentes() {
    const atrasadas = await this.mensalidadeRepository.buscarAtrasadas();
    
    // Agrupar por aluno
    const inadimplentesMap = new Map();
    
    for (const mensalidade of atrasadas) {
      if (!inadimplentesMap.has(mensalidade.alunoId)) {
        inadimplentesMap.set(mensalidade.alunoId, {
          aluno: mensalidade.aluno,
          mensalidadesAtrasadas: [],
          totalDevido: 0,
        });
      }
      
      const inadimplente = inadimplentesMap.get(mensalidade.alunoId);
      inadimplente.mensalidadesAtrasadas.push(mensalidade);
      inadimplente.totalDevido += mensalidade.valor + (mensalidade.multa || 0) + (mensalidade.juros || 0);
    }

    return Array.from(inadimplentesMap.values());
  }
}
