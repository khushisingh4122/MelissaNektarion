import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useWebSocketSimulator } from '../hooks/useWebSocketSimulator.js';
import { droneData } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { apiServerClient } from '../lib/apiServerClient.js';
import { FARM_BOUNDARY } from '../lib/fieldData.js';
import { Battery, Camera, Gauge, MapPin, Navigation, Plane, Radio, ShieldCheck, Timer, Plug, Unplug } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;
const PI_CAMERA_BASE = (import.meta.env.VITE_PI_CAMERA_URL || '').replace(/\/$/, '');

const demoRoute = [
  [28.6148, 77.2082],
  [28.6146, 77.2085],
  [28.6144, 77.2088],
  [28.6142, 77.2091],
];

const createDroneIcon = () => L.divIcon({
  className: 'live-drone-map-icon',
  html: '<div style="width:42px;height:42px;border-radius:9999px;background:#1f5d3d;border:3px solid white;box-shadow:0 4px 16px rgba(24,61,45,.35);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">✈</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function FollowDrone({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.panTo([position.latitude, position.longitude], { animate: true, duration: 0.4 });
  }, [map, position?.latitude, position?.longitude]);

  return null;
}

function LiveFarmMap({ position, connected }) {
  const route = position
    ? [...demoRoute, [position.latitude, position.longitude]]
    : demoRoute;
  const center = position ? [position.latitude, position.longitude] : demoRoute[0];

  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-[#cbd8c5]">
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
        <FollowDrone position={position} />
        <TileLayer attribution="Imagery &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
        <Polygon positions={FARM_BOUNDARY} pathOptions={{ color: '#86efac', weight: 2, fillColor: '#86efac', fillOpacity: 0.15 }} />
        <Polyline positions={route} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.9 }} />
        {route.map(([latitude, longitude], index) => (
          <Marker key={`${latitude}-${longitude}-${index}`} position={[latitude, longitude]} icon={L.divIcon({ className: 'map-waypoint', html: `<div style="width:24px;height:24px;border-radius:9999px;background:#2563eb;border:2px solid white;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">${index + 1}</div>`, iconSize: [24, 24], iconAnchor: [12, 12] })}>
            <Popup>Route point {index + 1}</Popup>
          </Marker>
        ))}
        {position && <Marker position={[position.latitude, position.longitude]} icon={createDroneIcon()} zIndexOffset={1000}><Popup><strong>Drone A1</strong><br />{connected ? 'Live Pixhawk GPS' : 'Demo position'}</Popup></Marker>}
      </MapContainer>
      <div className="absolute left-3 top-3 z-[1000] rounded-full bg-[#f5f7f1]/95 px-3 py-1.5 text-[10px] font-semibold text-[#355340] shadow-sm">
        {connected ? 'Live drone GPS' : 'Demo drone position'}
      </div>
    </div>
  );
}

