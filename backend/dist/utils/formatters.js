"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCPF = formatCPF;
exports.unformatCPF = unformatCPF;
exports.isValidCPF = isValidCPF;
exports.formatCNPJ = formatCNPJ;
exports.formatPhone = formatPhone;
exports.formatCEP = formatCEP;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.snakeToCamel = snakeToCamel;
exports.camelToSnake = camelToSnake;
exports.getMonthName = getMonthName;
// Formata CPF: 000.000.000-00
function formatCPF(cpf) {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
// Remove formatação do CPF
function unformatCPF(cpf) {
    return cpf.replace(/\D/g, '');
}
// Valida CPF
function isValidCPF(cpf) {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11)
        return false;
    if (/^(\d)\1+$/.test(numbers))
        return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(numbers[9]))
        return false;
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(numbers[10]))
        return false;
    return true;
}
// Formata CNPJ: 00.000.000/0001-00
function formatCNPJ(cnpj) {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
// Formata telefone: (00) 00000-0000 ou (00) 0000-0000
function formatPhone(phone) {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}
// Formata CEP: 00000-000
function formatCEP(cep) {
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
}
// Formata valor monetário
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
// Formata data para exibição
function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(d);
}
// Formata data e hora para exibição
function formatDateTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(d);
}
// Converte snake_case para camelCase
function snakeToCamel(obj) {
    if (Array.isArray(obj)) {
        return obj.map(snakeToCamel);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[camelKey] = snakeToCamel(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
// Converte camelCase para snake_case
function camelToSnake(obj) {
    if (Array.isArray(obj)) {
        return obj.map(camelToSnake);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = camelToSnake(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
// Gera nome do mês
function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || '';
}
//# sourceMappingURL=formatters.js.map