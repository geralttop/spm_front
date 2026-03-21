"use client";

import { useCallback, useSyncExternalStore } from "react";

export type UserCoords = {
  longitude: number;
  latitude: number;
};

/** Один раз `getCurrentPosition` до показа карты (центрирование без лишнего watch). */
export function getInitialGeolocation(): Promise<UserCoords | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }

    const maxWaitMs = 12_000;
    const timer = setTimeout(() => resolve(null), maxWaitMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: maxWaitMs,
      }
    );
  });
}

let coords: UserCoords | null = null;
const listeners = new Set<() => void>();
let watchId: number | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function startWatch() {
  if (typeof window === "undefined") return;
  if (!("geolocation" in navigator)) return;
  if (watchId !== null) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      coords = {
        longitude: pos.coords.longitude,
        latitude: pos.coords.latitude,
      };
      emit();
    },
    () => {},
    { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
  );

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      coords = {
        longitude: pos.coords.longitude,
        latitude: pos.coords.latitude,
      };
      emit();
    },
    () => {},
    {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 30_000,
    }
  );
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

/** Мгновенное обновление после «найти меня» на карте (до следующего кадра watch). */
export function updateSharedUserCoords(next: UserCoords) {
  coords = next;
  emit();
}

/**
 * Одна подписка на геолокацию для всех карт: при нескольких видимых карточках
 * используется один `watchPosition`, а не N отдельных.
 *
 * @param enabled — подписываться только когда карта в viewport (или иначе нужна гео).
 */
export function useSharedUserLocation(enabled: boolean): UserCoords | null {
  const snapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        if (!enabled) return () => {};
        return subscribeStore(onStoreChange);
      },
      [enabled]
    ),
    getSnapshot,
    getServerSnapshot
  );
  return enabled ? snapshot : null;
}
