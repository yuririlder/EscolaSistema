import { useState, useRef, useEffect, InputHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface AutocompleteProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  onSearch?: (term: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function Autocomplete({
  label,
  value,
  options,
  onChange,
  onSearch,
  placeholder = 'Digite para buscar...',
  error,
  required,
  ...props
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Encontra o label do valor selecionado
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    // Atualiza o termo de busca quando um valor é selecionado
    if (selectedOption && !isOpen) {
      setSearchTerm(selectedOption.label);
    }
  }, [selectedOption, isOpen]);

  useEffect(() => {
    // Filtra opções baseado no termo de busca
    if (searchTerm.trim()) {
      const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    // Fecha dropdown ao clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Restaura o label do valor selecionado se existir
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    
    if (onSearch) {
      onSearch(term);
    }
    
    // Se limpar o campo, limpa o valor selecionado
    if (!term) {
      onChange('');
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
        }`}
        {...props}
      />
      
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-3 py-2 cursor-pointer hover:bg-primary-50 ${
                option.value === value ? 'bg-primary-100 text-primary-700' : ''
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && filteredOptions.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm">
          Nenhum resultado encontrado
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
