import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Load environment variables from root Medicloud folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const app: Application = express();
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'MediCloud API is Running 🚀',
    timestamp: new Date(),
    version: '1.0.0',
  });
});

// Database Test Route
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany();
    res.json({
      success: true,
      message: 'Database connection verified!',
      data: tenants
    });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed'
    });
  }
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
