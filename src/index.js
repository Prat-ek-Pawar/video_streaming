import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import { connectDB } from './db/mongoose.js';
import videoRoutes from './routes/videos.js';
import clientRoutes from './routes/clients.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

connectDB();

const corsOptions = {
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: '*',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const rateLimitWindow = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 100;

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const userData = rateLimitWindow.get(ip) || { count: 0, startTime: now };
  
  if (now - userData.startTime > RATE_LIMIT_WINDOW_MS) {
    userData.count = 0;
    userData.startTime = now;
  }
  
  userData.count++;
  rateLimitWindow.set(ip, userData);
  
  if (userData.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
});

app.use('/api/videos', videoRoutes);
app.use('/api/clients', clientRoutes);

app.use('/videos-static', express.static(config.videoRootAbsolute));

app.get('/admin', (req, res) => {
  res.sendFile(path.resolve('public/admin.html'));
});

app.use(express.static('public'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} | PID: ${process.pid}`);
  console.log(`Environment: Node ${process.version}`);
});
