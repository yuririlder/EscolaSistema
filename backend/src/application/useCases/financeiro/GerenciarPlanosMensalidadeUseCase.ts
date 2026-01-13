import { PlanoMensalidadeRepository } from '../../../infrastructure/repositories';

interface CriarPlanoDTO {
  nome: string;
  descricao?: string;
  valor: number;
}

interface AtualizarPlanoDTO {
  nome?: string;
  descricao?: string;
  valor?: number;
  ativo?: boolean;
}

export class GerenciarPlanosMensalidadeUseCase {
  private planoRepository: PlanoMensalidadeRepository;

  constructor() {
    this.planoRepository = new PlanoMensalidadeRepository();
  }

  async criar(dados: CriarPlanoDTO) {
    const nomeExistente = await this.planoRepository.buscarPorNome(dados.nome);
    if (nomeExistente) {
      throw new Error('Já existe um plano com este nome');
    }

    return this.planoRepository.criar({
      nome: dados.nome,
      descricao: dados.descricao,
      valor: dados.valor,
      ativo: true,
    });
  }

  async buscarTodos() {
    return this.planoRepository.buscarTodos();
  }

  async buscarAtivos() {
    return this.planoRepository.buscarAtivos();
  }

  async buscarPorId(id: string) {
    const plano = await this.planoRepository.buscarPorId(id);
    if (!plano) {
      throw new Error('Plano não encontrado');
    }
    return plano;
  }

  async atualizar(id: string, dados: AtualizarPlanoDTO) {
    const plano = await this.planoRepository.buscarPorId(id);
    if (!plano) {
      throw new Error('Plano não encontrado');
    }

    if (dados.nome && dados.nome !== plano.nome) {
      const nomeExistente = await this.planoRepository.buscarPorNome(dados.nome);
      if (nomeExistente) {
        throw new Error('Já existe um plano com este nome');
      }
    }

    return this.planoRepository.atualizar(id, dados);
  }

  async deletar(id: string) {
    const plano = await this.planoRepository.buscarPorId(id);
    if (!plano) {
      throw new Error('Plano não encontrado');
    }

    await this.planoRepository.deletar(id);
  }
}
