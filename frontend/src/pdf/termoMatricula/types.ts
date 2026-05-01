export interface DadosTermoMatricula {
  alunoNome: string;
  alunoDataNascimento?: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  responsavelTelefone?: string;
  anoLetivo: string | number;
  planoNome: string;
  valorMensalidade: number;
  valorMatricula: number;
  desconto: number;
  dataMatricula: string;
  turmaNome?: string;
}
