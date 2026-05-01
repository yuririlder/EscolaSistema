import jsPDF from 'jspdf';
import { addFooter, addHeader } from '../global/components';
import { DadosEscola } from '../global/types';
import { formatCurrency } from '../global/utils';
import { DadosReciboPagamentoFuncionario } from './types';

export const gerarReciboPagamentoFuncionarioPDF = (
  dados: DadosReciboPagamentoFuncionario,
  escola?: DadosEscola,
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = addHeader(doc, 'RECIBO DE PAGAMENTO - FUNCIONÁRIO', escola);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  const lineHeight = 10;

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Funcionário:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.funcionarioNome, 60, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Referência:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dados.mesReferencia}/${dados.anoReferencia}`, 60, y);

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

  y += 15;
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, y - 5, pageWidth - 40, 45, 3, 3, 'FD');

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('Salário Base:', 30, y);
  doc.text(formatCurrency(dados.salarioBase), pageWidth - 50, y, { align: 'right' });

  y += lineHeight;
  doc.text('Bônus (+):', 30, y);
  doc.setTextColor(22, 163, 74);
  doc.text(formatCurrency(dados.bonus), pageWidth - 50, y, { align: 'right' });

  y += lineHeight;
  doc.setTextColor(0);
  doc.text('Descontos (-):', 30, y);
  doc.setTextColor(220, 38, 38);
  doc.text(formatCurrency(dados.descontos), pageWidth - 50, y, { align: 'right' });

  y += 25;
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(pageWidth / 2 - 60, y - 5, 120, 25, 3, 3, 'F');
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR LÍQUIDO', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(18);
  doc.text(formatCurrency(dados.valorLiquido), pageWidth / 2, y + 15, { align: 'center' });

  y += 50;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.line(pageWidth / 2 - 50, y, pageWidth / 2 + 50, y);
  doc.text('Assinatura do Funcionário', pageWidth / 2, y + 5, { align: 'center' });

  addFooter(doc);
  doc.output('dataurlnewwindow');
};
