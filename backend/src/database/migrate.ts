import { pool } from './connection';
import { logger } from '../utils/logger';

// SQL para criação das tabelas (PostgreSQL)
const createTables = `
-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela Escola
CREATE TABLE IF NOT EXISTS escolas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  diretor VARCHAR(255),
  secretario VARCHAR(255),
  logo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  cargo VARCHAR(100) NOT NULL,
  salario DECIMAL(10,2) NOT NULL,
  data_contratacao DATE NOT NULL,
  data_desligamento DATE,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Professores
CREATE TABLE IF NOT EXISTS professores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID UNIQUE NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  formacao TEXT,
  especialidade VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Responsáveis
CREATE TABLE IF NOT EXISTS responsaveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  profissao VARCHAR(100),
  local_trabalho VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Turmas
CREATE TABLE IF NOT EXISTS turmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  ano INTEGER NOT NULL,
  turno VARCHAR(20) NOT NULL,
  serie VARCHAR(50),
  sala_numero VARCHAR(20),
  capacidade INTEGER DEFAULT 30,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Alunos
CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  rg VARCHAR(20),
  data_nascimento DATE NOT NULL,
  sexo VARCHAR(1),
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  responsavel_id UUID NOT NULL REFERENCES responsaveis(id),
  turma_id UUID REFERENCES turmas(id),
  matricula_ativa BOOLEAN DEFAULT false,
  data_matricula DATE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Turma-Professor
CREATE TABLE IF NOT EXISTS turma_professores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
  disciplina VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(turma_id, professor_id, disciplina)
);

-- Tabela Notas
CREATE TABLE IF NOT EXISTS notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina VARCHAR(100) NOT NULL,
  bimestre INTEGER NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
  nota DECIMAL(4,2) NOT NULL CHECK (nota >= 0 AND nota <= 10),
  tipo VARCHAR(50),
  observacao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aluno_id, turma_id, disciplina, bimestre, tipo)
);

-- Tabela Planos de Mensalidade
CREATE TABLE IF NOT EXISTS planos_mensalidade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Matrículas
CREATE TABLE IF NOT EXISTS matriculas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id),
  plano_id UUID NOT NULL REFERENCES planos_mensalidade(id),
  ano_letivo INTEGER NOT NULL,
  valor_matricula DECIMAL(10,2) NOT NULL,
  valor_mensalidade DECIMAL(10,2) NOT NULL,
  dia_vencimento INTEGER DEFAULT 10,
  data_matricula DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'ATIVA',
  desconto DECIMAL(5,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Mensalidades
CREATE TABLE IF NOT EXISTS mensalidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id),
  matricula_id UUID NOT NULL REFERENCES matriculas(id),
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2),
  desconto DECIMAL(10,2) DEFAULT 0,
  multa DECIMAL(10,2) DEFAULT 0,
  juros DECIMAL(10,2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Despesas
CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50),
  fornecedor VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Pagamentos de Funcionários
CREATE TABLE IF NOT EXISTS pagamentos_funcionarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  salario_base DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0,
  descontos DECIMAL(10,2) DEFAULT 0,
  valor_liquido DECIMAL(10,2) NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(funcionario_id, mes_referencia, ano_referencia)
);

-- Tabela Histórico Escolar (vínculo aluno-turma por ano letivo)
CREATE TABLE IF NOT EXISTS historico_escolar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  ano_letivo INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'CURSANDO',
  data_entrada DATE DEFAULT CURRENT_DATE,
  data_saida DATE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aluno_id, ano_letivo)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_alunos_responsavel ON alunos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_notas_aluno ON notas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_notas_turma ON notas(turma_id);
CREATE INDEX IF NOT EXISTS idx_mensalidades_aluno ON mensalidades(aluno_id);
CREATE INDEX IF NOT EXISTS idx_mensalidades_status ON mensalidades(status);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_funcionario ON pagamentos_funcionarios(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_historico_escolar_aluno ON historico_escolar(aluno_id);
CREATE INDEX IF NOT EXISTS idx_historico_escolar_turma ON historico_escolar(turma_id);
CREATE INDEX IF NOT EXISTS idx_historico_escolar_ano ON historico_escolar(ano_letivo);
`;

