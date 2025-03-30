import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import ollamaRoutes from './routes/ollamaRoutes';

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/ollama', ollamaRoutes);

// Gestione degli errori
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

export default app;
