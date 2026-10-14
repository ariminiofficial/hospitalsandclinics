import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redisSub } from '../config/redis.js';
import { QUEUE_CHANNEL_PREFIX, QUEUE_CLINIC_CHANNEL } from './queueChannel.js';
import { PHARMACY_QUEUE_CHANNEL } from './pharmacyChannel.js';

let ioInstance = null;

export function getIo() {
  return ioInstance;
}

export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
    path: '/socket.io',
  });
  ioInstance = io;

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

  const subscribeToRedis = () => {
    if (redisSub && redisSub.status === 'ready') {
      try {
        redisSub.psubscribe(`${QUEUE_CHANNEL_PREFIX}*`, QUEUE_CLINIC_CHANNEL, PHARMACY_QUEUE_CHANNEL);
      } catch {
        // Redis offline
      }
    }
  };

  subscribeToRedis();
  redisSub.on('ready', subscribeToRedis);

  redisSub.on('pmessage', (pattern, channel, message) => {
    try {
      const parsed = JSON.parse(message);
      if (channel === PHARMACY_QUEUE_CHANNEL) {
        io.to('pharmacy:queue').emit('pharmacy:update', parsed);
        return;
      }
      if (channel === QUEUE_CLINIC_CHANNEL) {
        io.to('clinic:all').emit('queue:update', parsed);
        return;
      }

      const doctorId = channel.replace(QUEUE_CHANNEL_PREFIX, '');
      io.to(`doctor:${doctorId}`).emit('queue:update', parsed);
      io.to('clinic:all').emit('queue:update', parsed);
    } catch {
      // ignore parse error
    }
  });

  return io;
}
