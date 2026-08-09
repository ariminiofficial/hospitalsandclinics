export const PHARMACY_QUEUE_CHANNEL = 'pharmacy:queue';

export async function publishPharmacyUpdate(redis, payload) {
  const message = JSON.stringify(payload);
  await redis.publish(PHARMACY_QUEUE_CHANNEL, message);
}
