import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Route imports
import authRouter from './routes/auth.js';
import superadminRouter from './routes/superadmin.js';
import adminRouter from './routes/admin.js';
import chairmanRouter from './routes/chairman.js';
import treasurerRouter from './routes/treasurer.js';
import studentRouter from './routes/student.js';
import resultsRouter from './routes/results.js';
import searchRouter from './routes/search.js';
import announcementRouter from './routes/announcement.js';

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

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

// Fallback Route
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found on this server.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in mode on port ${PORT}`);
});
