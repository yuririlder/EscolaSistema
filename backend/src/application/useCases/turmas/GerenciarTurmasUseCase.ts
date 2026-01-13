import { TurmaRepository, AlunoRepository, ProfessorRepository } from '../../../infrastructure/repositories';

interface CriarTurmaDTO {
  nome: string;
  ano: number;
  turno: string;
  serie?: string;
  salaNumero?: string;
  capacidade?: number;
}

interface AtualizarTurmaDTO {
  nome?: string;
  ano?: number;
  turno?: string;
  serie?: string;
  salaNumero?: string;
  capacidade?: number;
  ativa?: boolean;
}

export class GerenciarTurmasUseCase {
  private turmaRepository: TurmaRepository;
  private alunoRepository: AlunoRepository;
  private professorRepository: ProfessorRepository;

  constructor() {
    this.turmaRepository = new TurmaRepository();
    this.alunoRepository = new AlunoRepository();
    this.professorRepository = new ProfessorRepository();
  }

  async criar(dados: CriarTurmaDTO) {
    return this.turmaRepository.criar({
      nome: dados.nome,
      ano: dados.ano,
      turno: dados.turno,
      serie: dados.serie,
      salaNumero: dados.salaNumero,
      capacidade: dados.capacidade || 30,
      ativa: true,
    });
  }

  async buscarTodas() {
    return this.turmaRepository.buscarTodas();
  }

  async buscarAtivas() {
    return this.turmaRepository.buscarAtivas();
  }

  async buscarPorId(id: string) {
    const turma = await this.turmaRepository.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }
    return turma;
  }

  async buscarComAlunos(id: string) {
    const turma = await this.turmaRepository.buscarComAlunos(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }
    return turma;
  }

  async buscarComProfessores(id: string) {
    const turma = await this.turmaRepository.buscarComProfessores(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }
    return turma;
  }

  async atualizar(id: string, dados: AtualizarTurmaDTO) {
    const turma = await this.turmaRepository.buscarPorId(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    return this.turmaRepository.atualizar(id, dados);
  }

  async vincularAluno(turmaId: string, alunoId: string) {
    const turma = await this.turmaRepository.buscarComAlunos(turmaId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    const aluno = await this.alunoRepository.buscarPorId(alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    // Verificar se aluno já está em outra turma
    if (aluno.turmaId && aluno.turmaId !== turmaId) {
      throw new Error('Aluno já está vinculado a outra turma');
    }

    // Verificar capacidade
    if (turma.alunos && turma.alunos.length >= turma.capacidade) {
      throw new Error('Turma já está na capacidade máxima');
    }

    return this.alunoRepository.vincularTurma(alunoId, turmaId);
  }

  async desvincularAluno(alunoId: string) {
    return this.alunoRepository.desvincularTurma(alunoId);
  }

  async vincularProfessor(turmaId: string, professorId: string, disciplina?: string) {
    const turma = await this.turmaRepository.buscarPorId(turmaId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    const professor = await this.professorRepository.buscarPorId(professorId);
    if (!professor) {
      throw new Error('Professor não encontrado');
    }

    return this.professorRepository.vincularTurma(professorId, turmaId, disciplina);
  }

  async desvincularProfessor(turmaId: string, professorId: string) {
    await this.professorRepository.desvincularTurma(professorId, turmaId);
  }

  async deletar(id: string) {
    const turma = await this.turmaRepository.buscarComAlunos(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    // Verificar se há alunos vinculados
    if (turma.alunos && turma.alunos.length > 0) {
      throw new Error('Não é possível excluir turma com alunos vinculados');
    }

    await this.turmaRepository.deletar(id);
  }
}
