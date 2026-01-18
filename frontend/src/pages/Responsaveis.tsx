import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { MaskedInput } from '../components/ui/MaskedInput';
import { Responsavel } from '../types';
import { responsavelService } from '../services/responsavelService';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCPF, formatPhone, removeMask } from '../utils/masks';

const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export function Responsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponsavel, setEditingResponsavel] = useState<Responsavel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    celular: '',
    endereco: '',
    bairro: '',
    complemento: '',
    cidade: '',
    estado: '',
    cep: '',
    profissao: '',
    local_trabalho: '',
    observacoes: '',
  });

  useEffect(() => {
    loadResponsaveis();
  }, []);

  const loadResponsaveis = async () => {
    try {
      const data = await responsavelService.listar();
      setResponsaveis(data);
    } catch (error) {
      toast.error('Erro ao carregar responsáveis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (responsavel?: Responsavel) => {
    if (responsavel) {
      setEditingResponsavel(responsavel);
      const r = responsavel as any;
      setFormData({
        nome: responsavel.nome,
        cpf: formatCPF(responsavel.cpf),
        rg: r.rg || '',
        data_nascimento: r.data_nascimento ? new Date(r.data_nascimento).toISOString().split('T')[0] : '',
        email: responsavel.email || '',
        telefone: formatPhone(responsavel.telefone),
        celular: formatPhone(r.celular || ''),
        endereco: responsavel.endereco || '',
        bairro: r.bairro || '',
        complemento: r.complemento || '',
        cidade: r.cidade || '',
        estado: r.estado || '',
        cep: r.cep || '',
        profissao: responsavel.profissao || '',
        local_trabalho: r.local_trabalho || '',
        observacoes: r.observacoes || '',
      });
    } else {
      setEditingResponsavel(null);
      setFormData({
        nome: '',
        cpf: '',
        rg: '',
        data_nascimento: '',
        email: '',
        telefone: '',
        celular: '',
        endereco: '',
        bairro: '',
        complemento: '',
        cidade: '',
        estado: '',
        cep: '',
        profissao: '',
        local_trabalho: '',
        observacoes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResponsavel(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      cpf: removeMask(formData.cpf),
      telefone: removeMask(formData.telefone),
      celular: removeMask(formData.celular),
      cep: removeMask(formData.cep),
    };

    try {
      if (editingResponsavel) {
        await responsavelService.atualizar(editingResponsavel.id, payload);
        toast.success('Responsável atualizado com sucesso!');
      } else {
        await responsavelService.criar(payload);
        toast.success('Responsável criado com sucesso!');
      }
      handleCloseModal();
      loadResponsaveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar responsável');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este responsável? O histórico será mantido.')) return;

    try {
      await responsavelService.excluir(id);
      toast.success('Responsável desativado com sucesso!');
      loadResponsaveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar responsável');
    }
  };

  const filteredResponsaveis = responsaveis.filter(
    (r) =>
      r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf.includes(searchTerm)
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'cpf', header: 'CPF' },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'profissao', header: 'Profissão' },
    {
      key: 'actions',
      header: 'Ações',
      render: (responsavel: Responsavel) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(responsavel)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(responsavel.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Responsáveis</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Novo Responsável
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            data={filteredResponsaveis}
            columns={columns}
            keyExtractor={(r) => r.id}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingResponsavel ? 'Editar Responsável' : 'Novo Responsável'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Data de Nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              />
              <MaskedInput
                label="CPF"
                mask="cpf"
                value={formData.cpf}
                onChange={(value) => setFormData({ ...formData, cpf: value })}
                placeholder="000.000.000-00"
                required
              />
              <Input
                label="RG"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
              <Input
                label="Profissão"
                value={formData.profissao}
                onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
              />
              <Input
                label="Local de Trabalho"
                value={formData.local_trabalho}
                onChange={(e) => setFormData({ ...formData, local_trabalho: e.target.value })}
              />
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <MaskedInput
                label="Telefone"
                mask="phone"
                value={formData.telefone}
                onChange={(value) => setFormData({ ...formData, telefone: value })}
                placeholder="(00) 00000-0000"
                required
              />
              <MaskedInput
                label="Celular"
                mask="phone"
                value={formData.celular}
                onChange={(value) => setFormData({ ...formData, celular: value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Rua"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <Input
                label="Bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              />
              <Input
                label="Complemento"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                placeholder="Apto, Bloco, etc."
              />
              <Input
                label="Cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
              <Select
                label="Estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                options={ESTADOS_BRASIL}
                placeholder="Selecione"
              />
              <MaskedInput
                label="CEP"
                mask="cep"
                value={formData.cep}
                onChange={(value) => setFormData({ ...formData, cep: value })}
                placeholder="00000-000"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingResponsavel ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
