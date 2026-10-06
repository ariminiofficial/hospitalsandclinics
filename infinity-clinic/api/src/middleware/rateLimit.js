import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

class RedisStore {
  constructor(prefix = 'rl:') {
    this.prefix = prefix;
  }

  async increment(key) {
    if (env.nodeEnv === 'test') {
      return { totalHits: 1, resetTime: new Date(Date.now() + 60000) };
    }
    try {
      const redisKey = `${this.prefix}${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, 60);
      }
      const ttl = await redis.ttl(redisKey);
      return { totalHits: count, resetTime: new Date(Date.now() + ttl * 1000) };
    } catch (err) {
      return { totalHits: 1, resetTime: new Date(Date.now() + 60000) };
    }
  }

  async decrement(key) {
    if (env.nodeEnv === 'test') return;
    try {
      await redis.decr(`${this.prefix}${key}`);
    } catch (err) {
      return;
    }
  }

  async resetKey(key) {
    if (env.nodeEnv === 'test') return;
    try {
      await redis.del(`${this.prefix}${key}`);
    } catch (err) {
      return;
    }
  }
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('rl:login:'),
  message: { success: false, error: 'Too many login attempts, please try again later', code: 'RATE_LIMITED' },
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('rl:booking:'),
  message: { success: false, error: 'Too many booking requests, please try again later', code: 'RATE_LIMITED' },
});
