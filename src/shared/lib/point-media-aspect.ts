/** Фиксированное соотношение карты и фото в карточке точки — 4:3 */
export const POINT_MEDIA_RATIO_W = 4;
export const POINT_MEDIA_RATIO_H = 3;
export const POINT_MEDIA_ASPECT_CSS = "4 / 3" as const;

/** Размер JPEG после обрезки (сохраняет 4:3) */
export const POINT_CROP_OUTPUT_WIDTH = 1200;
export const POINT_CROP_OUTPUT_HEIGHT = 900;
