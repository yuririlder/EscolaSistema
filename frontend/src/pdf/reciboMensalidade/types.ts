export interface DadosReciboMensalidade {
  alunoNome: string;
  mesReferencia: string;
  anoReferencia: string | number;
  dataVencimento: string;
  dataPagamento: string;
  valor: number;
  valorOriginal?: number;
  desconto?: number;
  acrescimo?: number;
  descontoMotivo?: string;
  acrescimoMotivo?: string;
  formaPagamento: string;
  responsavelNome?: string;
  responsavelCpf?: string;
}
