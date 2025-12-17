import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

export const app: Application = express();
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Route Health Check (Cek Server Hidup)
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'success',
    message: 'MediCloud API is Running 🚀', 
    timestamp: new Date() 
  });
});

// 2. Route Test Database (Cek Koneksi DB)
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    // Coba ambil data tenant (pasti masih kosong, tapi yang penting tidak error)
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
