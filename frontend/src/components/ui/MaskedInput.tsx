import { InputHTMLAttributes, forwardRef } from 'react';
import { formatCPF, formatCNPJ, formatPhone, formatCEP } from '../../utils/masks';

type MaskType = 'cpf' | 'cnpj' | 'phone' | 'cep';

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  mask: MaskType;
  value: string;
  onChange: (value: string) => void;
}

const maskFunctions: Record<MaskType, (value: string) => string> = {
  cpf: formatCPF,
  cnpj: formatCNPJ,
  phone: formatPhone,
  cep: formatCEP,
};

const maxLengths: Record<MaskType, number> = {
  cpf: 14,    // 000.000.000-00
  cnpj: 18,   // 00.000.000/0000-00
  phone: 15,  // (00) 00000-0000
  cep: 9,     // 00000-000
};

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, error, mask, value, onChange, className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formatted = maskFunctions[mask](rawValue);
      onChange(formatted);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          maxLength={maxLengths[mask]}
          className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
