import { ResponsavelRepository } from '../../../infrastructure/repositories';

interface CriarResponsavelDTO {
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: Date;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  profissao?: string;
  localTrabalho?: string;
  observacoes?: string;
}

interface AtualizarResponsavelDTO {
  nome?: string;
  rg?: string;
  dataNascimento?: Date;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  profissao?: string;
  localTrabalho?: string;
  observacoes?: string;
}

export class GerenciarResponsaveisUseCase {
  private responsavelRepository: ResponsavelRepository;

  constructor() {
    this.responsavelRepository = new ResponsavelRepository();
  }

  async criar(dados: CriarResponsavelDTO) {
    const cpfExistente = await this.responsavelRepository.buscarPorCpf(dados.cpf);
    if (cpfExistente) {
      throw new Error('CPF já cadastrado');
    }

    return this.responsavelRepository.criar(dados);
  }

  async buscarTodos() {
    return this.responsavelRepository.buscarTodos();
  }

  async buscarPorId(id: string) {
    const responsavel = await this.responsavelRepository.buscarPorId(id);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }
    return responsavel;
  }

  async buscarComFilhos(id: string) {
    const responsavel = await this.responsavelRepository.buscarComFilhos(id);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }
    return responsavel;
  }

  async atualizar(id: string, dados: AtualizarResponsavelDTO) {
    const responsavel = await this.responsavelRepository.buscarPorId(id);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }

    return this.responsavelRepository.atualizar(id, dados);
  }

  async deletar(id: string) {
    const responsavel = await this.responsavelRepository.buscarComFilhos(id);
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }

    // Verificar se tem filhos vinculados
    if (responsavel.alunos && responsavel.alunos.length > 0) {
      throw new Error('Não é possível excluir responsável com alunos vinculados');
    }

    await this.responsavelRepository.deletar(id);
  }
}
