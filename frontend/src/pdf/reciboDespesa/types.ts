export interface DadosReciboDespesa {
  descricao: string;
  categoria: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string;
  fornecedor?: string;
  formaPagamento: string;
}
