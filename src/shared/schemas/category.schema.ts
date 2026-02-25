import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Название обязательно')
    .max(100, 'Название не должно превышать 100 символов'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)')
    .default('#3B82F6'),
});

export const updateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Название обязательно')
    .max(100, 'Название не должно превышать 100 символов')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)')
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
