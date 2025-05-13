import express, { Application } from 'express';
import passport from 'passport';
import { Server } from 'socket.io';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger';
import cors from 'cors';
import config from './config/constants';
import { router } from '@routes';
import { initializeSocket } from '@socket/index';
import { globalRateLimiter } from '@middleware/rateLimiter';
import { corsOptions, allowedOrigins } from '@middleware/corsOptions';
import '@config/passport'; // Load configuration

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Socket.IO CORS blocked: ${origin}`);
        callback(new Error(`Socket.IO origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.set('trust proxy', 1);
app.use(globalRateLimiter);
app.set('io', io);

// Routes (Dynamically Generated)
app.use(router);

// WebSockets (Socket.io)
initializeSocket(io);

// Start HTTP Server
const server = httpServer.listen(config.port, () => {
  const hostRoute = config.hostname.includes(config.port) ? config.hostname : `${config.hostname}:${config.port}`;

  console.log(`Server running on port ${config.port}`);
  console.log(`Swagger docs: ${hostRoute}/api-docs`);
});

// Handle Process Termination
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => process.exit(0));
});

// Handling Error
process.on('unhandledRejection', (err: Error) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
