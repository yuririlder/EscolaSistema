"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const middlewares_1 = require("./middlewares");
const logger_1 = require("./utils/logger");
const connection_1 = require("./database/connection");
const migrate_1 = require("./database/migrate");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares de segurança e parsing
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, res, next) => {
    logger_1.logger.http(`${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/health', async (req, res) => {
    try {
        await connection_1.pool.query('SELECT 1');
        res.json({ status: 'healthy', database: 'connected' });
    }
    catch (error) {
        res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
});
// API Routes
app.use('/api', routes_1.default);
// Error Handlers
app.use(middlewares_1.notFoundHandler);
app.use(middlewares_1.errorHandler);
// Startup
async function startServer() {
    try {
        // Testar conexão com banco
        await (0, connection_1.testConnection)();
        logger_1.logger.info('Conexão com banco de dados estabelecida');
        // Executar migrations
        await (0, migrate_1.runMigrations)();
        logger_1.logger.info('Migrations executadas com sucesso');
        // Iniciar servidor
        app.listen(PORT, () => {
            logger_1.logger.info(`Servidor rodando na porta ${PORT}`);
            logger_1.logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    logger_1.logger.info('Encerrando servidor...');
    await connection_1.pool.end();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('Encerrando servidor...');
    await connection_1.pool.end();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map