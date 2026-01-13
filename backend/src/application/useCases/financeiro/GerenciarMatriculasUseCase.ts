import { 
  MatriculaRepository, 
  MensalidadeRepository, 
  AlunoRepository,
  PlanoMensalidadeRepository 
} from '../../../infrastructure/repositories';

interface RealizarMatriculaDTO {
  alunoId: string;
  planoId: string;
  anoLetivo: number;
  valorMatricula: number;
  valorMensalidade: number;
  diaVencimento?: number;
  desconto?: number;
  turmaId?: string;
  observacoes?: string;
}

export class GerenciarMatriculasUseCase {
  private matriculaRepository: MatriculaRepository;
  private mensalidadeRepository: MensalidadeRepository;
  private alunoRepository: AlunoRepository;
  private planoRepository: PlanoMensalidadeRepository;

  constructor() {
    this.matriculaRepository = new MatriculaRepository();
    this.mensalidadeRepository = new MensalidadeRepository();
    this.alunoRepository = new AlunoRepository();
    this.planoRepository = new PlanoMensalidadeRepository();
  }

  async realizar(dados: RealizarMatriculaDTO) {
    // Verificar se aluno existe
    const aluno = await this.alunoRepository.buscarPorId(dados.alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    // Verificar se já tem matrícula ativa no ano
    const matriculasAluno = await this.matriculaRepository.buscarPorAluno(dados.alunoId);
    const matriculaAnoAtual = matriculasAluno.find(
      m => m.anoLetivo === dados.anoLetivo && m.status === 'ATIVA'
    );
    if (matriculaAnoAtual) {
      throw new Error('Aluno já possui matrícula ativa neste ano letivo');
    }

    // Verificar plano
    const plano = await this.planoRepository.buscarPorId(dados.planoId);
    if (!plano) {
      throw new Error('Plano de mensalidade não encontrado');
    }

    // Criar matrícula
    const matricula = await this.matriculaRepository.criar({
      alunoId: dados.alunoId,
      planoId: dados.planoId,
      anoLetivo: dados.anoLetivo,
      valorMatricula: dados.valorMatricula,
      valorMensalidade: dados.valorMensalidade,
      diaVencimento: dados.diaVencimento || 10,
      desconto: dados.desconto || 0,
      observacoes: dados.observacoes,
      status: 'ATIVA',
    });

    // Ativar matrícula do aluno
    await this.alunoRepository.atualizar(dados.alunoId, {
      matriculaAtiva: true,
      dataMatricula: new Date(),
    });

    // Se passou turmaId, vincular aluno à turma
    if (dados.turmaId) {
      await this.alunoRepository.vincularTurma(dados.alunoId, dados.turmaId);
    }

    // Gerar mensalidades para o ano letivo (Fevereiro a Dezembro = 11 meses)
    const mensalidades = [];
    const valorComDesconto = dados.valorMensalidade - (dados.desconto || 0);
    
    for (let mes = 2; mes <= 12; mes++) {
      const dataVencimento = new Date(dados.anoLetivo, mes - 1, dados.diaVencimento || 10);
      
      mensalidades.push({
        alunoId: dados.alunoId,
        matriculaId: matricula.id,
        mesReferencia: mes,
        anoReferencia: dados.anoLetivo,
        valor: valorComDesconto,
        dataVencimento,
        status: 'PENDENTE',
      });
    }

    await this.mensalidadeRepository.criarVarias(mensalidades);

    return this.matriculaRepository.buscarPorId(matricula.id);
  }

  async buscarPorId(id: string) {
    const matricula = await this.matriculaRepository.buscarPorId(id);
    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }
    return matricula;
  }

  async buscarPorAluno(alunoId: string) {
    return this.matriculaRepository.buscarPorAluno(alunoId);
  }

  async buscarAtivas() {
    return this.matriculaRepository.buscarAtivas();
  }

  async buscarPorAnoLetivo(ano: number) {
    return this.matriculaRepository.buscarPorAnoLetivo(ano);
  }

  async cancelar(id: string) {
    const matricula = await this.matriculaRepository.buscarPorId(id);
    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }

    // Cancelar matrícula
    await this.matriculaRepository.cancelar(id);

    // Desativar matrícula do aluno
    await this.alunoRepository.atualizar(matricula.alunoId, {
      matriculaAtiva: false,
    });

    // Cancelar mensalidades pendentes
    const mensalidades = await this.mensalidadeRepository.buscarPorMatricula(id);
    for (const mensalidade of mensalidades) {
      if (mensalidade.status === 'PENDENTE') {
        await this.mensalidadeRepository.atualizar(mensalidade.id, {
          status: 'CANCELADO',
        });
      }
    }

    return this.matriculaRepository.buscarPorId(id);
  }

  async gerarTermoMatricula(id: string) {
    const matricula = await this.matriculaRepository.buscarPorId(id);
    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }

    return {
      matricula,
      aluno: matricula.aluno,
      responsavel: matricula.aluno.responsavel,
      plano: matricula.plano,
      dataGeracao: new Date(),
    };
  }
}
