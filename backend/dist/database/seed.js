"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
const migrate_1 = require("./migrate");
const logger_1 = require("../utils/logger");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seed() {
    try {
        logger_1.logger.info('Iniciando seed do banco de dados PostgreSQL...');
        // Primeiro executar migrations
        await (0, migrate_1.runMigrations)();
        // Criar usuário admin padrão
        const adminExists = await (0, connection_1.queryOne)('SELECT id FROM usuarios WHERE email = $1', ['admin@escola.com']);
        if (!adminExists) {
            const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
            await (0, connection_1.query)(`INSERT INTO usuarios (nome, email, senha, perfil, ativo)
         VALUES ($1, $2, $3, $4, $5)`, ['Administrador', 'admin@escola.com', hashedPassword, 'ADMIN', true]);
            logger_1.logger.info('Usuário admin criado: admin@escola.com / admin123');
        }
        else {
            logger_1.logger.info('Usuário admin já existe');
        }
        // Criar escola padrão se não existir
        const escolaExists = await (0, connection_1.queryOne)('SELECT id FROM escolas LIMIT 1', []);
        if (!escolaExists) {
            await (0, connection_1.query)(`INSERT INTO escolas (nome, cnpj, telefone, email, endereco, cidade, estado, cep)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                'Escola Sistema',
                '00.000.000/0001-00',
                '(00) 0000-0000',
                'contato@escolasistema.com.br',
                'Rua Principal, 123',
                'São Paulo',
                'SP',
                '00000-000'
            ]);
            logger_1.logger.info('Escola padrão criada com sucesso');
        }
        // Criar alguns planos de mensalidade padrão
        const planosExist = await (0, connection_1.queryOne)('SELECT id FROM planos_mensalidade LIMIT 1', []);
        if (!planosExist) {
            const planos = [
                { nome: 'Integral', valor: 1500.00, descricao: 'Período integral' },
                { nome: 'Matutino', valor: 800.00, descricao: 'Período matutino' },
                { nome: 'Vespertino', valor: 800.00, descricao: 'Período vespertino' }
            ];
            for (const plano of planos) {
                await (0, connection_1.query)(`INSERT INTO planos_mensalidade (nome, valor, descricao, ativo)
           VALUES ($1, $2, $3, $4)`, [plano.nome, plano.valor, plano.descricao, true]);
            }
            logger_1.logger.info('Planos de mensalidade criados com sucesso');
        }
        logger_1.logger.info('Seed concluído com sucesso!');
    }
    catch (error) {
        logger_1.logger.error('Erro ao executar seed', error);
        throw error;
    }
    finally {
        await connection_1.pool.end();
    }
}
// Executar seed quando chamado diretamente
seed();
//# sourceMappingURL=seed.js.map