import { getApiUrl } from "./api-url";
export function getChatWebSocketUrl(accessToken: string): string {
    const custom = process.env.NEXT_PUBLIC_WS_URL?.trim().replace(/\/$/, "");
    const httpBase = getApiUrl();
    const wsBase = custom ?? httpBase.replace(/^http/, "ws");
    const path = `${wsBase}/chat`;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}access_token=${encodeURIComponent(accessToken)}`;
}
