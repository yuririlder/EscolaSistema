import jsPDF from 'jspdf';

// Função para converter valor em extenso
const valorPorExtenso = (valor: number): string => {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  const numero = Math.floor(valor);
  const centavos = Math.round((valor - numero) * 100);
  
  if (numero === 0 && centavos === 0) return 'zero reais';
  
  let extenso = '';
  
  if (numero >= 1000) {
    const milhares = Math.floor(numero / 1000);
    if (milhares === 1) {
      extenso += 'mil';
    } else if (milhares < 20) {
      extenso += unidades[milhares] + ' mil';
    } else {
      const dezMilhar = Math.floor(milhares / 10);
      const uniMilhar = milhares % 10;
      extenso += dezenas[dezMilhar];
      if (uniMilhar > 0) extenso += ' e ' + unidades[uniMilhar];
      extenso += ' mil';
    }
  }
  
  const resto = numero % 1000;
  if (resto > 0) {
    if (extenso) extenso += ' ';
    
    if (resto === 100) {
      extenso += 'cem';
    } else {
      const centena = Math.floor(resto / 100);
      const dezenaUnidade = resto % 100;
      
      if (centena > 0) {
        extenso += centenas[centena];
        if (dezenaUnidade > 0) extenso += ' e ';
      }
      
      if (dezenaUnidade > 0) {
        if (dezenaUnidade < 20) {
          extenso += unidades[dezenaUnidade];
        } else {
          const dezena = Math.floor(dezenaUnidade / 10);
          const unidade = dezenaUnidade % 10;
          extenso += dezenas[dezena];
          if (unidade > 0) extenso += ' e ' + unidades[unidade];
        }
      }
    }
  }
  
  if (numero === 1) {
    extenso += ' real';
  } else if (numero > 0) {
    extenso += ' reais';
  }
  
  if (centavos > 0) {
    if (numero > 0) extenso += ' e ';
    if (centavos < 20) {
      extenso += unidades[centavos];
    } else {
      const dezCent = Math.floor(centavos / 10);
      const uniCent = centavos % 10;
      extenso += dezenas[dezCent];
      if (uniCent > 0) extenso += ' e ' + unidades[uniCent];
    }
    extenso += centavos === 1 ? ' centavo' : ' centavos';
  }
  
  return extenso;
};

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
  responsavelNome?: string;
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
  
  // Declaração
  y += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  
  const valorFormatado = formatCurrency(dados.valor);
  const declaracao = `Declaramos para os devidos fins que recebemos de ${dados.responsavelNome || dados.alunoNome} o valor de ${valorFormatado} (${valorPorExtenso(dados.valor)}), referente à mensalidade do mês de ${dados.mesReferencia}/${dados.anoReferencia} do(a) aluno(a) ${dados.alunoNome}.`;
  const splitDeclaracao = doc.splitTextToSize(declaracao, pageWidth - 40);
  doc.text(splitDeclaracao, 20, y);
  
  y += splitDeclaracao.length * 6 + 10;
  
  // Informações do pagamento
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

// ==================== FICHA COMPLETA DO ALUNO ====================
interface ContatoEmergencia {
  nome: string;
  telefone: string;
  parentesco: string;
}

