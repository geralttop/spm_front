import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) {
        return 'Только что';
    }
    else if (diffInHours < 24) {
        return `${diffInHours} ч. назад`;
    }
    else if (diffInHours < 168) {
        const days = Math.floor(diffInHours / 24);
        return `${days} дн. назад`;
    }
    else {
        return date.toLocaleDateString('ru-RU');
    }
}
export function formatDate(dateString: string, locale: string = 'ru-RU'): string {
    return new Date(dateString).toLocaleDateString(locale);
}
export function formatCoordinates(coords: [
    number,
    number
]): string {
    return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
}
