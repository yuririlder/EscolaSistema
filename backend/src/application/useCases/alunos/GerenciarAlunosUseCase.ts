import { AlunoRepository, ResponsavelRepository } from '../../../infrastructure/repositories';

interface CriarAlunoDTO {
  nome: string;
  cpf?: string;
  rg?: string;
  dataNascimento: Date;
  sexo?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  responsavelId: string;
  observacoes?: string;
}

interface AtualizarAlunoDTO {
  nome?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: Date;
  sexo?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}

export class GerenciarAlunosUseCase {
  private alunoRepository: AlunoRepository;
  private responsavelRepository: ResponsavelRepository;

  constructor() {
    this.alunoRepository = new AlunoRepository();
    this.responsavelRepository = new ResponsavelRepository();
  }

  async criar(dados: CriarAlunoDTO) {
    // Verificar se responsável existe
    const responsavel = await this.responsavelRepository.buscarPorId(dados.responsavelId);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }

    // Verificar CPF único se informado
    if (dados.cpf) {
      const cpfExistente = await this.alunoRepository.buscarPorCpf(dados.cpf);
      if (cpfExistente) {
        throw new Error('CPF já cadastrado');
      }
    }

    return this.alunoRepository.criar({
      ...dados,
      matriculaAtiva: false,
    });
  }

  async buscarTodos() {
    return this.alunoRepository.buscarTodos();
  }

  async buscarPorId(id: string) {
    const aluno = await this.alunoRepository.buscarPorId(id);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }
    return aluno;
  }

  async buscarPorResponsavel(responsavelId: string) {
    return this.alunoRepository.buscarPorResponsavel(responsavelId);
  }

  async buscarPorTurma(turmaId: string) {
    return this.alunoRepository.buscarPorTurma(turmaId);
  }

  async buscarMatriculados() {
    return this.alunoRepository.buscarMatriculados();
  }

  async atualizar(id: string, dados: AtualizarAlunoDTO) {
    const aluno = await this.alunoRepository.buscarPorId(id);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    // Verificar CPF único se sendo alterado
    if (dados.cpf && dados.cpf !== aluno.cpf) {
      const cpfExistente = await this.alunoRepository.buscarPorCpf(dados.cpf);
      if (cpfExistente) {
        throw new Error('CPF já cadastrado');
      }
    }

    return this.alunoRepository.atualizar(id, dados);
  }

  async vincularTurma(alunoId: string, turmaId: string) {
    const aluno = await this.alunoRepository.buscarPorId(alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    if (aluno.turmaId) {
      throw new Error('Aluno já está vinculado a uma turma');
    }

    return this.alunoRepository.vincularTurma(alunoId, turmaId);
  }

  async desvincularTurma(alunoId: string) {
    const aluno = await this.alunoRepository.buscarPorId(alunoId);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    return this.alunoRepository.desvincularTurma(alunoId);
  }

  async deletar(id: string) {
    const aluno = await this.alunoRepository.buscarPorId(id);
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    if (aluno.matriculaAtiva) {
      throw new Error('Não é possível excluir aluno com matrícula ativa');
    }

    await this.alunoRepository.deletar(id);
  }
}
