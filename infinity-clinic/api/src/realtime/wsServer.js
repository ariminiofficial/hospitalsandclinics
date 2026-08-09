import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redisSub } from '../config/redis.js';
import { QUEUE_CHANNEL_PREFIX, QUEUE_CLINIC_CHANNEL } from './queueChannel.js';
import { PHARMACY_QUEUE_CHANNEL } from './pharmacyChannel.js';

export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = jwt.verify(token, env.jwtAccessSecret);
      socket.user = {
        id: payload.sub,
        role: payload.role,
        doctorId: payload.doctorId || null,
        pharmacistId: payload.pharmacistId || null,
      };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { role, doctorId } = socket.user;

    if (role === 'doctor' && doctorId) {
      socket.join(`doctor:${doctorId}`);
    } else if (role === 'pharmacist') {
      socket.join('pharmacy:queue');
    } else if (role === 'receptionist' || role === 'admin') {
      socket.join('clinic:all');
      if (role === 'admin') socket.join('pharmacy:queue');
    } else {
      socket.disconnect(true);
      return;
    }

    socket.on('disconnect', () => {});
  });

  redisSub.psubscribe(`${QUEUE_CHANNEL_PREFIX}*`, QUEUE_CLINIC_CHANNEL, PHARMACY_QUEUE_CHANNEL);

  redisSub.on('pmessage', (pattern, channel, message) => {
    if (channel === PHARMACY_QUEUE_CHANNEL) {
      io.to('pharmacy:queue').emit('pharmacy:update', JSON.parse(message));
      return;
    }
    if (channel === QUEUE_CLINIC_CHANNEL) {
      io.to('clinic:all').emit('queue:update', JSON.parse(message));
      return;
    }

    const doctorId = channel.replace(QUEUE_CHANNEL_PREFIX, '');
    io.to(`doctor:${doctorId}`).emit('queue:update', JSON.parse(message));
    io.to('clinic:all').emit('queue:update', JSON.parse(message));
  });

  return io;
}
