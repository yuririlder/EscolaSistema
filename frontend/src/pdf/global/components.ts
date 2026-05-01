import jsPDF from 'jspdf';
import { DadosEscola } from './types';

export const addHeader = (doc: jsPDF, titulo: string, escola?: DadosEscola): number => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(escola?.nome || 'Sistema Escolar', pageWidth / 2, 20, { align: 'center' });

  if (escola) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    let y = 28;
    if (escola.cnpj) {
      doc.text(`CNPJ: ${escola.cnpj}`, pageWidth / 2, y, { align: 'center' });
      y += 5;
    }
    if (escola.endereco) {
      doc.text(escola.endereco, pageWidth / 2, y, { align: 'center' });
      y += 5;
    }
    if (escola.telefone || escola.email) {
      doc.text(`${escola.telefone || ''} | ${escola.email || ''}`.trim(), pageWidth / 2, y, { align: 'center' });
    }
  }

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(20, 45, pageWidth - 20, 45);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(titulo, pageWidth / 2, 55, { align: 'center' });

  return 65;
};

export const addFooter = (doc: jsPDF): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text(
    `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' },
  );
};
