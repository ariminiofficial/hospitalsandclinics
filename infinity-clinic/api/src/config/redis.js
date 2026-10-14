import Redis from 'ioredis';
import { env } from './env.js';

let redisClient = null;
let redisSubClient = null;

if (env.redisUrl && !env.redisUrl.includes('dummy') && !env.redisUrl.includes('change-me')) {
  try {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redisSubClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redisClient.on('error', () => {});
    redisSubClient.on('error', () => {});
  } catch {
    redisClient = null;
    redisSubClient = null;
  }
}

const memoryStore = new Map();

const mockRedis = {
  status: 'offline',
  async get(key) {
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expires && item.expires < Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return item.val;
  },
  async setex(key, ttlSeconds, val) {
    memoryStore.set(key, { val, expires: Date.now() + ttlSeconds * 1000 });
    return 'OK';
  },
  async del(...keys) {
    for (const k of keys) memoryStore.delete(k);
    return keys.length;
  },
  async incr(key) {
    const cur = parseInt((await this.get(key)) || '0', 10) + 1;
    await this.setex(key, 60, String(cur));
    return cur;
  },
  async decr(key) {
    const cur = Math.max(0, parseInt((await this.get(key)) || '0', 10) - 1);
    await this.setex(key, 60, String(cur));
    return cur;
  },
  async expire(key, ttl) {
    const item = memoryStore.get(key);
    if (item) item.expires = Date.now() + ttl * 1000;
  },
  async ttl(key) {
    const item = memoryStore.get(key);
    if (!item || !item.expires) return -1;
    return Math.max(0, Math.floor((item.expires - Date.now()) / 1000));
  },
  async keys(pattern) {
    const p = pattern.replace('*', '');
    return Array.from(memoryStore.keys()).filter((k) => k.startsWith(p));
  },
  async publish() {
    return 0;
  },
  psubscribe() {},
  on() {},
  connect() {},
};

export const redis = redisClient || mockRedis;
export const redisSub = redisSubClient || mockRedis;

export async function connectRedis() {
  if (!redisClient || !redisSubClient) {
    throw new Error('REDIS_URL not configured or offline');
  }
  const connectIfNeeded = async (client) => {
    if (client.status === 'ready' || client.status === 'connecting') return;
    await client.connect();
  };
  await Promise.all([connectIfNeeded(redisClient), connectIfNeeded(redisSubClient)]);
}

export const REFRESH_TOKEN_PREFIX = 'refresh:';
export const CMS_CACHE_PREFIX = 'cms:';
