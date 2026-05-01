// Geradores de PDF
export { gerarReciboMensalidadePDF } from './reciboMensalidade/generator';
export { gerarReciboDespesaPDF } from './reciboDespesa/generator';
export { gerarReciboPagamentoFuncionarioPDF } from './reciboPagamentoFuncionario/generator';
export { gerarTermoMatriculaPDF } from './termoMatricula/generator';
export { gerarFichaCompletaAlunoPDF } from './fichaCompletaAluno/generator';
export { gerarTermoTransferenciaPDF } from './termoTransferencia/generator';

// Tipos
export type { DadosEscola } from './global/types';
export type { DadosReciboMensalidade } from './reciboMensalidade/types';
export type { DadosReciboDespesa } from './reciboDespesa/types';
export type { DadosReciboPagamentoFuncionario } from './reciboPagamentoFuncionario/types';
export type { DadosTermoMatricula } from './termoMatricula/types';
export type { ContatoEmergencia, DadosFichaCompletaAluno } from './fichaCompletaAluno/types';
export type { DadosTermoTransferencia } from './termoTransferencia/types';
