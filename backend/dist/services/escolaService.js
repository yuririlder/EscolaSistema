"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escolaService = void 0;
const connection_1 = require("../database/connection");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class EscolaService {
    async buscar() {
        return await (0, connection_1.queryOne)('SELECT * FROM escolas LIMIT 1', []);
    }
    async criar(data) {
        const id = (0, uuid_1.v4)();
        await (0, connection_1.query)(`INSERT INTO escolas (id, nome, cnpj, telefone, email, endereco, cidade, estado, cep, diretor, secretario, logo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [id, data.nome, data.cnpj, data.telefone, data.email, data.endereco, data.cidade, data.estado, data.cep, data.diretor, data.secretario, data.logo]);
        logger_1.logger.info('Escola criada');
        return this.buscar();
    }
    async atualizar(data) {
        let escola = await this.buscar();
        if (!escola) {
            // Criar escola se não existir
            return this.criar(data);
        }
        const fields = [];
        const values = [];
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
        await (0, connection_1.query)(`UPDATE escolas SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
        logger_1.logger.info('Escola atualizada');
        return this.buscar();
    }
}
exports.escolaService = new EscolaService();
//# sourceMappingURL=escolaService.js.map