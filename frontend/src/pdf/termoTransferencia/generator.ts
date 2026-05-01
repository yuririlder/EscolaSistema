import jsPDF from 'jspdf';
import { addFooter, addHeader } from '../global/components';
import { DadosEscola } from '../global/types';
import { formatDate, renderJustifiedText } from '../global/utils';
import { DadosTermoTransferencia } from './types';

export const gerarTermoTransferenciaPDF = (dados: DadosTermoTransferencia, escola?: DadosEscola): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const textWidth = pageWidth - margin * 2;

  let y = addHeader(doc, 'DECLARAÇÃO DE TRANSFERÊNCIA', escola);

  const dataPorExtenso = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const escolaNome = escola?.nome || '___________________________';
  const escolaEndereco = escola?.endereco || '___________________________';
  const escolaCnpj = escola?.cnpj || '___________________________';
  const escolaEmail = escola?.email || '___________________________';

  const alunoNome = dados.alunoNome || '___________________________';
  const pai = dados.nomePai || '___________________________';
  const mae = dados.nomeMae || '___________________________';
  const dataNasc = dados.alunoDataNascimento ? formatDate(dados.alunoDataNascimento) : '___________________________';
  const cpf = dados.alunoCpf || '___________________________';
  const serie = dados.serieTurma || '___________________________';
  const ano = dados.anoLetivo ? String(dados.anoLetivo) : '___________________________';
  const destino = dados.escolaDestino || '___________________________';
  const enderecoDestino = dados.enderecoEscolaDestino || '___________________________';
  const dataInicio = dados.dataInicioMatricula ? formatDate(dados.dataInicioMatricula) : '___________________________';

  const paragrafo = `A ${escolaNome}, situada à ${escolaEndereco}, CNPJ n° ${escolaCnpj}, endereço eletrônico ${escolaEmail}, Declara para os devidos fins que o(a) aluno(a) ${alunoNome}, filho(a) de ${pai} e ${mae}, nascido(a) em ${dataNasc}, CPF n° ${cpf}, devidamente matriculado(a) na série ${serie}, no período letivo de ${ano}, solicitou a transferência para a Escola ${destino}, localizada à ${enderecoDestino}. Esclarecemos que o(a) aluno(a) acima mencionado(a) esteve regularmente matriculado(a) nesta instituição desde ${dataInicio} até a data da presente declaração.`;

  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  y = renderJustifiedText(doc, paragrafo, margin, y, textWidth, 7);
  y += 10;

  doc.setFontSize(11);
  doc.text(`${escola?.nome || 'Local'}, ${dataPorExtenso}.`, margin, y);

  y += 30;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);

  doc.line(margin, y, margin + 70, y);
  doc.setFontSize(9);
  doc.text('Diretor(a) / Coordenador(a)', margin + 35, y + 5, { align: 'center' });
  doc.text(escola?.nome || '', margin + 35, y + 10, { align: 'center' });

  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
  doc.text('Assinatura do Responsável', pageWidth - margin - 35, y + 5, { align: 'center' });
  doc.text(alunoNome, pageWidth - margin - 35, y + 10, { align: 'center' });

  addFooter(doc);
  doc.output('dataurlnewwindow');
};
