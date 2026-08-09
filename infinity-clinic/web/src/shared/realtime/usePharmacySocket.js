import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api/client.js';

export function usePharmacySocket(onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const fetchQueue = useCallback(async () => {
    const data = await api.get('/portal/pharmacy/queue');
    onUpdateRef.current(data);
  }, []);

  useEffect(() => {
    fetchQueue();

    const token = api.accessToken;
    const socket = io({ path: '/socket.io', auth: { token } });

    socket.on('pharmacy:update', () => fetchQueue());
    socket.on('connect', () => fetchQueue());

    return () => socket.disconnect();
  }, [fetchQueue]);

  return { refetch: fetchQueue };
}
