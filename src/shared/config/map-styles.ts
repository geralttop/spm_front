// Конфигурация стилей карт для использования во всем приложении

export const MAP_STYLES = {
  openstreet: {
    light: {
      version: 8 as const,
      sources: {
        "osm-tiles": {
          type: "raster" as const,
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      },
      layers: [
        {
          id: "osm-tiles",
          type: "raster" as const,
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "osm-tiles": {
          type: "raster" as const,
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      },
      layers: [
        {
          id: "osm-tiles",
          type: "raster" as const,
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  openstreet3d: {
    light: "https://tiles.openfreemap.org/styles/liberty",
    dark: "https://tiles.openfreemap.org/styles/liberty",
  },
  satellite: {
    light: {
      version: 8 as const,
      sources: {
        "satellite-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics",
        },
      },
      layers: [
        {
          id: "satellite-tiles",
          type: "raster" as const,
          source: "satellite-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "satellite-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics",
        },
      },
      layers: [
        {
          id: "satellite-tiles",
          type: "raster" as const,
          source: "satellite-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  carto: {
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  terrain: {
    light: {
      version: 8 as const,
      sources: {
        "terrain-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, HERE, Garmin, FAO, NOAA, USGS",
        },
      },
      layers: [
        {
          id: "terrain-tiles",
          type: "raster" as const,
          source: "terrain-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "terrain-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, HERE, Garmin, FAO, NOAA, USGS",
        },
      },
      layers: [
        {
          id: "terrain-tiles",
          type: "raster" as const,
          source: "terrain-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  osmHumanitarian: {
    light: {
      version: 8 as const,
      sources: {
        "osm-hot": {
          type: "raster" as const,
          tiles: ["https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors, Humanitarian OSM Team',
        },
      },
      layers: [
        {
          id: "osm-hot",
          type: "raster" as const,
          source: "osm-hot",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "osm-hot": {
          type: "raster" as const,
          tiles: ["https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors, Humanitarian OSM Team',
        },
      },
      layers: [
        {
          id: "osm-hot",
          type: "raster" as const,
          source: "osm-hot",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  streets: {
    light: {
      version: 8 as const,
      sources: {
        "esri-streets": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, HERE, Garmin, USGS, NGA, EPA",
        },
      },
      layers: [
        {
          id: "esri-streets",
          type: "raster" as const,
          source: "esri-streets",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "esri-streets": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, HERE, Garmin, USGS, NGA, EPA",
        },
      },
      layers: [
        {
          id: "esri-streets",
          type: "raster" as const,
          source: "esri-streets",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  natGeo: {
    light: {
      version: 8 as const,
      sources: {
        "natgeo-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, National Geographic, Garmin, HERE, UNEP-WCMC",
        },
      },
      layers: [
        {
          id: "natgeo-tiles",
          type: "raster" as const,
          source: "natgeo-tiles",
          minzoom: 0,
          maxzoom: 16,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "natgeo-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, National Geographic, Garmin, HERE, UNEP-WCMC",
        },
      },
      layers: [
        {
          id: "natgeo-tiles",
          type: "raster" as const,
          source: "natgeo-tiles",
          minzoom: 0,
          maxzoom: 16,
        },
      ],
    },
  },
  stamenTerrain: {
    light: {
      version: 8 as const,
      sources: {
        "stamen-terrain": {
          type: "raster" as const,
          tiles: [
            "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: '&copy; Stadia Maps, &copy; Stamen Design, &copy; OpenStreetMap',
        },
      },
      layers: [
        {
          id: "stamen-terrain",
          type: "raster" as const,
          source: "stamen-terrain",
          minzoom: 0,
          maxzoom: 18,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "stamen-terrain": {
          type: "raster" as const,
          tiles: [
            "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: '&copy; Stadia Maps, &copy; Stamen Design, &copy; OpenStreetMap',
        },
      },
      layers: [
        {
          id: "stamen-terrain",
          type: "raster" as const,
          source: "stamen-terrain",
          minzoom: 0,
          maxzoom: 18,
        },
      ],
    },
  },
  stamenToner: {
    light: {
      version: 8 as const,
      sources: {
        "stamen-toner": {
          type: "raster" as const,
          tiles: [
            "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: '&copy; Stadia Maps, &copy; Stamen Design, &copy; OpenStreetMap',
        },
      },
      layers: [
        {
          id: "stamen-toner",
          type: "raster" as const,
          source: "stamen-toner",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "stamen-toner": {
          type: "raster" as const,
          tiles: [
            "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: '&copy; Stadia Maps, &copy; Stamen Design, &copy; OpenStreetMap',
        },
      },
      layers: [
        {
          id: "stamen-toner",
          type: "raster" as const,
          source: "stamen-toner",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
  },
  stamenWatercolor: {
    light: {
      version: 8 as const,
      sources: {
        "stamen-watercolor": {
          type: "raster" as const,
          tiles: [
            "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
          ],
          tileSize: 256,
          attribution: '&copy; Stadia Maps, &copy; Stamen Design, &copy; OpenStreetMap',
        },
      },
      layers: [
        {
          id: "stamen-watercolor",
          type: "raster" as const,
          source: "stamen-watercolor",
          minzoom: 0,
          maxzoom: 16,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "stamen-watercolor": {
          type: "raster" as const,
          tiles: [
            "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
          ],
          tileSize: 256,
          attribution: '&copy; Stadia Maps, &copy; Stamen Design, &copy; OpenStreetMap',
        },
      },
      layers: [
        {
          id: "stamen-watercolor",
          type: "raster" as const,
          source: "stamen-watercolor",
          minzoom: 0,
          maxzoom: 16,
        },
      ],
    },
  },
  openTopoMap: {
    light: {
      version: 8 as const,
      sources: {
        "opentopomap": {
          type: "raster" as const,
          tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors, SRTM, OpenTopoMap',
        },
      },
      layers: [
        {
          id: "opentopomap",
          type: "raster" as const,
          source: "opentopomap",
          minzoom: 0,
          maxzoom: 17,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "opentopomap": {
          type: "raster" as const,
          tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors, SRTM, OpenTopoMap',
        },
      },
      layers: [
        {
          id: "opentopomap",
          type: "raster" as const,
          source: "opentopomap",
          minzoom: 0,
          maxzoom: 17,
        },
      ],
    },
  },
};

export type MapStyleKey = keyof typeof MAP_STYLES;
