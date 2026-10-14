import { getIo } from './wsServer.js';

export const PHARMACY_QUEUE_CHANNEL = 'pharmacy:queue';

export async function publishPharmacyUpdate(redis, payload) {
  const message = JSON.stringify(payload);
  if (redis && redis.status === 'ready') {
    try {
      await redis.publish(PHARMACY_QUEUE_CHANNEL, message);
      return;
    } catch {
      // fallback to in-memory emit below
    }
  }

  const io = getIo();
  if (io) {
    io.to('pharmacy:queue').emit('pharmacy:update', payload);
  }
}
