import { query, queryOne } from '../database/connection';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class EscolaService {
  async buscar() {
    return await queryOne('SELECT * FROM escolas LIMIT 1', []);
  }

  async criar(data: any) {
    const id = uuidv4();
    await query(
      `INSERT INTO escolas (id, nome, cnpj, telefone, email, endereco, cidade, estado, cep, diretor, secretario, logo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, data.nome, data.cnpj, data.telefone, data.email, data.endereco, data.cidade, data.estado, data.cep, data.diretor, data.secretario, data.logo]
    );
    
    logger.info('Escola criada');
    return this.buscar();
  }

  async atualizar(data: any) {
    let escola = await this.buscar();
    
    if (!escola) {
      // Criar escola se não existir
      return this.criar(data);
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const campos = ['nome', 'cnpj', 'telefone', 'email', 'endereco', 'cidade', 'estado', 'cep', 'diretor', 'secretario', 'logo'];
    
    for (const campo of campos) {
      if (data[campo] !== undefined) {
        fields.push(`${campo} = $${paramIndex++}`);
        values.push(data[campo]);
      }
    }

    if (fields.length === 0) {
      return escola;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(escola.id);

    await query(
      `UPDATE escolas SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    logger.info('Escola atualizada');
    return this.buscar();
  }
}

export const escolaService = new EscolaService();
