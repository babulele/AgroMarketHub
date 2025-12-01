import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { connectDB } from './utils/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import logger from './utils/logger';

// Load environment variables
// Try multiple paths to find .env file

// Try loading from backend directory first (when running from backend/)
const backendEnvPath = path.resolve(process.cwd(), '.env');
const srcEnvPath = typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../.env') : null;

// Try to load .env file - check which one exists
let envLoaded = false;
if (fs.existsSync(backendEnvPath)) {
  const result = dotenv.config({ path: backendEnvPath });
  if (!result.error) {
    envLoaded = true;
    logger.info(`Environment variables loaded from: ${backendEnvPath}`);
  }
}

// Also try from src directory (when running from root)
if (!envLoaded && srcEnvPath && fs.existsSync(srcEnvPath)) {
  const result = dotenv.config({ path: srcEnvPath });
  if (!result.error) {
    envLoaded = true;
    logger.info(`Environment variables loaded from: ${srcEnvPath}`);
  }
}

if (!envLoaded) {
  logger.warn('No .env file found. Please create backend/.env with required variables.');
}

// Debug: Log M-Pesa config status (only in development)
if (process.env.NODE_ENV === 'development' || !process.env.MPESA_CONSUMER_KEY) {
  const mpesaKey = process.env.MPESA_CONSUMER_KEY;
  const mpesaSecret = process.env.MPESA_CONSUMER_SECRET;
  console.log('\n=== Environment Variables Check ===');
  console.log('Looking for .env in:', backendEnvPath);
  console.log('MPESA_CONSUMER_KEY:', mpesaKey ? `✅ SET (${mpesaKey.length} chars)` : '❌ NOT SET');
  console.log('MPESA_CONSUMER_SECRET:', mpesaSecret ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('MPESA_SHORTCODE:', process.env.MPESA_SHORTCODE || '❌ NOT SET');
  console.log('MPESA_PASSKEY:', process.env.MPESA_PASSKEY ? '✅ SET' : '❌ NOT SET');
  console.log('MPESA_ENVIRONMENT:', process.env.MPESA_ENVIRONMENT || 'sandbox (default)');
  console.log('MPESA_CALLBACK_URL:', process.env.MPESA_CALLBACK_URL || '❌ NOT SET');
  
  if (!mpesaKey || !mpesaSecret) {
    console.log('\n⚠️  M-Pesa credentials not found!');
    console.log('Please check:');
    console.log('1. backend/.env file exists');
    console.log('2. Variable names are correct (case-sensitive):');
    console.log('   MPESA_CONSUMER_KEY=your-key');
    console.log('   MPESA_CONSUMER_SECRET=your-secret');
    console.log('3. No quotes or spaces around values');
    console.log('4. Restart the server after editing .env\n');
  }
  console.log('===================================\n');
}

const app: Application = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
// Configure Helmet to allow cross-origin requests for static files
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for local storage) with CORS headers
app.use(
  '/uploads',
  (req, res, next) => {
    // Set CORS headers explicitly for static files
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173', // Vite default port
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  },
  express.static('uploads', {
    setHeaders: (res, path) => {
      // Set proper content type headers
      if (path.endsWith('.jfif') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (path.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      } else if (path.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
      }
    },
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
import apiRoutes from './routes';
app.use(`/api/${API_VERSION}`, apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize scheduled jobs (email alerts, etc.)
    if (process.env.ENABLE_SCHEDULER !== 'false') {
      await import('./services/schedulerService');
      logger.info('Scheduler service initialized');
    }
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();

