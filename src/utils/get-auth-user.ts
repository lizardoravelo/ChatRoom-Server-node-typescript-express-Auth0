import { Request } from 'express';
import { Auth0User } from '@types';

export const getAuthUser = (req: Request): Auth0User => {
  const user = (req as any).auth as Auth0User;

  if (!user || typeof user.sub !== 'string') {
    throw new Error('Missing or invalid authenticated user');
  }

  return user;
};
