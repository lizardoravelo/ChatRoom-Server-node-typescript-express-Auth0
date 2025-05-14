import { Server, Socket } from 'socket.io';
import { verifySocketToken, AuthenticatedSocket } from '@middleware/socket-auth';
import config from '@config/constants';

const activeSockets = new Map<string, string>();
const userRooms = new Map<string, string>();

export const initializeSocket = (io: Server) => {
  io.use(verifySocketToken);

  io.engine.on('connection_error', err => {
    console.error(`Socket connection error: ${err.message}`);
  });

  io.on('connection', (socket: Socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;

    if (!authenticatedSocket.data.user) {
      console.error('Missing Auth0 user payload.');
      return authenticatedSocket.disconnect();
    }

    const user = authenticatedSocket.data.user;
    const userId = user.sub;

    console.log(`User connected: ${user.name ?? user.email} (${user.email})`);
    console.log(`Socket ID: ${socket.id}`);

    activeSockets.set(userId, socket.id);

    authenticatedSocket.on('join room', async (roomId: string) => {
      try {
        const roles = user[`${config.auth.namespace}roles`] ?? [];

        if (!roles || !Array.isArray(roles) || roles.length === 0) {
          throw new Error('User has no assigned roles');
        }

        const previousRoom = userRooms.get(userId);
        if (previousRoom && previousRoom !== roomId) {
          authenticatedSocket.leave(previousRoom);
          console.log(`User ${user.email} left previous room ${previousRoom}`);

          io.to(previousRoom).emit('user left', {
            userId: user.sub,
            username: user.email,
          });
        }

        authenticatedSocket.join(roomId);
        userRooms.set(userId, roomId);
        console.log(`User ${user.email} joined room ${roomId}`);

        socket.to(roomId).emit('user joined', {
          userId: user.sub,
          username: user.email,
          role: roles[0],
        });

        const sockets = await io.in(roomId).fetchSockets();
        const activeUsers = sockets.map(sock => ({
          userId: sock.data.user?.sub,
          username: sock.data.user?.email,
        }));

        io.to(roomId).emit('active users', activeUsers);
      } catch (error) {
        console.error('Join room error:', error);
        authenticatedSocket.emit('error', {
          type: 'JOIN_ROOM_ERROR',
          message: error instanceof Error ? error.message : 'Could not join room',
        });
      }
    });

    authenticatedSocket.on('sendMessage', message => {
      const { roomId, content, createdAt, _id } = message;

      if (!roomId) {
        return authenticatedSocket.emit('error', {
          type: 'SEND_MESSAGE_ERROR',
          message: 'Invalid room ID',
        });
      }

      const formattedMessage = {
        _id,
        roomId,
        content,
        userId: { _id: user.sub, email: user.email },
        createdAt,
      };

      io.to(roomId).emit('newMessage', formattedMessage);
    });

    authenticatedSocket.on('leave room', (roomId: string) => {
      authenticatedSocket.leave(roomId);
      userRooms.delete(userId);

      console.log(`User ${user.email} left room ${roomId}`);
      authenticatedSocket.to(roomId).emit('user left', {
        userId: user.sub,
        username: user.email,
      });
    });

    authenticatedSocket.on('disconnect', () => {
      userRooms.delete(userId);

      console.log(`User disconnected: ${user.name ?? user.email}`);

      if (activeSockets.get(userId) === socket.id) {
        activeSockets.delete(userId);
      }

      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id) {
          io.to(roomId).emit('user left', {
            userId: user.sub,
            username: user.email,
          });
        }
      });
    });
  });
};
