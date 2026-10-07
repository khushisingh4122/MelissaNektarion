import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createDroneIcon = (heading = 0) =>
  L.divIcon({
    className: 'drone-simulation-icon',
    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:9999px;
        background:rgba(255,255,255,0.96);
        border:2px solid #2563eb;
        box-shadow:0 4px 16px rgba(37,99,235,0.35);
        display:flex;
        align-items:center;
        justify-content:center;
        transform:rotate(${heading}deg);
      ">
        <div style="
          width:0;
          height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-bottom:20px solid #2563eb;
          transform:translateY(-2px);
        "></div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

const FitBounds = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!waypoints?.length) return;
    const bounds = L.latLngBounds(waypoints.map((wp) => [wp.latitude, wp.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17, animate: true });
  }, [map, waypoints]);

  return null;
};

const RecenterDrone = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.panTo([position.latitude, position.longitude], { animate: true, duration: 0.4 });
  }, [map, position?.latitude, position?.longitude]);

  return null;
};

const DroneSimulationMap = ({ mission, simulation }) => {
  const waypoints = useMemo(
    () => [...(mission?.waypoints || [])].sort((a, b) => a.order - b.order),
    [mission?.waypoints]
  );

  const route = waypoints.map((wp) => [wp.latitude, wp.longitude]);

  const center = route[0] || [29.8656, 77.8965];

  return (
    <div className="relative h-[420px] sm:h-[500px] lg:h-[580px] w-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FitBounds waypoints={waypoints} />

        <RecenterDrone position={simulation.position} />

        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.75 }}
          />
        )}

        {simulation.position && simulation.progress > 0 && simulation.status !== 'idle' && (
          <Polyline
            positions={[
              [route[0][0], route[0][1]],
              [simulation.position.latitude, simulation.position.longitude],
            ]}
            pathOptions={{ color: '#16a34a', weight: 6, opacity: 0.8 }}
          />
        )}

        {waypoints.map((wp) => (
          <CircleMarker
            key={wp.id}
            center={[wp.latitude, wp.longitude]}
            radius={9}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: '#2563eb',
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>WP{wp.order}</strong>
                <div>{wp.latitude.toFixed(6)}, {wp.longitude.toFixed(6)}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {simulation.position && (
          <Marker
            position={[simulation.position.latitude, simulation.position.longitude]}
            icon={createDroneIcon(simulation.bearing)}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-sm space-y-1">
                <strong>Simulated UAV</strong>
                <div>Status: {simulation.status}</div>
                <div>Altitude: {simulation.altitude.toFixed(1)} m</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="absolute left-4 top-4 z-[1000] rounded-xl border border-white/70 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Simulation Mode
        </div>
        <p className="mt-0.5 text-xs text-slate-500">No real flight commands are being sent.</p>
      </div>
    </div>
  );
};

export default DroneSimulationMap;
