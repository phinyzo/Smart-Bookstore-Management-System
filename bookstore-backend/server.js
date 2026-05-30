/**
 * Smart Bookstore Management System — Backend Server
 * Powered by PhinTech Solutions — Built in Kenya
 * https://phintechsolutions.com
 */

const express      = require('express');
const dotenv       = require('dotenv');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// ── CORS — must be FIRST, before everything including helmet ──
// This ensures CORS headers are present even on error responses.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://phintech-bookstore.vercel.app',   // production frontend
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview deployment for this project
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Handle preflight for all routes explicitly (Express 5 wildcard syntax)
app.options('/{*path}', cors(corsOptions));

// ── SECURITY HEADERS ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── COMPRESSION ──────────────────────────────────────────────
app.use(compression());

// ── HTTP LOGGING ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── RATE LIMITING ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { message: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  message:  { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── DB CONNECTION MIDDLEWARE ──────────────────────────────────
// Vercel serverless: reconnect on every cold start.
// Uses cached connection for warm starts.
app.use(async (req, res, next) => {
  // Skip DB for health/root endpoints
  if (req.path === '/' || req.path === '/health') return next();

  try {
    const conn = await connectDB();
    if (!conn) {
      // DB unavailable — pass through error middleware so CORS headers are set
      const err = new Error('Database temporarily unavailable. Please try again in a moment.');
      err.statusCode = 503;
      return next(err);
    }
    next();
  } catch (err) {
    console.error('[DB Middleware]', err.message);
    err.statusCode = 503;
    return next(err);
  }
});

// ── STRIPE WEBHOOK (raw body — BEFORE express.json) ──────────
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/paymentController').stripeWebhook
);

// ── JSON BODY PARSER ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/books',   require('./routes/bookRoutes'));
app.use('/api/orders',  require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/emails',  require('./routes/emailRoutes'));
app.use('/api/mpesa',   require('./routes/mpesaRoutes'));
app.use('/api/license', require('./routes/licenseRoutes'));

// ── HEALTH / ROOT ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message:   'Smart Bookstore API is running',
    version:   '2.0.0',
    poweredBy: 'PhinTech Solutions — Built in Kenya',
    website:   'https://phintechsolutions.com',
    status:    'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── 404 HANDLER ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── CENTRALIZED ERROR HANDLER ─────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | ${process.env.NODE_ENV || 'development'}`);
  console.log('Powered by PhinTech Solutions — Built in Kenya');
});

module.exports = app;
