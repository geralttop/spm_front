"use client";

import { useEffect, useRef } from "react";
import { getChatWebSocketUrl } from "@/shared/lib/utils/ws-url";

/**
 * Одно подключение к `/chat` на вкладку; колбэк всегда актуальный через ref.
 */
export function useChatWebSocket(
  accessToken: string | null,
  onMessage: (event: string, data: unknown) => void,
) {
  const cb = useRef(onMessage);
  cb.current = onMessage;

  useEffect(() => {
    if (!accessToken) return;
    const ws = new WebSocket(getChatWebSocketUrl(accessToken));
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(String(ev.data)) as { event?: string; data?: unknown };
        if (msg.event) {
          cb.current(msg.event, msg.data);
        }
      } catch {
        /* ignore malformed */
      }
    };
    return () => {
      ws.close();
    };
  }, [accessToken]);
}
