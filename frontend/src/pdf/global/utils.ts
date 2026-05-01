import jsPDF from 'jspdf';

export const valorPorExtenso = (valor: number): string => {
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

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

export const renderJustifiedText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number => {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((line, i) => {
    const isLast = i === lines.length - 1;
    if (isLast) {
      doc.text(line, x, y);
    } else {
      const words = line.trim().split(' ');
      if (words.length <= 1) {
        doc.text(line, x, y);
      } else {
        const totalWordsWidth = words.reduce((sum, w) => sum + doc.getTextWidth(w), 0);
        const gap = (maxWidth - totalWordsWidth) / (words.length - 1);
        let curX = x;
        words.forEach((word) => {
          doc.text(word, curX, y);
          curX += doc.getTextWidth(word) + gap;
        });
      }
    }
    y += lineHeight;
  });
  return y;
};
