import { z } from 'zod';
import config from '@config/constants';

export const validateRegistration = (data: unknown) => {
  const schema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(1024),
    address: z.string().optional(),
    phone: z.string().optional(),
    active: z.boolean().default(true),
    role: z.enum([...config.roles] as [string, ...string[]]).default('user'),
  });

  return schema.safeParse(data);
};

export const validateLogin = (data: unknown) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(1024),
  });

  return schema.safeParse(data);
};
