import jsPDF from 'jspdf';
import { addFooter, addHeader } from '../global/components';
import { DadosEscola } from '../global/types';
import { formatCurrency, valorPorExtenso } from '../global/utils';
import { DadosReciboMensalidade } from './types';

export const gerarReciboMensalidadePDF = (dados: DadosReciboMensalidade, escola?: DadosEscola): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = addHeader(doc, 'RECIBO DE PAGAMENTO - MENSALIDADE', escola);

  y += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  const valorFormatado = formatCurrency(dados.valor);
  const nomeResponsavel = dados.responsavelNome || dados.alunoNome;
  const cpfResponsavel = dados.responsavelCpf ? `, CPF: ${dados.responsavelCpf}` : '';
  const declaracao = `Declaramos para os devidos fins que recebemos de ${nomeResponsavel}${cpfResponsavel} o valor de ${valorFormatado} (${valorPorExtenso(dados.valor)}), referente à mensalidade do mês de ${dados.mesReferencia}/${dados.anoReferencia} do(a) aluno(a) ${dados.alunoNome}.`;
  const splitDeclaracao = doc.splitTextToSize(declaracao, pageWidth - 40);
  doc.text(splitDeclaracao, 20, y);

  y += splitDeclaracao.length * 6 + 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  const lineHeight = 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Aluno:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.alunoNome, 70, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Referência:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dados.mesReferencia}/${dados.anoReferencia}`, 70, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Vencimento:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.dataVencimento, 70, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Data Pagamento:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.dataPagamento, 70, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Forma Pagamento:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.formaPagamento, 70, y);

  if ((dados.desconto && dados.desconto > 0) || (dados.acrescimo && dados.acrescimo > 0)) {
    y += 15;
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(20, y, pageWidth - 20, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHAMENTO DO VALOR', 20, y);

    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (dados.valorOriginal && dados.valorOriginal > 0) {
      doc.text('Valor Original:', 20, y);
      doc.text(formatCurrency(dados.valorOriginal), pageWidth - 20, y, { align: 'right' });
      y += 7;
    }

    if (dados.desconto && dados.desconto > 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(`Desconto${dados.descontoMotivo ? ` (${dados.descontoMotivo})` : ''}:`, 20, y);
      doc.text(`- ${formatCurrency(dados.desconto)}`, pageWidth - 20, y, { align: 'right' });
      y += 7;
    }

    if (dados.acrescimo && dados.acrescimo > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Acréscimo${dados.acrescimoMotivo ? ` (${dados.acrescimoMotivo})` : ''}:`, 20, y);
      doc.text(`+ ${formatCurrency(dados.acrescimo)}`, pageWidth - 20, y, { align: 'right' });
      y += 7;
    }

    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(20, y + 2, pageWidth - 20, y + 2);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Valor Final:', 20, y);
    doc.text(formatCurrency(dados.valor), pageWidth - 20, y, { align: 'right' });
  }

  y += 20;
  doc.setFillColor(22, 163, 74);
  doc.roundedRect(pageWidth / 2 - 50, y - 5, 100, 25, 3, 3, 'F');
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR PAGO', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(18);
  doc.text(formatCurrency(dados.valor), pageWidth / 2, y + 15, { align: 'center' });

  y += 50;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.line(pageWidth / 2 - 50, y, pageWidth / 2 + 50, y);
  doc.text('Assinatura do Responsável', pageWidth / 2, y + 5, { align: 'center' });

  addFooter(doc);
  doc.output('dataurlnewwindow');
};