interface DadosFichaCompletaAluno {
  aluno: {
    nome: string;
    data_nascimento?: string;
    cpf?: string;
    sexo?: string;
    matricula_numero?: string;
    parentesco_responsavel?: string;
  };
  responsavel: {
    nome: string;
    cpf?: string;
    rg?: string;
    data_nascimento?: string;
    email?: string;
    telefone?: string;
    celular?: string;
    endereco?: string;
    bairro?: string;
    complemento?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    profissao?: string;
    local_trabalho?: string;
  };
  contatosEmergencia?: ContatoEmergencia[];
  saude?: {
    possui_alergia?: boolean;
    alergia_descricao?: string;
    restricao_alimentar?: boolean;
    restricao_alimentar_descricao?: string;
    uso_medicamento?: boolean;
    medicamento_descricao?: string;
    necessidade_especial?: boolean;
    necessidade_especial_descricao?: string;
  };
  autorizacoes?: {
    autoriza_atividades?: boolean;
    autoriza_emergencia?: boolean;
    autoriza_imagem?: boolean;
  };
  documentos?: {
    doc_certidao_nascimento?: boolean;
    doc_cpf_aluno?: boolean;
    doc_rg_cpf_responsavel?: boolean;
    doc_comprovante_residencia?: boolean;
    doc_cartao_sus?: boolean;
    doc_carteira_vacinacao?: boolean;
  };
  consideracoes?: string;
  matricula?: {
    ano_letivo: number;
    data_matricula?: string;
    valor_matricula: number;
    desconto: number;
    status: string;
    pago?: boolean;
  };
  turma?: {
    nome: string;
    serie?: string;
    turno?: string;
    ano?: number;
  };
  plano?: {
    nome: string;
    valor: number;
  };
}

