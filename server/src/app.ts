import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ipBlockerMiddleware } from './middleware/ipBlocker.js';
import routes from './routes/index.js';

export const app = express();

// Trust proxy for Render / load balancers
app.set('trust proxy', 1);

// CORS configuration (Must be before any other middleware)
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Reflect requesting origin to allow all browser origins with credentials
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-session-id',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// IP Blocking security layer (Enforces backend-level protection)
app.use(ipBlockerMiddleware);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Root endpoint & health checks for keep-alive cron jobs / monitoring
app.get('/', (_req, res) => {
  res.status(200).send('SkinCare API is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Skincare Bangladesh API',
    uptime: process.uptime(),
  });
});

// Apply global rate limiting to /api
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', routes);

// Central error handler
app.use(errorHandler);
