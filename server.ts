import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setIO } from './src/lib/socket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    path: '/api/socketio',
    cors: {
      origin: dev
        ? '*'
        : (process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'),
      methods: ['GET', 'POST'],
    },
  });

  // Store in shared singleton
  setIO(io);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Join device-specific rooms
    socket.on('device:subscribe', (deviceId: string) => {
      socket.join(`device:${deviceId}`);
    });

    socket.on('device:unsubscribe', (deviceId: string) => {
      socket.leave(`device:${deviceId}`);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
