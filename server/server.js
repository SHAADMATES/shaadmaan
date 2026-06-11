import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRouter from './routes/auth.js';
import superadminRouter from './routes/superadmin.js';
import adminRouter from './routes/admin.js';
import chairmanRouter from './routes/chairman.js';
import treasurerRouter from './routes/treasurer.js';
import studentRouter from './routes/student.js';
import resultsRouter from './routes/results.js';
import searchRouter from './routes/search.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/superadmin', superadminRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chairman', chairmanRouter);
app.use('/api/treasurer', treasurerRouter);
app.use('/api/student', studentRouter);
app.use('/api/results', resultsRouter);
app.use('/api/search', searchRouter);

// Fallback Route
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found on this server.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in mode on port ${PORT}`);
});
