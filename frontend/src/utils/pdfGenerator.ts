import jsPDF from 'jspdf';

// Tipos
interface DadosEscola {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

interface DadosReciboMensalidade {
  alunoNome: string;
  mesReferencia: string;
  anoReferencia: string | number;
  dataVencimento: string;
  dataPagamento: string;
  valor: number;
  formaPagamento: string;
}

interface DadosReciboDespesa {
  descricao: string;
  categoria: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string;
  fornecedor?: string;
  formaPagamento: string;
}

interface DadosReciboPagamentoFuncionario {
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

interface DadosTermoMatricula {
  alunoNome: string;
  alunoDataNascimento?: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  responsavelTelefone?: string;
  anoLetivo: string | number;
  planoNome: string;
  valorMensalidade: number;
  valorMatricula: number;
  desconto: number;
  dataMatricula: string;
  turmaNome?: string;
}

// Função auxiliar para formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função auxiliar para formatar data
const formatDate = (date: string | Date): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

// Cabeçalho padrão do PDF
const addHeader = (doc: jsPDF, titulo: string, escola?: DadosEscola) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Título da escola
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // Azul
  doc.text(escola?.nome || 'Sistema Escolar', pageWidth / 2, 20, { align: 'center' });
  
  // Informações da escola
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
  
  // Linha separadora
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(20, 45, pageWidth - 20, 45);
  
  // Título do documento
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(titulo, pageWidth / 2, 55, { align: 'center' });
  
  return 65; // Retorna a posição Y após o cabeçalho
};

// Rodapé padrão
const addFooter = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text(
    `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
};

// ==================== RECIBO DE MENSALIDADE ====================
export const gerarReciboMensalidadePDF = (dados: DadosReciboMensalidade, escola?: DadosEscola): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let y = addHeader(doc, 'RECIBO DE PAGAMENTO - MENSALIDADE', escola);
  
  // Informações do pagamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  
  const lineHeight = 10;
  
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Aluno:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(dados.alunoNome, 60, y);
  
  y += lineHeight;
  doc.setFont('helvetica', 'bold');
  doc.text('Referência:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dados.mesReferencia}/${dados.anoReferencia}`, 60, y);
  
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
  
  // Valor destacado
  y += 20;
  doc.setFillColor(22, 163, 74); // Verde
  doc.roundedRect(pageWidth / 2 - 50, y - 5, 100, 25, 3, 3, 'F');
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR PAGO', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(18);
  doc.text(formatCurrency(dados.valor), pageWidth / 2, y + 15, { align: 'center' });
  
  // Assinatura
  y += 50;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.line(pageWidth / 2 - 50, y, pageWidth / 2 + 50, y);
  doc.text('Assinatura do Responsável', pageWidth / 2, y + 5, { align: 'center' });
  
  addFooter(doc);
  
  // Abrir em nova janela para impressão
  doc.output('dataurlnewwindow');
};

// ==================== RECIBO DE DESPESA ====================
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
  
  // Valor destacado
  y += 20;
  doc.setFillColor(220, 38, 38); // Vermelho
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

// ==================== RECIBO DE PAGAMENTO DE FUNCIONÁRIO ====================
export const gerarReciboPagamentoFuncionarioPDF = (dados: DadosReciboPagamentoFuncionario, escola?: DadosEscola): void => {
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
  
  // Detalhamento
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
  
  // Valor líquido destacado
  y += 25;
  doc.setFillColor(30, 64, 175); // Azul
  doc.roundedRect(pageWidth / 2 - 60, y - 5, 120, 25, 3, 3, 'F');
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR LÍQUIDO', pageWidth / 2, y + 5, { align: 'center' });
  doc.setFontSize(18);
  doc.text(formatCurrency(dados.valorLiquido), pageWidth / 2, y + 15, { align: 'center' });
  
  // Assinatura
  y += 50;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.line(pageWidth / 2 - 50, y, pageWidth / 2 + 50, y);
  doc.text('Assinatura do Funcionário', pageWidth / 2, y + 5, { align: 'center' });
  
  addFooter(doc);
  
  doc.output('dataurlnewwindow');
};

// ==================== TERMO DE MATRÍCULA ====================
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
  
  // Assinatura Responsável
  doc.line(20, y, 90, y);
  doc.text('Assinatura do Responsável', 55, y + 5, { align: 'center' });
  
  // Assinatura Escola
  doc.line(pageWidth - 90, y, pageWidth - 20, y);
  doc.text('Assinatura da Instituição', pageWidth - 55, y + 5, { align: 'center' });
  
  // Data
  y += 20;
  doc.text(`Local e Data: __________________, ${formatDate(new Date().toISOString())}`, 20, y);
  
  addFooter(doc);
  
  doc.output('dataurlnewwindow');
};

export default {
  gerarReciboMensalidadePDF,
  gerarReciboDespesaPDF,
  gerarReciboPagamentoFuncionarioPDF,
  gerarTermoMatriculaPDF,
};
