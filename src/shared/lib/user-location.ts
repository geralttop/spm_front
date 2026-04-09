"use client";
import { useCallback, useSyncExternalStore } from "react";
export type UserCoords = {
    longitude: number;
    latitude: number;
};
export function getInitialGeolocation(): Promise<UserCoords | null> {
    return new Promise((resolve) => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            resolve(null);
            return;
        }
        const maxWaitMs = 12000;
        const timer = setTimeout(() => resolve(null), maxWaitMs);
        navigator.geolocation.getCurrentPosition((pos) => {
            clearTimeout(timer);
            resolve({
                longitude: pos.coords.longitude,
                latitude: pos.coords.latitude,
            });
        }, () => {
            clearTimeout(timer);
            resolve(null);
        }, {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: maxWaitMs,
        });
    });
}
let coords: UserCoords | null = null;
const listeners = new Set<() => void>();
let watchId: number | null = null;
function emit() {
    listeners.forEach((l) => l());
}
function startWatch() {
    if (typeof window === "undefined")
        return;
    if (!("geolocation" in navigator))
        return;
    if (watchId !== null)
        return;
    navigator.geolocation.getCurrentPosition((pos) => {
        coords = {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
        };
        emit();
    }, () => { }, { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 });
    watchId = navigator.geolocation.watchPosition((pos) => {
        coords = {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
        };
        emit();
    }, () => { }, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 30000,
    });
}
function stopWatch() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}
function subscribeStore(onStoreChange: () => void) {
    listeners.add(onStoreChange);
    if (listeners.size === 1) {
        startWatch();
    }
    return () => {
        listeners.delete(onStoreChange);
        if (listeners.size === 0) {
            stopWatch();
        }
    };
}
function getSnapshot() {
    return coords;
}
function getServerSnapshot() {
    return null;
}
export function updateSharedUserCoords(next: UserCoords) {
    coords = next;
    emit();
}
export function useSharedUserLocation(enabled: boolean): UserCoords | null {
    const snapshot = useSyncExternalStore(useCallback((onStoreChange) => {
        if (!enabled)
            return () => { };
        return subscribeStore(onStoreChange);
    }, [enabled]), getSnapshot, getServerSnapshot);
    return enabled ? snapshot : null;
}
