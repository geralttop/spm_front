export function getApiUrl(): string {
    const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (fromEnv) {
        return fromEnv.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        return `${protocol}//${hostname}:3000`;
    }
    return 'http://localhost:3000';
}
