import jsPDF from 'jspdf';
import { addFooter, addHeader } from '../global/components';
import { DadosEscola } from '../global/types';
import { formatCurrency, formatDate } from '../global/utils';
import { DadosTermoMatricula } from './types';

export const gerarTermoMatriculaPDF = (dados: DadosTermoMatricula, escola?: DadosEscola): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = addHeader(doc, 'TERMO DE MATRÍCULA', escola);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);

  const lineHeight = 8;

  // Dados do Aluno
  y += 10;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, y - 5, pageWidth - 40, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO ALUNO', 25, y + 2);

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Nome:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.alunoNome, 50, y);

  if (dados.alunoDataNascimento) {
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Data Nasc.:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(dados.alunoDataNascimento), 50, y);
  }

  if (dados.turmaNome) {
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Turma:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.turmaNome, 50, y);
  }

  // Dados do Responsável
  if (dados.responsavelNome) {
    y += 15;
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, y - 5, pageWidth - 40, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO RESPONSÁVEL', 25, y + 2);

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Nome:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.responsavelNome, 50, y);

    if (dados.responsavelCpf) {
      y += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('CPF:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(dados.responsavelCpf, 50, y);
    }

    if (dados.responsavelTelefone) {
      y += lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text('Telefone:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(dados.responsavelTelefone, 50, y);
    }
  }

  // Dados da Matrícula
  y += 15;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, y - 5, pageWidth - 40, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA MATRÍCULA', 25, y + 2);

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Ano Letivo:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(String(dados.anoLetivo), 55, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Plano:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.planoNome, 55, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Data Matrícula:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(dados.dataMatricula), 55, y);

  // Valores
  y += 15;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, y - 5, pageWidth - 40, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('VALORES', 25, y + 2);

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Valor da Matrícula:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(dados.valorMatricula), 70, y);

  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Valor Mensalidade:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(dados.valorMensalidade), 70, y);

  if (dados.desconto > 0) {
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Desconto:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 163, 74);
    doc.text(`${dados.desconto}%`, 70, y);
    doc.setTextColor(0);
  }

  // Declaração
  y += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const declaracao = `Declaro estar ciente e de acordo com as normas e regulamentos da instituição, bem como com os valores e condições de pagamento estabelecidos neste termo de matrícula para o ano letivo de ${dados.anoLetivo}.`;
  const splitDeclaracao = doc.splitTextToSize(declaracao, pageWidth - 40);
  doc.text(splitDeclaracao, 20, y);

  // Assinaturas
  y += 40;
  doc.setFontSize(10);
  doc.setDrawColor(0);

  doc.line(20, y, 90, y);
  doc.text('Assinatura do Responsável', 55, y + 5, { align: 'center' });

  doc.line(pageWidth - 90, y, pageWidth - 20, y);
  doc.text('Assinatura da Instituição', pageWidth - 55, y + 5, { align: 'center' });

  y += 20;
  doc.text(`Local e Data: __________________, ${formatDate(new Date().toISOString())}`, 20, y);

  addFooter(doc);
  doc.output('dataurlnewwindow');
};
