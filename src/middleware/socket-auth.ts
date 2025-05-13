import { Socket } from 'socket.io';
import { verifyJwtToken } from '@utils/jwt-verifier';
import { Auth0User } from '@types';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: Auth0User;
  };
}

export const verifySocketToken = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const decoded = await verifyJwtToken(token);

    if (!decoded || typeof decoded.sub !== 'string') {
      return next(new Error('Invalid token payload: missing sub'));
    }

    (socket as AuthenticatedSocket).data.user = decoded as Auth0User;

    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    return next(new Error('Invalid or expired authentication token'));
  }
};
