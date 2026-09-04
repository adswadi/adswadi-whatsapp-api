require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const whatsappRoutes = require('./routes/whatsapp');
const contactRoutes = require('./routes/contacts');
const broadcastRoutes = require('./routes/broadcasts');
const conversationRoutes = require('./routes/conversations');
const flowRoutes = require('./routes/flows');
const billingRoutes = require('./routes/billing');
const analyticsRoutes = require('./routes/analytics');
const teamRoutes = require('./routes/team');
const settingsRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io globally accessible
global.io = io;
app.set('io', io);

// Socket.IO authentication and rooms
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));

  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`Socket connected: ${socket.id} (user: ${userId})`);

  // Join user's personal room
  socket.join(`user_${userId}`);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conversation_${conversationId}`).emit('typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Railway (and any other edge proxy) terminates the connection, so without
// this every request looks like it came from the proxy's IP — the rate limit
// below would then be a single shared bucket for the whole platform instead
// of one per client.
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Meta delivers every customer's webhooks from its own IP range, so this
  // traffic grows with the customer count and would be throttled as if it
  // were one abusive client. The route verifies Meta's HMAC signature itself.
  skip: (req) => req.originalUrl.startsWith('/api/webhook'),
});
app.use('/api/', limiter);

// Body parsing - raw body for webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
    req.body = JSON.parse(req.body.toString());
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// 'dev' logs a line per request with colour codes — useful locally, just
// noise and overhead once every customer's traffic runs through here.
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev', {
  skip: (req) => process.env.NODE_ENV === 'production' && req.originalUrl.startsWith('/api/webhook'),
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Serve React frontend in production
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  // Vite's hashed filenames (index-XXXXXX.js) are safe to cache forever —
  // a new build gets a new hash. index.html is what points at that hash,
  // so it must never be cached: an old cached index.html keeps loading the
  // JS bundle from before a deploy, silently serving stale code (e.g. a
  // route that didn't exist yet) even though the server has the new build.
  app.use(express.static(clientDistPath, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }));
  app.get('*', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 handler (development / API-only mode)
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adswadi_whatsapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Initialize broadcast worker
  require('./workers/broadcastWorker');

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch(console.error);

module.exports = { app, server, io };
