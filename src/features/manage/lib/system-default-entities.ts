import type { Category, Container, Point } from '@/shared/api';
export const SEED_SYSTEM_CATEGORY_NAME = 'Без категории';
export const SEED_SYSTEM_CONTAINER_TITLE = 'Общее';
export const MANAGE_VIRTUAL_CATEGORY_EXPAND_ID = -1;
export const MANAGE_VIRTUAL_CONTAINER_EXPAND_ID = '__manage_virtual_no_container__';
export function filterManageCategoryList<T extends Pick<Category, 'name'> & {
    authorId?: number | null;
}>(categories: T[]): T[] {
    return categories.filter((c) => !(c.authorId == null && c.name === SEED_SYSTEM_CATEGORY_NAME));
}
export function filterManageContainerList<T extends Pick<Container, 'title'> & {
    authorId?: number | null;
}>(containers: T[]): T[] {
    return containers.filter((c) => !(c.authorId == null && c.title === SEED_SYSTEM_CONTAINER_TITLE));
}
export function getSystemDefaultCategoryId(categories: Array<Pick<Category, 'id' | 'name'> & {
    authorId?: number | null;
}>): number | undefined {
    return categories.find((c) => c.authorId == null && c.name === SEED_SYSTEM_CATEGORY_NAME)?.id;
}
export function getSystemDefaultContainerId(containers: Array<Pick<Container, 'id' | 'title'> & {
    authorId?: number | null;
}>): string | undefined {
    return containers.find((c) => c.authorId == null && c.title === SEED_SYSTEM_CONTAINER_TITLE)?.id;
}
export function countPointsInVirtualCategory(points: Point[], systemCategoryId: number | undefined): number {
    return listPointsInVirtualCategory(points, systemCategoryId).length;
}
export function listPointsInVirtualCategory(points: Point[], systemCategoryId: number | undefined): Point[] {
    return points.filter((p) => !p.category || (systemCategoryId != null && p.category?.id === systemCategoryId));
}
export function countPointsInVirtualContainer(points: Point[], systemContainerId: string | undefined): number {
    return listPointsInVirtualContainer(points, systemContainerId).length;
}
export function listPointsInVirtualContainer(points: Point[], systemContainerId: string | undefined): Point[] {
    return points.filter((p) => !p.container || (systemContainerId != null && p.container?.id === systemContainerId));
}