// SQL para adicionar colunas faltantes em tabelas existentes
const alterTables = `
-- Adicionar forma_pagamento em despesas se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='despesas' AND column_name='forma_pagamento') THEN
    ALTER TABLE despesas ADD COLUMN forma_pagamento VARCHAR(50);
  END IF;
END $$;

-- Adicionar forma_pagamento em pagamentos_funcionarios se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagamentos_funcionarios' AND column_name='forma_pagamento') THEN
    ALTER TABLE pagamentos_funcionarios ADD COLUMN forma_pagamento VARCHAR(50);
  END IF;
END $$;

-- Adicionar campo ativo em alunos se não existir (para soft delete)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='ativo') THEN
    ALTER TABLE alunos ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar campo ativo em notas se não existir (para soft delete)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notas' AND column_name='ativo') THEN
    ALTER TABLE notas ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar campo ativo em matriculas se não existir (para soft delete)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matriculas' AND column_name='ativo') THEN
    ALTER TABLE matriculas ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar campo ativo em mensalidades se não existir (para soft delete)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mensalidades' AND column_name='ativo') THEN
    ALTER TABLE mensalidades ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar campo ativo em responsaveis se não existir (para soft delete)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responsaveis' AND column_name='ativo') THEN
    ALTER TABLE responsaveis ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar novos campos em responsaveis (bairro, complemento)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responsaveis' AND column_name='bairro') THEN
    ALTER TABLE responsaveis ADD COLUMN bairro VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responsaveis' AND column_name='complemento') THEN
    ALTER TABLE responsaveis ADD COLUMN complemento VARCHAR(255);
  END IF;
END $$;

-- Adicionar campo parentesco em alunos (relação com responsável)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='parentesco_responsavel') THEN
    ALTER TABLE alunos ADD COLUMN parentesco_responsavel VARCHAR(50);
  END IF;
END $$;

-- Adicionar campos de saúde em alunos
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='possui_alergia') THEN
    ALTER TABLE alunos ADD COLUMN possui_alergia BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='alergia_descricao') THEN
    ALTER TABLE alunos ADD COLUMN alergia_descricao TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='restricao_alimentar') THEN
    ALTER TABLE alunos ADD COLUMN restricao_alimentar BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='restricao_alimentar_descricao') THEN
    ALTER TABLE alunos ADD COLUMN restricao_alimentar_descricao TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='uso_medicamento') THEN
    ALTER TABLE alunos ADD COLUMN uso_medicamento BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='medicamento_descricao') THEN
    ALTER TABLE alunos ADD COLUMN medicamento_descricao TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='necessidade_especial') THEN
    ALTER TABLE alunos ADD COLUMN necessidade_especial BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='necessidade_especial_descricao') THEN
    ALTER TABLE alunos ADD COLUMN necessidade_especial_descricao TEXT;
  END IF;
END $$;

-- Adicionar campos de autorização em alunos
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='autoriza_atividades') THEN
    ALTER TABLE alunos ADD COLUMN autoriza_atividades BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='autoriza_emergencia') THEN
    ALTER TABLE alunos ADD COLUMN autoriza_emergencia BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='autoriza_imagem') THEN
    ALTER TABLE alunos ADD COLUMN autoriza_imagem BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Adicionar campos de documentos em alunos
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='doc_certidao_nascimento') THEN
    ALTER TABLE alunos ADD COLUMN doc_certidao_nascimento BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='doc_cpf_aluno') THEN
    ALTER TABLE alunos ADD COLUMN doc_cpf_aluno BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='doc_rg_cpf_responsavel') THEN
    ALTER TABLE alunos ADD COLUMN doc_rg_cpf_responsavel BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='doc_comprovante_residencia') THEN
    ALTER TABLE alunos ADD COLUMN doc_comprovante_residencia BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='doc_cartao_sus') THEN
    ALTER TABLE alunos ADD COLUMN doc_cartao_sus BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='doc_carteira_vacinacao') THEN
    ALTER TABLE alunos ADD COLUMN doc_carteira_vacinacao BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Adicionar campo considerações em alunos
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alunos' AND column_name='consideracoes') THEN
    ALTER TABLE alunos ADD COLUMN consideracoes TEXT;
  END IF;
END $$;

-- Criar tabela de contatos de emergência
CREATE TABLE IF NOT EXISTS contatos_emergencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  parentesco VARCHAR(50) NOT NULL,
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contatos_emergencia_aluno ON contatos_emergencia(aluno_id);
`;

// Run migrations
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Iniciando migrations do banco de dados PostgreSQL...');
    
    await pool.query(createTables);
    await pool.query(alterTables);
    
    logger.info('Migrations executadas com sucesso!');
  } catch (error) {
    logger.error('Erro ao executar migrations:', error);
    throw error;
  }
}

export default runMigrations;

// Auto-run when executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations concluídas');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Erro nas migrations:', err);
      process.exit(1);
    });
}
