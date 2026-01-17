import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares';
import { logger } from './utils/logger';
import { pool, testConnection } from './database/connection';
import { runMigrations } from './database/migrate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança e parsing
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// API Routes
app.use('/api', routes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Startup
async function startServer() {
  try {
    // Testar conexão com banco
    await testConnection();
    logger.info('Conexão com banco de dados estabelecida');

    // Executar migrations
    await runMigrations();
    logger.info('Migrations executadas com sucesso');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Encerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Encerrando servidor...');
  await pool.end();
  process.exit(0);
});

startServer();

export default app;
