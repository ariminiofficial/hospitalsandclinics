import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis.js';

class RedisStore {
  constructor(prefix = 'rl:') {
    this.prefix = prefix;
  }

  async increment(key) {
    const redisKey = `${this.prefix}${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, 60);
    }
    const ttl = await redis.ttl(redisKey);
    return { totalHits: count, resetTime: new Date(Date.now() + ttl * 1000) };
  }

  async decrement(key) {
    await redis.decr(`${this.prefix}${key}`);
  }

  async resetKey(key) {
    await redis.del(`${this.prefix}${key}`);
  }
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('rl:login:'),
  message: { error: 'Too many login attempts, please try again later', code: 'RATE_LIMITED' },
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('rl:booking:'),
  message: { error: 'Too many booking requests, please try again later', code: 'RATE_LIMITED' },
});
