import { EscolaRepository } from '../../../infrastructure/repositories';

interface EscolaDTO {
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  diretor?: string;
  secretario?: string;
  logo?: string;
}

export class GerenciarEscolaUseCase {
  private escolaRepository: EscolaRepository;

  constructor() {
    this.escolaRepository = new EscolaRepository();
  }

  async buscarDados() {
    return this.escolaRepository.buscarPrimeira();
  }

  async criarOuAtualizar(dados: EscolaDTO) {
    const escolaExistente = await this.escolaRepository.buscarPrimeira();

    if (escolaExistente) {
      return this.escolaRepository.atualizar(escolaExistente.id, dados);
    }

    return this.escolaRepository.criar(dados);
  }
}
