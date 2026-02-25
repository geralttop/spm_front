import { z } from 'zod';

export const reportTypeSchema = z.enum(['point', 'comment', 'user']);
export const reportReasonSchema = z.enum(['spam', 'inappropriate', 'harassment', 'fake', 'other']);

export const createReportSchema = z.object({
  type: reportTypeSchema,
  reason: reportReasonSchema,
  targetId: z.union([z.string(), z.number()]),
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
