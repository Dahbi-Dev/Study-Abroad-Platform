import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import connectDB from '@/config/database';
import { logger } from '@/utils/logger';
import { errorHandler, notFound } from '@/middleware/errorMiddleware';
import { rateLimiter } from '@/middleware/rateLimiter';

// Import route handlers
import superAdminRoutes from '@/routes/superAdmin';
import clientRoutes from '@/routes/client';
import agencyRoutes from '@/routes/agency';
import authRoutes from '@/routes/auth';

// Initialize default super admin
import SuperAdmin from '@/models/SuperAdmin';

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Trust proxy if behind reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'wss:', 'ws:']
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Request compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/client', clientRoutes);

// Agency routes (dynamic subdomain handling)
app.use('/api/:subdomain', agencyRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  
  // Catch-all handler: send back React's index.html file for SPA routing
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket client connected: ${socket.id}`);

  // Handle joining rooms (for agency-specific notifications)
  socket.on('join_agency', (agencyId: string) => {
    socket.join(`agency_${agencyId}`);
    logger.debug(`Socket ${socket.id} joined agency room: ${agencyId}`);
  });

  // Handle leaving rooms
  socket.on('leave_agency', (agencyId: string) => {
    socket.leave(`agency_${agencyId}`);
    logger.debug(`Socket ${socket.id} left agency room: ${agencyId}`);
  });

  // Handle super admin notifications
  socket.on('join_superadmin', () => {
    socket.join('superadmin');
    logger.debug(`Socket ${socket.id} joined super admin room`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Socket client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Make io instance available to controllers
declare global {
  namespace Express {
    interface Request {
      io?: SocketIOServer;
    }
  }
}

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Create default super admin
    await SuperAdmin.createDefaultSuperAdmin();
    
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };