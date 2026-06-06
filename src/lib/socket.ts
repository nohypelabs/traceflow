import { Server as SocketIOServer } from 'socket.io';

// Socket.IO singleton - shared across all API routes
let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function setIO(socketIO: SocketIOServer): void {
  io = socketIO;
}

export function emitToDevice(deviceId: string, event: string, data: any): void {
  if (io) {
    io.to(`device:${deviceId}`).emit(event, data);
  }
}

export function emitToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}
