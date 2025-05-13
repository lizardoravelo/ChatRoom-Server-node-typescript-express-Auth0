import { z } from 'zod';
export const validateMessage = (data: unknown) => {
  const schema = z.object({
    content: z.string().min(1).max(1000),
  });

  return schema.safeParse(data);
};
