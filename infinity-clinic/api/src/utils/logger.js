import { env } from '../config/env.js';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = env.nodeEnv === 'production' ? 'info' : (env.nodeEnv === 'test' ? 'error' : 'debug');

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  if (env.nodeEnv === 'production') {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  }
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  debug(message, meta = {}) {
    if (LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]) {
      console.debug(formatLog('debug', message, meta));
    }
  },
  info(message, meta = {}) {
    if (LOG_LEVELS.info >= LOG_LEVELS[currentLevel]) {
      console.info(formatLog('info', message, meta));
    }
  },
  warn(message, meta = {}) {
    if (LOG_LEVELS.warn >= LOG_LEVELS[currentLevel]) {
      console.warn(formatLog('warn', message, meta));
    }
  },
  error(message, meta = {}) {
    if (LOG_LEVELS.error >= LOG_LEVELS[currentLevel]) {
      console.error(formatLog('error', message, meta));
    }
  },
};
