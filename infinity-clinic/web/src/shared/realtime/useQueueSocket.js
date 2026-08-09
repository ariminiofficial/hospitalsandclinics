import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api/client.js';

/**
 * @param {string|null} doctorId — required for socket room + receptionist OPD path
 * @param {function} onUpdate
 * @param {{ queueUrl?: string }} options — doctors use /portal/consultations/queue
 */
export function useQueueSocket(doctorId, onUpdate, { queueUrl } = {}) {
  const socketRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const fetchSnapshot = useCallback(async () => {
    const url = queueUrl || (doctorId ? `/portal/opd/queue/${doctorId}` : null);
    if (!url) return;
    try {
      const data = await api.get(url);
      onUpdateRef.current(data);
    } catch (err) {
      console.error('Queue fetch failed:', err);
    }
  }, [doctorId, queueUrl]);

  useEffect(() => {
    if (!doctorId && !queueUrl) return;

    fetchSnapshot();

    const token = api.accessToken;
    if (!token) return undefined;

    const socket = io({ path: '/socket.io', auth: { token } });
    socketRef.current = socket;

    socket.on('queue:update', () => fetchSnapshot());
    socket.on('connect', () => fetchSnapshot());

    return () => socket.disconnect();
  }, [doctorId, queueUrl, fetchSnapshot]);

  return { refetch: fetchSnapshot };
}
