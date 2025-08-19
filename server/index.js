require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const offersRoutes = require('./routes/offers');
const usersRoutes = require('./routes/users');
const dealsRoutes = require('./routes/deals');
const reviewsRoutes = require('./routes/reviews');

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

// Trust proxy configuration for Render.com
// Render uses a single proxy, so we set it to 1
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://p2p-exchange-pmr.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Middleware

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Rate limiting - temporarily disabled due to Render proxy issues
// TODO: Re-enable when proxy configuration is properly set up
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);
*/

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook endpoint for Telegram bot
app.post('/bot*', (req, res) => {
  // Forward to bot if needed
  console.log('Received bot webhook');
  res.sendStatus(200);
});

// WebSocket для real-time обновлений
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe:offers', (filters) => {
    socket.join('offers');
    if (filters?.currency) {
      socket.join(`currency:${filters.currency}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Экспорт io для использования в других модулях
app.locals.io = io;

// Start server
httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB();
});