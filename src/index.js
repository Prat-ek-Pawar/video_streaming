import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './db/mongoose.js';
import videoRoutes from './routes/videos.js';
import clientRoutes from './routes/clients.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Initialize App
const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
})); // Allow all origins explicitly
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Debug Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Basic Rate Limiting (Simple implementation)
// ... (keep existing rate limit code if possible, or just re-insert it if I am replacing a block) ...
// For a production app, use 'express-rate-limit' or Nginx
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

// Routes (Moved before static files)
app.use('/api/videos', videoRoutes);
app.use('/api/clients', clientRoutes);

// Serve static videos for local testing/development
// Matches the PUBLIC_BASE_URL path in .env
app.use('/videos-static', express.static(config.videoRootAbsolute));

// Serve Admin UI and other static assets
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error Handling
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} | PID: ${process.pid}`);
  console.log(`Environment: Node ${process.version}`);
});
