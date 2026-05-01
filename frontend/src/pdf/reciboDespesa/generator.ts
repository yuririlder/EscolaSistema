import jsPDF from 'jspdf';
import { addFooter, addHeader } from '../global/components';
import { DadosEscola } from '../global/types';
import { formatCurrency } from '../global/utils';
import { DadosReciboDespesa } from './types';

export const gerarReciboDespesaPDF = (dados: DadosReciboDespesa, escola?: DadosEscola): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = addHeader(doc, 'COMPROVANTE DE PAGAMENTO - DESPESA', escola);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  const lineHeight = 10;

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Descrição:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.descricao, 60, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Categoria:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.categoria, 60, y);

  if (dados.fornecedor) {
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Fornecedor:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.fornecedor, 60, y);
  }

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Vencimento:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.dataVencimento, 60, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Data Pagamento:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.dataPagamento, 60, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Forma Pagamento:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.formaPagamento, 60, y);

  y += 20;
  doc.setFillColor(220, 38, 38);
  doc.roundedRect(pageWidth / 2 - 50, y - 5, 100, 25, 3, 3, 'F');
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR PAGO', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(18);
  doc.text(formatCurrency(dados.valor), pageWidth / 2, y + 15, { align: 'center' });

  addFooter(doc);
  doc.output('dataurlnewwindow');
};
