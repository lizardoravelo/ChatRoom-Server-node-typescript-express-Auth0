import { z } from 'zod';

export const validateRoom = (data: unknown) => {
  const schema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().min(10).max(200),
  });

  return schema.safeParse(data);
};