const DroneMonitoring = () => {
  const { t } = useTranslation();
  const simulatedData = useWebSocketSimulator(droneData);
  const [telemetry, setTelemetry] = useState(simulatedData);
  const [hardwareStatus, setHardwareStatus] = useState({ connected: false });
  const [connectionString, setConnectionString] = useState('');
  const [hardwareError, setHardwareError] = useState('');
  const [dronePosition, setDronePosition] = useState({ latitude: droneData.gpsCoordinates.lat, longitude: droneData.gpsCoordinates.lng });
  const [cameraImage, setCameraImage] = useState('');
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [liveOn, setLiveOn] = useState(false);
  const [capturedImages, setCapturedImages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('melissa_camera_captures') || '[]');
    } catch {
      return [];
    }
  });

  const cameraUrl = () => `${API_BASE}/camera/latest?ts=${Date.now()}`;

  const piCameraUrl = (path) => `${PI_CAMERA_BASE}${path}`;

  const captureCameraImage = async () => {
    setCameraBusy(true);
    setCameraError('');
    try {
      let data;
      let imageUrl;
      if (PI_CAMERA_BASE) {
        const imageResponse = await fetch(piCameraUrl('/capture'));
        if (!imageResponse.ok) throw new Error('Raspberry Pi camera capture failed.');
        const imageBlob = await imageResponse.blob();
        const formData = new FormData();
        formData.append('file', new File([imageBlob], 'pi-capture.jpg', { type: imageBlob.type || 'image/jpeg' }));
        const analysisResponse = await apiServerClient.fetch('/pest-detection/analyze-image', { method: 'POST', body: formData });
        data = await analysisResponse.json();
        if (!analysisResponse.ok) throw new Error(data.detail || 'Image analysis failed.');
        imageUrl = URL.createObjectURL(imageBlob);
      } else {
        const response = await apiServerClient.fetch('/camera/capture-and-analyze', { method: 'POST' });
        data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Camera capture failed.');
        imageUrl = cameraUrl();
      }
      const captured = {
        id: `capture_${Date.now()}`,
        url: imageUrl,
        timestamp: new Date().toLocaleString(),
        location: 'Raspberry Pi camera',
        analysis: data,
        analysisFocus: 'complete',
      };
      const nextCaptures = [captured, ...capturedImages].slice(0, 12);
      setCapturedImages(nextCaptures);
      localStorage.setItem('melissa_camera_captures', JSON.stringify(nextCaptures));
      localStorage.setItem('melissa_latest_camera_capture', JSON.stringify(captured));
      setCameraImage(captured.url);
    } catch (error) {
      setCameraError(error.message || 'Camera is not available.');
    } finally {
      setCameraBusy(false);
    }
  };

  const refreshHardware = async () => {
    try {
      const statusResponse = await apiServerClient.fetch('/pixhawk/status');
      const status = await statusResponse.json();
      setHardwareStatus(status);
      if (!status.connected) return;

      const telemetryResponse = await apiServerClient.fetch('/pixhawk/telemetry');
      if (!telemetryResponse.ok) return;
      const live = await telemetryResponse.json();
      setTelemetry({
        battery: live.battery?.battery_remaining,
        altitude: live.altitude,
        speed: live.speed?.ground_speed ?? 0,
        location: `${live.gps.latitude.toFixed(5)}, ${live.gps.longitude.toFixed(5)}`,
        gps: 'Locked',
        camera: 'Unknown',
      });
      if (live.gps?.latitude != null && live.gps?.longitude != null) {
        setDronePosition({ latitude: live.gps.latitude, longitude: live.gps.longitude });
      }
    } catch (error) {
      setHardwareError(error.message || 'Could not read Pixhawk telemetry.');
    }
  };

  const refreshCameraStatus = async () => {
    try {
      const response = PI_CAMERA_BASE
        ? await fetch(piCameraUrl('/status'))
        : await apiServerClient.fetch('/camera/status');
      if (!response.ok) return;
      const status = await response.json();
      setCameraAvailable(Boolean(status.available));
    } catch {
      setCameraAvailable(false);
    }
  };

  const connectHardware = async () => {
    setHardwareError('');
    try {
      const response = await apiServerClient.fetch('/pixhawk/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_string: connectionString }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Pixhawk connection failed.');
      setHardwareStatus(data);
      await refreshHardware();
    } catch (error) {
      setHardwareError(error.message || 'Pixhawk connection failed.');
    }
  };

  const disconnectHardware = async () => {
    await apiServerClient.fetch('/pixhawk/disconnect', { method: 'POST' });
    setHardwareStatus({ connected: false });
    setHardwareError('');
    setTelemetry(simulatedData);
  };

  useEffect(() => {
    let active = true;
    apiServerClient.fetch('/drones/1/telemetry')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data) setTelemetry(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    refreshHardware();
    refreshCameraStatus();
    const interval = window.setInterval(refreshHardware, 5000);
    const cameraInterval = window.setInterval(refreshCameraStatus, 5000);
    return () => {
      window.clearInterval(interval);
      window.clearInterval(cameraInterval);
    };
  }, []);

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.droneMonitoring')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight" style={{ textWrap: 'balance' }}>
            Drone monitoring
          </h1>
          <p className="text-muted-foreground mt-1">{t('drone.subtitle')}</p>
        </div>

        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]">
          <CardHeader><CardTitle className="text-lg text-[#183d2d]">Hardware connection</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input value={connectionString} onChange={(event) => setConnectionString(event.target.value)} disabled={hardwareStatus.connected} className="flex-1 rounded-lg border border-[#cbd8c5] bg-white px-3 py-2 text-sm" placeholder="COM3 or /dev/ttyUSB0" />
              {hardwareStatus.connected ? (
                <Button type="button" variant="outline" onClick={disconnectHardware}><Unplug className="mr-2 h-4 w-4" />Disconnect</Button>
              ) : (
                <Button type="button" onClick={connectHardware}><Plug className="mr-2 h-4 w-4" />Connect Pixhawk</Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{hardwareStatus.connected ? 'Live Pixhawk telemetry is active.' : 'Enter a serial port such as COM3 or /dev/ttyACM0, then connect.'}</p>
            {hardwareError && <p className="text-sm text-red-600">{hardwareError}</p>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718446]">Live operations</p>
            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
              <Card className="overflow-hidden border border-[#cbd8c5] bg-[#f5f7f1]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-[#183d2d]">Live farm map</CardTitle>
                    <p className="mt-1 text-xs text-[#718446]">Drone A1 • Apple Orchard Farm</p>
                  </div>
                  <span className="rounded-full bg-[#dcefd5] px-3 py-1 text-[10px] font-semibold text-[#557a45]">In progress</span>
                </CardHeader>
                <CardContent>
                  <LiveFarmMap position={dronePosition} connected={hardwareStatus.connected} />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="text-lg text-[#183d2d]">Flight telemetry</CardTitle></CardHeader><CardContent className="space-y-3">{[[Battery, 'Battery', `${telemetry?.battery ?? 72}%`], [Gauge, 'Speed', `${telemetry?.speed ?? 5.2} m/s`], [Navigation, 'Altitude', `${telemetry?.altitude ?? 12} m`], [MapPin, 'Location', telemetry?.location || 'Apple Orchard']].map(([Icon, label, value]) => <div key={label} className="flex items-center justify-between rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-3"><span className="flex items-center gap-2 text-xs text-[#55705c]"><Icon className="h-4 w-4 text-[#557a45]" />{label}</span><strong className="text-sm text-[#183d2d]">{value}</strong></div>)}</CardContent></Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[Radio, 'GPS', telemetry?.gps || 'Locked'], [Battery, 'Battery', `${telemetry?.battery ?? 72}%`], [Camera, 'Camera', telemetry?.camera || 'Online'], [ShieldCheck, 'Mission safety', 'Clear']].map(([Icon, label, value]) => <Card key={label} className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardContent className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcefd5] text-[#557a45]"><Icon className="h-5 w-5" /></div><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#718446]">{label}</p><p className="mt-1 text-sm font-bold text-[#183d2d]">{value}</p></div></CardContent></Card>)}</div>

        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]">
          <CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle className="text-lg text-[#183d2d]">Raspberry Pi camera</CardTitle><p className="mt-1 text-xs text-[#718446]">Capture a field image and send it through crop disease and pest analysis.</p><p className={`mt-1 text-xs font-semibold ${cameraAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>{cameraAvailable ? 'Camera available' : 'Waiting for camera capture'}</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setLiveOn((on) => !on)}>{liveOn ? 'Stop live view' : 'Start live view'}</Button><Button type="button" onClick={captureCameraImage} disabled={cameraBusy}>{cameraBusy ? 'Capturing...' : 'Capture and analyze'}</Button></div></CardHeader>
          <CardContent>
            {liveOn ? <img src={PI_CAMERA_BASE ? piCameraUrl('/stream') : `${API_BASE}/camera/stream`} alt="Live camera stream" className="aspect-video w-full rounded-2xl border border-[#cbd8c5] object-cover" /> : cameraImage ? <img src={cameraImage} alt="Latest Raspberry Pi camera capture" className="aspect-video w-full rounded-2xl border border-[#cbd8c5] object-cover" /> : <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-[#b8cbae] bg-[#eef4e9] text-sm text-[#718446]">No Raspberry Pi capture yet</div>}
            {cameraError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{cameraError}</p>}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg">{t('drone.recentCaptures')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...capturedImages, ...simulatedData.lastImages].map((image) => (
                <div key={image.id} className="space-y-2">
                  <div className="rounded-xl overflow-hidden border aspect-video">
                    <img
                      src={image.url}
                      alt={`Drone capture of ${image.location}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{image.location}</p>
                    <p className="text-xs text-muted-foreground">{image.timestamp}</p>
                    {image.analysis && <p className="mt-1 text-xs text-emerald-700">AI analysis ready in AI Insights</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DroneMonitoring;