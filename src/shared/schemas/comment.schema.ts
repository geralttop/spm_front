import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string()
    .min(1, 'Комментарий не может быть пустым')
    .max(1000, 'Комментарий не должен превышать 1000 символов'),
});

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Комментарий не может быть пустым')
    .max(1000, 'Комментарий не должен превышать 1000 символов'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
