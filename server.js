import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Route imports
import authRouter from './server/routes/auth.js';
import superadminRouter from './server/routes/superadmin.js';
import adminRouter from './server/routes/admin.js';
import chairmanRouter from './server/routes/chairman.js';
import treasurerRouter from './server/routes/treasurer.js';
import studentRouter from './server/routes/student.js';
import resultsRouter from './server/routes/results.js';
import searchRouter from './server/routes/search.js';
import announcementRouter from './server/routes/announcement.js';
import prisma from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uploadsPath = path.join(__dirname, 'server/uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Prisma to Mongoose compatibility middleware (injects _id fast without heavy JSON deep cloning)
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (obj) {
    const addUnderscoreIdFast = (data, depth = 0) => {
      if (depth > 6 || !data || typeof data !== 'object') return data;
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          if (data[i] && typeof data[i] === 'object') {
            data[i] = addUnderscoreIdFast(data[i], depth + 1);
          }
        }
        return data;
      }
      if (data.id && !data._id) {
        try {
          data._id = data.id;
        } catch (err) {
          data = { ...data, _id: data.id };
        }
      }
      for (const key in data) {
        if (data[key] && typeof data[key] === 'object' && !(data[key] instanceof Date)) {
          data[key] = addUnderscoreIdFast(data[key], depth + 1);
        }
      }
      return data;
    };

    let processedObj = obj;
    if (obj !== null && typeof obj === 'object') {
      try {
        processedObj = addUnderscoreIdFast(obj);
      } catch (e) {
        processedObj = obj;
      }
    }

    return originalJson.call(this, processedObj);
  };
  next();
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/superadmin', superadminRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chairman', chairmanRouter);
app.use('/api/treasurer', treasurerRouter);
app.use('/api/student', studentRouter);
app.use('/api/results', resultsRouter);
app.use('/api/search', searchRouter);
app.use('/api/announcements', announcementRouter);

// Public Database & Cloud Health Status Endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const start = Date.now();
    const userCount = await prisma.user.count();
    const programCount = await prisma.program.count();
    const studentCount = await prisma.student.count();
    const latency = Date.now() - start;

    res.json({
      status: 'connected',
      provider: 'Supabase PostgreSQL',
      poolerHost: 'aws-1-ap-northeast-1.pooler.supabase.com',
      database: 'postgres',
      ssl: true,
      stats: {
        users: userCount,
        programs: programCount,
        candidates: studentCount
      },
      latencyMs: latency,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Supabase database check failed',
      error: error.message
    });
  }
});

// Fallback for missing API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found on this server.` });
});

// Frontend Vite Integration (Middleware mode in dev, static dist in prod)
const isProd = process.env.NODE_ENV === 'production';
const distPath = path.join(__dirname, 'client/dist');

if (!isProd && fs.existsSync(path.join(__dirname, 'client/index.html'))) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.join(__dirname, 'client/vite.config.js'),
    server: { middlewareMode: true, hmr: false, host: '0.0.0.0' },
    appType: 'spa',
    root: path.join(__dirname, 'client')
  });
  app.use(vite.middlewares);
} else if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Shaad-Mates server running on http://${HOST}:${PORT}`);
});
