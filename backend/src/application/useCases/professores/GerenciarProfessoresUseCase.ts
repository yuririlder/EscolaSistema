import { FuncionarioRepository, ProfessorRepository } from '../../../infrastructure/repositories';

interface CriarProfessorDTO {
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  salario: number;
  dataContratacao: Date;
  formacao?: string;
  especialidade?: string;
}

interface AtualizarProfessorDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  salario?: number;
  formacao?: string;
  especialidade?: string;
  ativo?: boolean;
}

export class GerenciarProfessoresUseCase {
  private funcionarioRepository: FuncionarioRepository;
  private professorRepository: ProfessorRepository;

  constructor() {
    this.funcionarioRepository = new FuncionarioRepository();
    this.professorRepository = new ProfessorRepository();
  }

  async criar(dados: CriarProfessorDTO) {
    // Verificar se CPF já existe
    const cpfExistente = await this.funcionarioRepository.buscarPorCpf(dados.cpf);
    if (cpfExistente) {
      throw new Error('CPF já cadastrado');
    }

    // Criar funcionário
    const funcionario = await this.funcionarioRepository.criar({
      nome: dados.nome,
      cpf: dados.cpf,
      rg: dados.rg,
      dataNascimento: dados.dataNascimento,
      telefone: dados.telefone,
      email: dados.email,
      endereco: dados.endereco,
      cidade: dados.cidade,
      estado: dados.estado,
      cep: dados.cep,
      cargo: 'Professor',
      salario: dados.salario,
      dataContratacao: dados.dataContratacao,
      ativo: true,
    });

    // Criar professor vinculado ao funcionário
    const professor = await this.professorRepository.criar(funcionario.id, {
      formacao: dados.formacao,
      especialidade: dados.especialidade,
    });

    return professor;
  }

  async buscarTodos() {
    return this.professorRepository.buscarTodos();
  }

  async buscarPorId(id: string) {
    const professor = await this.professorRepository.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado');
    }
    return professor;
  }

  async atualizar(id: string, dados: AtualizarProfessorDTO) {
    const professor = await this.professorRepository.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado');
    }

    // Atualizar dados do funcionário
    if (dados.nome || dados.telefone || dados.email || dados.endereco || 
        dados.cidade || dados.estado || dados.cep || dados.salario !== undefined || dados.ativo !== undefined) {
      await this.funcionarioRepository.atualizar(professor.funcionarioId, {
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        salario: dados.salario,
        ativo: dados.ativo,
      });
    }

    // Atualizar dados específicos do professor
    if (dados.formacao || dados.especialidade) {
      await this.professorRepository.atualizar(id, {
        formacao: dados.formacao,
        especialidade: dados.especialidade,
      });
    }

    return this.professorRepository.buscarPorId(id);
  }

  async vincularTurma(professorId: string, turmaId: string, disciplina?: string) {
    const professor = await this.professorRepository.buscarPorId(professorId);
    if (!professor) {
      throw new Error('Professor não encontrado');
    }

    return this.professorRepository.vincularTurma(professorId, turmaId, disciplina);
  }

  async desvincularTurma(professorId: string, turmaId: string) {
    await this.professorRepository.desvincularTurma(professorId, turmaId);
  }

  async deletar(id: string) {
    const professor = await this.professorRepository.buscarPorId(id);
    if (!professor) {
      throw new Error('Professor não encontrado');
    }

    // Deletar professor (que vai cascatear para funcionário)
    await this.professorRepository.deletar(id);
    await this.funcionarioRepository.deletar(professor.funcionarioId);
  }
}
