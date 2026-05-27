export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "response" in error) {
        const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
        if (Array.isArray(message)) {
            const first = message[0];
            return typeof first === "string" ? first : fallback;
        }
        if (typeof message === "string") {
            return message;
        }
    }
    if (error instanceof Error && error.message && error.message !== "No access token available") {
        return error.message;
    }
    return fallback;
}
