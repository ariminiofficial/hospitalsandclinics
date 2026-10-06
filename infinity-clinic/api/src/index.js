import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { initSocketServer } from './realtime/wsServer.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);

async function start() {
  try {
    await connectRedis();
    logger.info('Redis connected successfully');
  } catch (err) {
    logger.warn('Redis not available — rate limiting and realtime may be degraded', { error: err.message });
  }

  initSocketServer(server);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${env.port} is already in use. Kill existing process: lsof -ti:${env.port} | xargs kill -9`);
      process.exit(1);
    }
    throw err;
  });

  server.listen(env.port, () => {
    logger.info(`API server running on http://localhost:${env.port}`, { port: env.port, env: env.nodeEnv });
  });
}

start();
