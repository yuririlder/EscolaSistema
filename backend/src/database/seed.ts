import { pool, query, queryOne } from './connection';
import { runMigrations } from './migrate';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

async function seed(): Promise<void> {
  try {
    logger.info('Iniciando seed do banco de dados PostgreSQL...');

    // Primeiro executar migrations
    await runMigrations();

    // Criar usuário admin padrão
    const adminExists = await queryOne(
      'SELECT id FROM usuarios WHERE email = $1',
      ['admin@escola.com']
    );

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await query(
        `INSERT INTO usuarios (nome, email, senha, perfil, ativo)
         VALUES ($1, $2, $3, $4, $5)`,
        ['Administrador', 'admin@escola.com', hashedPassword, 'ADMIN', true]
      );
      logger.info('Usuário admin criado: admin@escola.com / admin123');
    } else {
      logger.info('Usuário admin já existe');
    }

    // Criar escola padrão se não existir
    const escolaExists = await queryOne('SELECT id FROM escolas LIMIT 1', []);
    
    if (!escolaExists) {
      await query(
        `INSERT INTO escolas (nome, cnpj, telefone, email, endereco, cidade, estado, cep)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'Escola Sistema',
          '00.000.000/0001-00',
          '(00) 0000-0000',
          'contato@escolasistema.com.br',
          'Rua Principal, 123',
          'São Paulo',
          'SP',
          '00000-000'
        ]
      );
      logger.info('Escola padrão criada com sucesso');
    }

    // Criar alguns planos de mensalidade padrão
    const planosExist = await queryOne('SELECT id FROM planos_mensalidade LIMIT 1', []);
    
    if (!planosExist) {
      const planos = [
        { nome: 'Integral', valor: 1500.00, descricao: 'Período integral' },
        { nome: 'Matutino', valor: 800.00, descricao: 'Período matutino' },
        { nome: 'Vespertino', valor: 800.00, descricao: 'Período vespertino' }
      ];

      for (const plano of planos) {
        await query(
          `INSERT INTO planos_mensalidade (nome, valor, descricao, ativo)
           VALUES ($1, $2, $3, $4)`,
          [plano.nome, plano.valor, plano.descricao, true]
        );
      }
      logger.info('Planos de mensalidade criados com sucesso');
    }

    logger.info('Seed concluído com sucesso!');
    
  } catch (error) {
    logger.error('Erro ao executar seed', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar seed quando chamado diretamente
seed();
