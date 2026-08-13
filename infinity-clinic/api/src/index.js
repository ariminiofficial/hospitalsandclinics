import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import routes from './routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initSocketServer } from './realtime/wsServer.js';

const app = express();
// Trust only the first proxy hop (nginx) for X-Forwarded-For, not the full chain
app.set('trust proxy', 1);
const server = http.createServer(app);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectRedis();
    console.log('Redis connected');
  } catch (err) {
    console.warn('Redis not available — rate limiting and realtime may be degraded:', err.message);
  }

  initSocketServer(server);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Kill the existing process: lsof -ti:${env.port} | xargs kill -9`);
      process.exit(1);
    }
    throw err;
  });

  server.listen(env.port, () => {
    console.log(`API server running on http://localhost:${env.port}`);
  });
}

start();
