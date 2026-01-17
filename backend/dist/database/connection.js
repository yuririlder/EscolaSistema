"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
exports.query = query;
exports.queryOne = queryOne;
exports.queryMany = queryMany;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Criar pool de conexões PostgreSQL
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
// Testar conexão com banco de dados
async function testConnection() {
    try {
        const client = await exports.pool.connect();
        await client.query('SELECT 1');
        client.release();
        logger_1.logger.info('Conexão com banco de dados PostgreSQL estabelecida');
    }
    catch (error) {
        logger_1.logger.error('Erro ao conectar com banco de dados PostgreSQL:', error);
        throw error;
    }
}
// Helper para executar queries
async function query(text, params = []) {
    const start = Date.now();
    try {
        const result = await exports.pool.query(text, params);
        const duration = Date.now() - start;
        logger_1.logger.debug(`Query executada em ${duration}ms`);
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Erro na query: ${error.message}`);
        throw error;
    }
}
// Helper para buscar um registro
async function queryOne(text, params = []) {
    const result = await query(text, params);
    return result.rows?.[0] || null;
}
// Helper para buscar múltiplos registros
async function queryMany(text, params = []) {
    const result = await query(text, params);
    return result.rows || [];
}
exports.default = exports.pool;
//# sourceMappingURL=connection.js.map