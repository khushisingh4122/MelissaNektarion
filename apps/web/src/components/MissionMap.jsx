import React, { useMemo } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
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
function MapClickHandler({ onMapClick, disabled }) {
  useMapEvents({
    click(event) {
      if (disabled) return;

      const { lat, lng } = event.latlng;

      onMapClick(lat, lng);
    },
  });

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
  onRemoveWaypoint,
  center,
  disabled = false,
  heightClassName = 'h-[420px] sm:h-[480px] lg:h-[560px]',
}) => {
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
        {/*
         * Keep the actual map light and readable even when
         * the application's dashboard is using dark mode.
         */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapClickHandler
          onMapClick={onMapClick}
          disabled={disabled}
        />

        {/* Mission route */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
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