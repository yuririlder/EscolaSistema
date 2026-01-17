import { Pool } from 'pg';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// Criar pool de conexões PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Testar conexão com banco de dados
export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('Conexão com banco de dados PostgreSQL estabelecida');
  } catch (error) {
    logger.error('Erro ao conectar com banco de dados PostgreSQL:', error);
    throw error;
  }
}

// Helper para executar queries
export async function query(text: string, params: any[] = []): Promise<any> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query executada em ${duration}ms`);
    return result;
  } catch (error: any) {
    logger.error(`Erro na query: ${error.message}`);
    throw error;
  }
}

// Helper para buscar um registro
export async function queryOne(text: string, params: any[] = []): Promise<any | null> {
  const result = await query(text, params);
  return result.rows?.[0] || null;
}

// Helper para buscar múltiplos registros
export async function queryMany(text: string, params: any[] = []): Promise<any[]> {
  const result = await query(text, params);
  return result.rows || [];
}

export default pool;
