import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 1000, 15000);
    return delay;
  },
});

redisConnection.on('connect', () => {
  console.log('[Redis] Connected to Redis queue store successfully.');
});

redisConnection.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});
