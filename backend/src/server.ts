import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './interfaces/routes/index';
import { errorHandler, notFoundHandler } from './interfaces/middlewares/errorHandler';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 API disponível em http://localhost:${PORT}/api`);
});

export default app;
