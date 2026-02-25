import { z } from 'zod';

export const createPointSchema = z.object({
  name: z.string()
    .min(1, 'Название обязательно')
    .max(255, 'Название не должно превышать 255 символов'),
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
  lng: z.number()
    .min(-180, 'Долгота должна быть от -180 до 180')
    .max(180, 'Долгота должна быть от -180 до 180'),
  lat: z.number()
    .min(-90, 'Широта должна быть от -90 до 90')
    .max(90, 'Широта должна быть от -90 до 90'),
  categoryId: z.number()
    .int('ID категории должен быть целым числом')
    .positive('ID категории должен быть положительным'),
  containerId: z.string()
    .uuid('ID контейнера должен быть валидным UUID'),
});

export const updatePointSchema = z.object({
  name: z.string()
    .min(1, 'Название обязательно')
    .max(255, 'Название не должно превышать 255 символов')
    .optional(),
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
  lng: z.number()
    .min(-180, 'Долгота должна быть от -180 до 180')
    .max(180, 'Долгота должна быть от -180 до 180')
    .optional(),
  lat: z.number()
    .min(-90, 'Широта должна быть от -90 до 90')
    .max(90, 'Широта должна быть от -90 до 90')
    .optional(),
  categoryId: z.number()
    .int('ID категории должен быть целым числом')
    .positive('ID категории должен быть положительным')
    .optional(),
  containerId: z.string()
    .uuid('ID контейнера должен быть валидным UUID')
    .optional(),
});

export type CreatePointInput = z.infer<typeof createPointSchema>;
export type UpdatePointInput = z.infer<typeof updatePointSchema>;
