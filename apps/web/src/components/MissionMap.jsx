import React, { useMemo, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  Rectangle,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

/*
 * react-leaflet's default marker icon resolution breaks under bundlers
 * unless patched — mirrors the fix already used in MapComponent.jsx.
 */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Builds a numbered waypoint marker icon.
 *
 * @param {number} order
 * @returns {L.DivIcon}
 */
function createWaypointIcon(order) {
  return L.divIcon({
    className: 'mission-waypoint-icon',

    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:30px;
        height:30px;
        border-radius:9999px;
        background:hsl(var(--primary));
        color:hsl(var(--primary-foreground));
        font-size:12px;
        font-weight:700;
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.45);
      ">
        WP${order}
      </div>
    `,

    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

/**
 * Captures map clicks and reports the latitude/longitude
 * back to the parent so a new waypoint can be appended.
 */
function MapClickHandler({ onMapClick, onMapMove, disabled }) {
  useMapEvents({
    click(event) {
      if (disabled) return;

      const { lat, lng } = event.latlng;

      onMapClick(lat, lng);
    },
    mousemove(event) {
      if (disabled || !onMapMove) return;
      onMapMove(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapViewport({ center, fieldBoundary }) {
  const map = useMap();

  React.useEffect(() => {
    if (fieldBoundary?.length > 2) {
      map.fitBounds(fieldBoundary, { padding: [24, 24] });
      return;
    }

    map.setView(center, 16);
  }, [center, fieldBoundary, map]);

  return null;
}

/**
 * Interactive mission-planning map.
 *
 * Click anywhere on the map to append a sequentially numbered
 * waypoint. The route polyline updates immediately.
 *
 * The map intentionally uses a normal, high-contrast OpenStreetMap
 * layer in both light and dark dashboard themes so that roads,
 * buildings, field areas and waypoints remain clearly visible.
 */
const MissionMap = ({
  waypoints,
  onMapClick,
  onMapMove,
  onRemoveWaypoint,
  zones = [],
  draftZone = [],
  center,
  fieldBoundary = [],
  fieldName = '',
  disabled = false,
  heightClassName = 'h-[420px] sm:h-[480px] lg:h-[560px]',
}) => {
  const [mapStyle, setMapStyle] = useState('street');
  const orderedWaypoints = useMemo(
    () =>
      [...waypoints].sort(
        (a, b) => a.order - b.order
      ),
    [waypoints]
  );

  const polylinePositions = useMemo(
    () =>
      orderedWaypoints.map((wp) => [
        wp.latitude,
        wp.longitude,
      ]),
    [orderedWaypoints]
  );

  return (
    <div
      className={`
        ${heightClassName}
        w-full
        rounded-xl
        overflow-hidden
        border
        border-border
        relative
        z-0
        bg-white
      `}
      aria-label="Mission waypoint map"
    >
      <MapContainer
        center={center}
        zoom={16}
        style={{
          height: '100%',
          width: '100%',
          background: '#f3f4f6',
        }}
      >
        <MapViewport center={center} fieldBoundary={fieldBoundary} />

        <div className="leaflet-top leaflet-right" style={{ zIndex: 1000 }}>
          <div className="leaflet-control leaflet-bar flex overflow-hidden rounded-lg border-0 shadow-md">
            <button
              type="button"
              onClick={() => setMapStyle('street')}
              className={`border-0 px-3 py-2 text-xs font-semibold ${mapStyle === 'street' ? 'bg-white text-blue-700' : 'bg-white/90 text-slate-700'}`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`border-l border-slate-200 px-3 py-2 text-xs font-semibold ${mapStyle === 'satellite' ? 'bg-white text-blue-700' : 'bg-white/90 text-slate-700'}`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/*
         * Keep the actual map light and readable even when
         * the application's dashboard is using dark mode.
         */}
        <TileLayer
          attribution={mapStyle === 'satellite'
            ? 'Imagery &copy; Esri'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url={mapStyle === 'satellite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          maxZoom={19}
        />

        <MapClickHandler
          onMapClick={onMapClick}
          onMapMove={onMapMove}
          disabled={disabled}
        />

        {fieldBoundary.length > 2 && (
          <Polygon
            positions={fieldBoundary}
            pathOptions={{
              color: '#16a34a',
              weight: 3,
              fillColor: '#86efac',
              fillOpacity: 0.2,
              interactive: false,
            }}
          >
            <Popup>{fieldName || 'Selected field'}</Popup>
          </Polygon>
        )}

        {zones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={{
              color: zone.type === 'pollination' ? '#d97706' : '#dc2626',
              weight: 3,
              fillColor: zone.type === 'pollination' ? '#fbbf24' : '#f87171',
              fillOpacity: 0.35,
            }}
          >
            <Popup>{zone.name}</Popup>
          </Polygon>
        ))}

        {draftZone.length > 1 && (
          <Polyline
            positions={draftZone}
            pathOptions={{
              color: '#7c3aed',
              weight: 3,
              dashArray: '8 6',
            }}
          />
        )}

        {draftZone.length === 2 && (
          <Rectangle
            bounds={[draftZone[0], draftZone[1]]}
            pathOptions={{
              color: '#7c3aed',
              weight: 3,
              dashArray: '8 6',
              fillColor: '#c4b5fd',
              fillOpacity: 0.2,
            }}
          />
        )}

        {/* Mission route */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#2563eb',
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}

        {/* Waypoint markers */}
        {orderedWaypoints.map((wp) => (
          <Marker
            key={wp.id}
            position={[
              wp.latitude,
              wp.longitude,
            ]}
            icon={createWaypointIcon(wp.order)}
          >
            <Popup>
              <div className="text-sm space-y-1">
                <div className="font-semibold text-foreground">
                  WP{wp.order}
                </div>

                <div className="text-muted-foreground">
                  {wp.latitude.toFixed(6)},{' '}
                  {wp.longitude.toFixed(6)}
                </div>

                {onRemoveWaypoint && (
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveWaypoint(wp.id)
                    }
                    className="
                      text-destructive
                      text-xs
                      font-medium
                      hover:underline
                      mt-1
                    "
                  >
                    Remove waypoint
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MissionMap;