import jsPDF from 'jspdf';
import { addFooter, addHeader } from '../global/components';
import { DadosEscola } from '../global/types';
import { formatCurrency, formatDate } from '../global/utils';
import { DadosFichaCompletaAluno } from './types';

export const gerarFichaCompletaAlunoPDF = (dados: DadosFichaCompletaAluno, escola?: DadosEscola): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = addHeader(doc, 'FICHA COMPLETA DO ALUNO', escola);

  const lineHeight = 7;
  const sectionGap = 10;

  const checkNewPage = (neededSpace: number): number => {
    if (y + neededSpace > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
    return y;
  };

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

  // DADOS DO ALUNO
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

  // DADOS DO RESPONSÁVEL
  y = addSection('DADOS DO RESPONSÁVEL', y);
  y = addDataLine('Nome', dados.responsavel.nome, y);
  y = addDataLine('CPF', dados.responsavel.cpf || '-', y);
  if (dados.responsavel.rg) y = addDataLine('RG', dados.responsavel.rg, y);
  if (dados.responsavel.data_nascimento) y = addDataLine('Data de Nascimento', formatDate(dados.responsavel.data_nascimento), y);
  y = addDataLine('E-mail', dados.responsavel.email || '-', y);
  y = addDataLine('Telefone', dados.responsavel.telefone || '-', y);
  if (dados.responsavel.celular) y = addDataLine('Celular', dados.responsavel.celular, y);

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

  // CONTATOS DE EMERGÊNCIA
  if (dados.contatosEmergencia && dados.contatosEmergencia.length > 0) {
    y = addSection('CONTATOS DE EMERGÊNCIA', y);
    dados.contatosEmergencia.forEach((contato, index) => {
      y = addDataLine(`Contato ${index + 1}`, `${contato.nome} - ${contato.telefone} (${contato.parentesco})`, y);
    });
    y += sectionGap;
  }

  // INFORMAÇÕES DE SAÚDE
  if (dados.saude) {
    y = addSection('INFORMAÇÕES DE SAÚDE', y);
    y = addDataLine('Alergias', dados.saude.possui_alergia ? (dados.saude.alergia_descricao || 'Sim') : 'Não possui', y);
    y = addDataLine('Restrições Alimentares', dados.saude.restricao_alimentar ? (dados.saude.restricao_alimentar_descricao || 'Sim') : 'Não possui', y);
    y = addDataLine('Uso de Medicamentos', dados.saude.uso_medicamento ? (dados.saude.medicamento_descricao || 'Sim') : 'Não utiliza', y);
    y = addDataLine('Necessidades Especiais', dados.saude.necessidade_especial ? (dados.saude.necessidade_especial_descricao || 'Sim') : 'Não possui', y);
    y += sectionGap;
  }

  // AUTORIZAÇÕES
  if (dados.autorizacoes) {
    y = addSection('AUTORIZAÇÕES', y);
    y = addCheckbox('Autorizo a participação em atividades externas, passeios e eventos', dados.autorizacoes.autoriza_atividades || false, y);
    y = addCheckbox('Autorizo atendimento médico de emergência quando necessário', dados.autorizacoes.autoriza_emergencia || false, y);
    y = addCheckbox('Autorizo o uso da imagem do aluno para fins educacionais e divulgação', dados.autorizacoes.autoriza_imagem || false, y);
    y += sectionGap;
  }

  // DOCUMENTOS ENTREGUES
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

  // CONSIDERAÇÕES ADICIONAIS
  if (dados.consideracoes) {
    y = addSection('CONSIDERAÇÕES ADICIONAIS', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitConsideracoes = doc.splitTextToSize(dados.consideracoes, pageWidth - 40);
    checkNewPage(splitConsideracoes.length * 5 + 10);
    doc.text(splitConsideracoes, 20, y);
    y += splitConsideracoes.length * 5 + sectionGap;
  }

  // DADOS DA MATRÍCULA
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

  // DADOS DA TURMA
  if (dados.turma) {
    y = addSection('DADOS DA TURMA', y);
    y = addDataLine('Turma', dados.turma.nome, y);
    y = addDataLine('Série', dados.turma.serie || '-', y);
    y = addDataLine('Turno', dados.turma.turno || '-', y);
    y = addDataLine('Ano', String(dados.turma.ano || '-'), y);
    y += sectionGap;
  }

  // PLANO DE MENSALIDADE
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

  // Assinaturas
  checkNewPage(50);
  y += 10;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);

  doc.line(20, y + 15, 90, y + 15);
  doc.setFontSize(9);
  doc.text('Assinatura do Responsável', 55, y + 20, { align: 'center' });

  doc.line(pageWidth - 90, y + 15, pageWidth - 20, y + 15);
  doc.text('Assinatura da Instituição', pageWidth - 55, y + 20, { align: 'center' });

  y += 35;
  doc.setFont('helvetica', 'normal');
  doc.text(`Local e Data: __________________, ${formatDate(new Date().toISOString())}`, 20, y);

  addFooter(doc);
  doc.output('dataurlnewwindow');
};
