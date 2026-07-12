import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/appError';

const app: Application = express();

// 1. Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 2. Parsers and logs
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads folder for documents/images
app.use('/uploads', express.static('uploads'));

// 3. Health Check
app.use('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve API Swagger Doc
import fs from 'fs';
import path from 'path';
app.use('/api-docs', (_req: Request, res: Response) => {
  try {
    const swaggerDoc = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../swagger.json'), 'utf8')
    );
    res.status(200).json(swaggerDoc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load api specifications document.' });
  }
});

// 4. API routes
app.use('/api/v1', apiRouter);

// 5. Fallback for unhandled endpoints
app.use('*', (req: Request, _res: Response, next: NextFunction) => {
  next(AppError.notFound(`Cannot find ${req.originalUrl} on this server`));
});

// 6. Global error handler
app.use(errorHandler);

export default app;
