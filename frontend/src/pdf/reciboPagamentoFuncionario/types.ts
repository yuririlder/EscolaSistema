export interface DadosReciboPagamentoFuncionario {
  funcionarioNome: string;
  mesReferencia: string;
  anoReferencia: string | number;
  salarioBase: number;
  bonus: number;
  descontos: number;
  valorLiquido: number;
  dataPagamento: string;
  formaPagamento: string;
}
