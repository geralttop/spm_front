const PARTIAL_COORD = /^-?\d*\.?\d*$/;

export function sanitizeCoordinateInput(value: string): string {
    return value.replace(",", ".");
}

export function isValidCoordinateInput(value: string): boolean {
    return PARTIAL_COORD.test(sanitizeCoordinateInput(value));
}

export function applyCoordinateInput(raw: string): string | null {
    const normalized = sanitizeCoordinateInput(raw);
    if (!isValidCoordinateInput(normalized)) {
        return null;
    }
    return normalized;
}

export function parseCoordinateInput(value: string): number | null {
    const normalized = sanitizeCoordinateInput(value.trim());
    if (normalized === "" || normalized === "-" || normalized === "." || normalized === "-.") {
        return null;
    }
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? null : parsed;
}

export function formatCoordinateInput(value: number): string {
    return String(value);
}
