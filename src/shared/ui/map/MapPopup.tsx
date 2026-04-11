"use client";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import MapLibreGL, { type PopupOptions } from "maplibre-gl";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import { useMap } from "./map-context";
function PopupCloseButton({ onClose }: {
    onClose: () => void;
}) {
    const { t } = useTranslation('common');
    return (<button type="button" onClick={onClose} className="absolute top-1 right-1 z-10 flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-card text-text-main shadow-sm ring-offset-background backdrop-blur-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" aria-label={t('map.popup.close')}>
      <X className="h-4 w-4 shrink-0" aria-hidden/>
      <span className="sr-only">{t('map.popup.close')}</span>
    </button>);
}
type MapPopupProps = {
    longitude: number;
    latitude: number;
    onClose?: () => void;
    children: ReactNode;
    className?: string;
    closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;
function MapPopup({ longitude, latitude, onClose, children, className, closeButton = false, ...popupOptions }: MapPopupProps) {
    const { map } = useMap();
    const popupOptionsRef = useRef(popupOptions);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const container = useMemo(() => document.createElement("div"), []);
    const popup = useMemo(() => {
        const popupInstance = new MapLibreGL.Popup({
            offset: 16,
            ...popupOptions,
            closeButton: false,
        })
            .setMaxWidth("none")
            .setLngLat([longitude, latitude]);
        return popupInstance;
    }, []);
    useEffect(() => {
        if (!map)
            return;
        const onCloseProp = () => onCloseRef.current?.();
        popup.on("close", onCloseProp);
        popup.setDOMContent(container);
        popup.addTo(map);
        return () => {
            popup.off("close", onCloseProp);
            if (popup.isOpen()) {
                popup.remove();
            }
        };
    }, [map]);
    if (popup.isOpen()) {
        const prev = popupOptionsRef.current;
        if (popup.getLngLat().lng !== longitude ||
            popup.getLngLat().lat !== latitude) {
            popup.setLngLat([longitude, latitude]);
        }
        if (prev.offset !== popupOptions.offset) {
            popup.setOffset(popupOptions.offset ?? 16);
        }
        if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) {
            popup.setMaxWidth(popupOptions.maxWidth ?? "none");
        }
        popupOptionsRef.current = popupOptions;
    }
    const handleClose = () => {
        popup.remove();
    };
    return createPortal(<div className={cn("relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)}>
      {closeButton && <PopupCloseButton onClose={handleClose}/>}
      {children}
    </div>, container);
}
export { MapPopup, PopupCloseButton };
export type { MapPopupProps };
