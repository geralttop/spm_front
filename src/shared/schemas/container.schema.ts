import { z } from 'zod';

export const createContainerSchema = z.object({
  title: z.string()
    .min(1, 'Название обязательно')
    .max(255, 'Название не должно превышать 255 символов'),
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6})$/, 'Цвет должен быть в формате HEX (#RRGGBB)'),
});

export const updateContainerSchema = z.object({
  title: z.string()
    .min(1, 'Название обязательно')
    .max(255, 'Название не должно превышать 255 символов')
    .optional(),
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6})$/, 'Цвет должен быть в формате HEX (#RRGGBB)')
    .optional(),
});

export type CreateContainerInput = z.infer<typeof createContainerSchema>;
export type UpdateContainerInput = z.infer<typeof updateContainerSchema>;
