export const QUEUE_CHANNEL_PREFIX = 'queue:doctor:';
export const QUEUE_CLINIC_CHANNEL = 'queue:clinic:all';

export function doctorQueueChannel(doctorId) {
  return `${QUEUE_CHANNEL_PREFIX}${doctorId}`;
}

export async function publishQueueUpdate(redis, doctorId, payload) {
  const message = JSON.stringify(payload);
  await redis.publish(doctorQueueChannel(doctorId), message);
  await redis.publish(QUEUE_CLINIC_CHANNEL, message);
}
