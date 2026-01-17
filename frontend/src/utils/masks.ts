// Máscaras de formatação
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  return numbers.replace(/(\d{5})(\d)/, '$1-$2');
}

export function removeMask(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

export function formatDateToISO(dateString: string): string {
  // Converte dd/mm/yyyy para yyyy-mm-dd
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateString;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Máscara para valores monetários (input)
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers, 10) / 100;
  
  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Converte valor formatado para número
export function currencyToNumber(value: string): number {
  if (!value) return 0;
  // Remove pontos de milhar e troca vírgula por ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleanValue);
  return isNaN(num) ? 0 : num;
}

// Máscara para números inteiros
export function formatNumberInput(value: string): string {
  return value.replace(/\D/g, '');
}

// Máscara para porcentagem (0-100)
export function formatPercentInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const num = parseInt(numbers, 10);
  if (isNaN(num)) return '';
  if (num > 100) return '100';
  return num.toString();
}
