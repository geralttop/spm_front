"use client";
import { useEffect, useRef } from "react";
import { getChatWebSocketUrl } from "@/shared/lib/utils/ws-url";
export function useChatWebSocket(accessToken: string | null, onMessage: (event: string, data: unknown) => void) {
    const cb = useRef(onMessage);
    useEffect(() => {
        cb.current = onMessage;
    }, [onMessage]);
    useEffect(() => {
        if (!accessToken)
            return;
        const ws = new WebSocket(getChatWebSocketUrl(accessToken));
        ws.onmessage = (ev) => {
            try {
                const msg = JSON.parse(String(ev.data)) as {
                    event?: string;
                    data?: unknown;
                };
                if (msg.event) {
                    cb.current(msg.event, msg.data);
                }
            }
            catch {
            }
        };
        return () => {
            ws.close();
        };
    }, [accessToken]);
}
