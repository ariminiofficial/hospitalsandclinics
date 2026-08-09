import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export const redisSub = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export async function connectRedis() {
  const connectIfNeeded = async (client) => {
    if (client.status === 'ready' || client.status === 'connecting') return;
    await client.connect();
  };
  await Promise.all([connectIfNeeded(redis), connectIfNeeded(redisSub)]);
}

export const REFRESH_TOKEN_PREFIX = 'refresh:';
export const CMS_CACHE_PREFIX = 'cms:';
