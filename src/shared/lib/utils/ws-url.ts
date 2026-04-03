import { getApiUrl } from "./api-url";

/**
 * URL WebSocket чата (`/chat`) с JWT в query (как в SPM_backend ChatGateway).
 * При необходимости задайте NEXT_PUBLIC_WS_URL (без завершающего слэша), например wss://back.a2015.ru
 */
export function getChatWebSocketUrl(accessToken: string): string {
  const custom = process.env.NEXT_PUBLIC_WS_URL?.trim().replace(/\/$/, "");
  const httpBase = getApiUrl();
  const wsBase = custom ?? httpBase.replace(/^http/, "ws");
  const path = `${wsBase}/chat`;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}access_token=${encodeURIComponent(accessToken)}`;
}
