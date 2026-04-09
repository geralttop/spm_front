"use client";
import { useState, useCallback } from "react";
export type PendingCrop = {
    id: string;
    src: string;
};
export function usePointPhotoCropQueue() {
    const [queue, setQueue] = useState<PendingCrop[]>([]);
    const enqueueFiles = useCallback((files: File[], options: {
        maxTotal: number;
        currentDraftCount: number;
    }) => {
        if (!files.length)
            return;
        setQueue((q) => {
            const remaining = options.maxTotal - options.currentDraftCount - q.length;
            if (remaining <= 0)
                return q;
            const toAdd = files
                .filter((f) => f.type.startsWith("image/"))
                .slice(0, remaining);
            const newItems: PendingCrop[] = toAdd.map((f) => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                src: URL.createObjectURL(f),
            }));
            return [...q, ...newItems];
        });
    }, []);
    const activeCrop = queue[0] ?? null;
    const shiftQueue = useCallback(() => {
        setQueue((q) => {
            const [first, ...rest] = q;
            if (first?.src)
                URL.revokeObjectURL(first.src);
            return rest;
        });
    }, []);
    const clearQueue = useCallback(() => {
        setQueue((q) => {
            for (const item of q) {
                URL.revokeObjectURL(item.src);
            }
            return [];
        });
    }, []);
    return { activeCrop, enqueueFiles, shiftQueue, clearQueue, queueLength: queue.length };
}
