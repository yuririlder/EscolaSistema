import { NotaRepository, AlunoRepository, TurmaRepository } from '../../../infrastructure/repositories';

interface LancarNotaDTO {
  alunoId: string;
  turmaId: string;
  disciplina: string;
  bimestre: number;
  nota: number;
  tipo?: string;
  observacao?: string;
}

interface AtualizarNotaDTO {
  nota?: number;
  tipo?: string;
  observacao?: string;
}

export class GerenciarNotasUseCase {
  private notaRepository: NotaRepository;
  private alunoRepository: AlunoRepository;
  private turmaRepository: TurmaRepository;

  constructor() {
    this.notaRepository = new NotaRepository();
    this.alunoRepository = new AlunoRepository();
    this.turmaRepository = new TurmaRepository();
  }

  async lancar(dados: LancarNotaDTO) {
    // Validar nota
    if (dados.nota < 0 || dados.nota > 10) {
      throw new Error('Nota deve estar entre 0 e 10');
    }

    // Verificar se aluno existe
    const aluno = await this.alunoRepository.buscarPorId(dados.alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    // Verificar se turma existe
    const turma = await this.turmaRepository.buscarPorId(dados.turmaId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    // Verificar se aluno está na turma
    if (aluno.turmaId !== dados.turmaId) {
      throw new Error('Aluno não está matriculado nesta turma');
    }

    return this.notaRepository.criar({
      alunoId: dados.alunoId,
      turmaId: dados.turmaId,
      disciplina: dados.disciplina,
      bimestre: dados.bimestre,
      nota: dados.nota,
      tipo: dados.tipo,
      observacao: dados.observacao,
    });
  }

  async buscarPorAluno(alunoId: string) {
    return this.notaRepository.buscarPorAluno(alunoId);
  }

  async buscarPorTurma(turmaId: string) {
    return this.notaRepository.buscarPorTurma(turmaId);
  }

  async buscarPorAlunoEBimestre(alunoId: string, bimestre: number) {
    return this.notaRepository.buscarPorAlunoEBimestre(alunoId, bimestre);
  }

  async buscarBoletim(alunoId: string) {
    const aluno = await this.alunoRepository.buscarPorId(alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    const notas = await this.notaRepository.buscarPorAluno(alunoId);

    // Agrupar notas por disciplina
    const boletim: { [key: string]: { [key: number]: number } } = {};
    
    notas.forEach((nota) => {
      if (!boletim[nota.disciplina]) {
        boletim[nota.disciplina] = {};
      }
      boletim[nota.disciplina][nota.bimestre] = nota.nota;
    });

    // Calcular médias
    const resultado = Object.entries(boletim).map(([disciplina, bimestres]) => {
      const notasBimestre = Object.values(bimestres);
      const media = notasBimestre.reduce((a, b) => a + b, 0) / notasBimestre.length;
      
      return {
        disciplina,
        bimestres,
        media: Math.round(media * 10) / 10,
        situacao: media >= 7 ? 'Aprovado' : media >= 5 ? 'Recuperação' : 'Reprovado',
      };
    });

    return {
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        turma: aluno.turma?.nome,
      },
      notas: resultado,
    };
  }

  async atualizar(id: string, dados: AtualizarNotaDTO) {
    const nota = await this.notaRepository.buscarPorId(id);
    if (!nota) {
      throw new Error('Nota não encontrada');
    }

    if (dados.nota !== undefined && (dados.nota < 0 || dados.nota > 10)) {
      throw new Error('Nota deve estar entre 0 e 10');
    }

    return this.notaRepository.atualizar(id, dados);
  }

  async deletar(id: string) {
    const nota = await this.notaRepository.buscarPorId(id);
    if (!nota) {
      throw new Error('Nota não encontrada');
    }

    await this.notaRepository.deletar(id);
  }
}
