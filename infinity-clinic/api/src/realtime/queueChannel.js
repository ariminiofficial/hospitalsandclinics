import { getIo } from './wsServer.js';

export const QUEUE_CHANNEL_PREFIX = 'queue:doctor:';
export const QUEUE_CLINIC_CHANNEL = 'queue:clinic:all';

export function doctorQueueChannel(doctorId) {
  return `${QUEUE_CHANNEL_PREFIX}${doctorId}`;
}

export async function publishQueueUpdate(redis, doctorId, payload) {
  const message = JSON.stringify(payload);
  if (redis && redis.status === 'ready') {
    try {
      await redis.publish(doctorQueueChannel(doctorId), message);
      await redis.publish(QUEUE_CLINIC_CHANNEL, message);
      return;
    } catch {
      // fallback to in-memory emit below
    }
  }

  const io = getIo();
  if (io) {
    io.to(`doctor:${doctorId}`).emit('queue:update', payload);
    io.to('clinic:all').emit('queue:update', payload);
  }
}