export const gerarFichaCompletaAlunoPDF = (dados: DadosFichaCompletaAluno, escola?: DadosEscola): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let y = addHeader(doc, 'FICHA COMPLETA DO ALUNO', escola);
  
  const lineHeight = 7;
  const sectionGap = 10;
  
  // Função para verificar e adicionar nova página se necessário
  const checkNewPage = (neededSpace: number): number => {
    if (y + neededSpace > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
    return y;
  };
  
  // Função auxiliar para adicionar seção
  const addSection = (title: string, currentY: number): number => {
    currentY = checkNewPage(25);
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(20, currentY - 5, pageWidth - 40, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255);
    doc.text(title, 25, currentY + 2);
    doc.setTextColor(0);
    return currentY + 15;
  };
  
  // Função auxiliar para adicionar linha de dados
  const addDataLine = (label: string, value: string, currentY: number, x: number = 20): number => {
    currentY = checkNewPage(lineHeight);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${label}:`, x, currentY);
    doc.setFont('helvetica', 'normal');
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.text(value || '-', x + labelWidth, currentY);
    y = currentY + lineHeight;
    return y;
  };
  
  // Função auxiliar para checkbox
  const addCheckbox = (label: string, checked: boolean, currentY: number, x: number = 20): number => {
    currentY = checkNewPage(lineHeight);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.rect(x, currentY - 4, 4, 4);
    if (checked) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', x + 0.8, currentY - 0.5);
    }
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + 7, currentY);
    y = currentY + lineHeight;
    return y;
  };
  
  // SEÇÃO: DADOS DO ALUNO
  y = addSection('DADOS DO ALUNO', y);
  
  y = addDataLine('Nome', dados.aluno.nome, y);
  y = addDataLine('Matrícula', dados.aluno.matricula_numero || 'Não informada', y);
  y = addDataLine('Data de Nascimento', dados.aluno.data_nascimento ? formatDate(dados.aluno.data_nascimento) : '-', y);
  y = addDataLine('CPF', dados.aluno.cpf || 'Não informado', y);
  y = addDataLine('Sexo', dados.aluno.sexo === 'M' ? 'Masculino' : dados.aluno.sexo === 'F' ? 'Feminino' : dados.aluno.sexo || '-', y);
  if (dados.aluno.parentesco_responsavel) {
    y = addDataLine('Parentesco com Responsável', dados.aluno.parentesco_responsavel, y);
  }
  
  y += sectionGap;
  
  // SEÇÃO: DADOS DO RESPONSÁVEL
  y = addSection('DADOS DO RESPONSÁVEL', y);
  
  y = addDataLine('Nome', dados.responsavel.nome, y);
  y = addDataLine('CPF', dados.responsavel.cpf || '-', y);
  if (dados.responsavel.rg) y = addDataLine('RG', dados.responsavel.rg, y);
  if (dados.responsavel.data_nascimento) y = addDataLine('Data de Nascimento', formatDate(dados.responsavel.data_nascimento), y);
  y = addDataLine('E-mail', dados.responsavel.email || '-', y);
  y = addDataLine('Telefone', dados.responsavel.telefone || '-', y);
  if (dados.responsavel.celular) y = addDataLine('Celular', dados.responsavel.celular, y);
  
  // Endereço completo
  let enderecoCompleto = dados.responsavel.endereco || '';
  if (dados.responsavel.bairro) enderecoCompleto += `, ${dados.responsavel.bairro}`;
  if (dados.responsavel.complemento) enderecoCompleto += ` - ${dados.responsavel.complemento}`;
  if (dados.responsavel.cidade) enderecoCompleto += `, ${dados.responsavel.cidade}`;
  if (dados.responsavel.estado) enderecoCompleto += `/${dados.responsavel.estado}`;
  if (dados.responsavel.cep) enderecoCompleto += ` - CEP: ${dados.responsavel.cep}`;
  y = addDataLine('Endereço', enderecoCompleto || '-', y);
  
  if (dados.responsavel.profissao) y = addDataLine('Profissão', dados.responsavel.profissao, y);
  if (dados.responsavel.local_trabalho) y = addDataLine('Local de Trabalho', dados.responsavel.local_trabalho, y);
  
  y += sectionGap;
  
  // SEÇÃO: CONTATOS DE EMERGÊNCIA
  if (dados.contatosEmergencia && dados.contatosEmergencia.length > 0) {
    y = addSection('CONTATOS DE EMERGÊNCIA', y);
    
    dados.contatosEmergencia.forEach((contato, index) => {
      y = addDataLine(`Contato ${index + 1}`, `${contato.nome} - ${contato.telefone} (${contato.parentesco})`, y);
    });
    
    y += sectionGap;
  }
  
  // SEÇÃO: INFORMAÇÕES DE SAÚDE
  if (dados.saude) {
    y = addSection('INFORMAÇÕES DE SAÚDE', y);
    
    if (dados.saude.possui_alergia) {
      y = addDataLine('Alergias', dados.saude.alergia_descricao || 'Sim', y);
    } else {
      y = addDataLine('Alergias', 'Não possui', y);
    }
    
    if (dados.saude.restricao_alimentar) {
      y = addDataLine('Restrições Alimentares', dados.saude.restricao_alimentar_descricao || 'Sim', y);
    } else {
      y = addDataLine('Restrições Alimentares', 'Não possui', y);
    }
    
    if (dados.saude.uso_medicamento) {
      y = addDataLine('Uso de Medicamentos', dados.saude.medicamento_descricao || 'Sim', y);
    } else {
      y = addDataLine('Uso de Medicamentos', 'Não utiliza', y);
    }
    
    if (dados.saude.necessidade_especial) {
      y = addDataLine('Necessidades Especiais', dados.saude.necessidade_especial_descricao || 'Sim', y);
    } else {
      y = addDataLine('Necessidades Especiais', 'Não possui', y);
    }
    
    y += sectionGap;
  }
  
  // SEÇÃO: AUTORIZAÇÕES
  if (dados.autorizacoes) {
    y = addSection('AUTORIZAÇÕES', y);
    
    y = addCheckbox('Autorizo a participação em atividades externas, passeios e eventos', dados.autorizacoes.autoriza_atividades || false, y);
    y = addCheckbox('Autorizo atendimento médico de emergência quando necessário', dados.autorizacoes.autoriza_emergencia || false, y);
    y = addCheckbox('Autorizo o uso da imagem do aluno para fins educacionais e divulgação', dados.autorizacoes.autoriza_imagem || false, y);
    
    y += sectionGap;
  }
  
  // SEÇÃO: DOCUMENTOS ENTREGUES
  if (dados.documentos) {
    y = addSection('DOCUMENTOS ENTREGUES', y);
    
    y = addCheckbox('Certidão de Nascimento', dados.documentos.doc_certidao_nascimento || false, y);
    y = addCheckbox('CPF do Aluno', dados.documentos.doc_cpf_aluno || false, y);
    y = addCheckbox('RG/CPF do Responsável', dados.documentos.doc_rg_cpf_responsavel || false, y);
    y = addCheckbox('Comprovante de Residência', dados.documentos.doc_comprovante_residencia || false, y);
    y = addCheckbox('Cartão SUS', dados.documentos.doc_cartao_sus || false, y);
    y = addCheckbox('Carteira de Vacinação', dados.documentos.doc_carteira_vacinacao || false, y);
    
    y += sectionGap;
  }
  
  // SEÇÃO: CONSIDERAÇÕES ADICIONAIS
  if (dados.consideracoes) {
    y = addSection('CONSIDERAÇÕES ADICIONAIS', y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitConsideracoes = doc.splitTextToSize(dados.consideracoes, pageWidth - 40);
    checkNewPage(splitConsideracoes.length * 5 + 10);
    doc.text(splitConsideracoes, 20, y);
    y += splitConsideracoes.length * 5 + sectionGap;
  }
  
  // SEÇÃO: DADOS DA MATRÍCULA
  if (dados.matricula) {
    y = addSection('DADOS DA MATRÍCULA', y);
    
    y = addDataLine('Ano Letivo', String(dados.matricula.ano_letivo), y);
    y = addDataLine('Data da Matrícula', dados.matricula.data_matricula ? formatDate(dados.matricula.data_matricula) : formatDate(new Date().toISOString()), y);
    y = addDataLine('Valor da Matrícula', formatCurrency(dados.matricula.valor_matricula), y);
    y = addDataLine('Desconto', `${dados.matricula.desconto}%`, y);
    y = addDataLine('Status', dados.matricula.status, y);
    y = addDataLine('Pagamento', dados.matricula.pago ? 'PAGO' : 'PENDENTE', y);
    
    y += sectionGap;
  }
  
  // SEÇÃO: DADOS DA TURMA
  if (dados.turma) {
    y = addSection('DADOS DA TURMA', y);
    
    y = addDataLine('Turma', dados.turma.nome, y);
    y = addDataLine('Série', dados.turma.serie || '-', y);
    y = addDataLine('Turno', dados.turma.turno || '-', y);
    y = addDataLine('Ano', String(dados.turma.ano || '-'), y);
    
    y += sectionGap;
  }
  
  // SEÇÃO: PLANO DE MENSALIDADE
  if (dados.plano) {
    y = addSection('PLANO DE MENSALIDADE', y);
    
    y = addDataLine('Plano', dados.plano.nome, y);
    y = addDataLine('Valor Mensal', formatCurrency(dados.plano.valor), y);
    
    if (dados.matricula && dados.matricula.desconto > 0) {
      const valorComDesconto = dados.plano.valor * (1 - dados.matricula.desconto / 100);
      y = addDataLine('Valor com Desconto', formatCurrency(valorComDesconto), y);
    }
    
    y += sectionGap;
  }
  
  // Área de assinatura
  checkNewPage(50);
  y += 10;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  
  // Assinatura do Responsável
  doc.line(20, y + 15, 90, y + 15);
  doc.setFontSize(9);
  doc.text('Assinatura do Responsável', 55, y + 20, { align: 'center' });
  
  // Assinatura da Escola
  doc.line(pageWidth - 90, y + 15, pageWidth - 20, y + 15);
  doc.text('Assinatura da Instituição', pageWidth - 55, y + 20, { align: 'center' });
  
  // Data
  y += 35;
  doc.setFont('helvetica', 'normal');
  doc.text(`Local e Data: __________________, ${formatDate(new Date().toISOString())}`, 20, y);
  
  addFooter(doc);
  
  doc.output('dataurlnewwindow');
};

export default {
  gerarReciboMensalidadePDF,
  gerarReciboDespesaPDF,
  gerarReciboPagamentoFuncionarioPDF,
  gerarTermoMatriculaPDF,
  gerarFichaCompletaAlunoPDF,
};
