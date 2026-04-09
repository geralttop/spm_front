import type MapLibreGL from "maplibre-gl";
type MapViewport = {
    center: [
        number,
        number
    ];
    zoom: number;
    bearing: number;
    pitch: number;
};
function getViewport(map: MapLibreGL.Map): MapViewport {
    const center = map.getCenter();
    return {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
    };
}
export { getViewport };
export type { MapViewport };
