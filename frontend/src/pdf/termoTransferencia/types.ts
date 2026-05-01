export interface DadosTermoTransferencia {
  alunoNome: string;
  alunoDataNascimento?: string | Date;
  alunoCpf?: string;
  nomePai?: string;
  nomeMae?: string;
  serieTurma?: string;
  anoLetivo?: string | number;
  escolaDestino?: string;
  enderecoEscolaDestino?: string;
  dataInicioMatricula?: string | Date;
  dataDesativacao?: string | Date;
}
