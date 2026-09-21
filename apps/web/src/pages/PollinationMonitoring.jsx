import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { CheckCircle2, CloudRain, Gauge, MapPin, Navigation, Pause, Plane, Radio, Sparkles, Wind } from 'lucide-react';
import { MapContainer, Polygon, Rectangle, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';
import { fieldZones } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const zoneCount = 20;

function FieldViewport({ boundary }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(boundary, { padding: [24, 24] });
  }, [boundary, map]);

  return null;
}

function createCoverageCells(boundary, coverage) {
  const latitudes = boundary.map(([latitude]) => latitude);
  const longitudes = boundary.map(([, longitude]) => longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const rows = 4;
  const columns = 5;
  const coveredCells = Math.round((coverage / 100) * rows * columns);
  const cells = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const south = minLatitude + ((maxLatitude - minLatitude) * row) / rows;
      const north = minLatitude + ((maxLatitude - minLatitude) * (row + 1)) / rows;
      const west = minLongitude + ((maxLongitude - minLongitude) * column) / columns;
      const east = minLongitude + ((maxLongitude - minLongitude) * (column + 1)) / columns;
      cells.push({ bounds: [[south, west], [north, east]], covered: cells.length < coveredCells });
    }
  }

  return cells;
}

export default function PollinationMonitoring() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState('east');
  const selectedField = fieldZones.find((field) => field.id === selectedFieldId) || fieldZones[0];
  const selectedBoundary = selectedField.geometry.coordinates[0].map(([longitude, latitude]) => [latitude, longitude]);

  useEffect(() => {
    let active = true;
    const loadProgress = async () => {
      try {
        const response = await apiServerClient.fetch('/pollination/mission/1');
        const data = await response.json();
        if (active) setProgress(data);
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load mission progress.');
      }
    };
    loadProgress();
    const interval = window.setInterval(loadProgress, 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const coverage = progress?.progress || 0;
  const coveredZones = Math.round((coverage / 100) * zoneCount);
  const status = progress?.status === 'not_found' ? 'No active mission' : (progress?.status || 'Connecting');
  const active = Boolean(progress?.pollen_active);
  const pollenRunning = active && !paused;
  const coverageCells = useMemo(() => createCoverageCells(selectedBoundary, coverage), [selectedBoundary, coverage]);

  const togglePollen = () => setPaused((value) => {
    const next = !value;
    localStorage.setItem('melissa_pollen_paused', String(next));
    window.dispatchEvent(new Event('storage'));
    return next;
  });

  return (
    <DashboardLayout>
      <Helmet><title>{`${t('nav.pollination')} - ${t('app.title')}`}</title></Helmet>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-[#183d2d] p-6 text-white shadow-[0_18px_45px_rgba(24,61,45,0.2)] sm:p-8">
          <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[#c8df9d]"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-semibold uppercase tracking-[0.24em]">Autonomous field operation</span></div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Drone pollination</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Track where the drone has spread pollen, how much of the route is covered, and whether the mission is ready for its next pass.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-[#e8f1e2]"><Plane className="h-4 w-4 text-[#c8df9d]" />Drone A1 • pollen spread system</div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[[Navigation, 'Route covered', `${coverage}%`], [Gauge, 'Covered area', `${progress?.covered_acres ?? 0} / ${progress?.total_acres ?? 10} acres`], [Radio, 'Pollen system', active ? 'Active' : 'Standby'], [CheckCircle2, 'Mission state', status]].map(([Icon, label, value]) => <Card key={label} className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_12px_30px_rgba(24,61,45,0.06)]"><CardContent className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcefd5] text-[#557a45]"><Icon className="h-5 w-5" /></div><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#718446]">{label}</p><p className="mt-1 text-lg font-bold text-[#183d2d]">{value}</p></div></CardContent></Card>)}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_12px_30px_rgba(24,61,45,0.06)]">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="flex items-center gap-2 text-[#183d2d]"><MapPin className="h-5 w-5 text-[#557a45]" />Pollen coverage map</CardTitle><p className="mt-1 text-xs text-[#718446]">{selectedField.name} • green zones show covered route progress.</p></div><div className="flex items-center gap-2"><select value={selectedFieldId} onChange={(event) => setSelectedFieldId(event.target.value)} className="rounded-xl border border-[#cbd8c5] bg-white px-3 py-2 text-xs font-semibold text-[#355340]">{fieldZones.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}</select><span className="rounded-full bg-[#dcefd5] px-3 py-1 text-[10px] font-semibold text-[#557a45]">{pollenRunning ? 'Spreading pollen' : paused ? 'Pollen paused' : 'Standby'}</span></div></CardHeader>
            <CardContent>
              <div className="relative h-[330px] overflow-hidden rounded-2xl border border-[#cbd8c5]">
                <MapContainer key={selectedField.id} center={selectedBoundary[0]} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <FieldViewport boundary={selectedBoundary} />
                  <TileLayer attribution="Imagery &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
                  <Polygon positions={selectedBoundary} pathOptions={{ color: '#16a34a', weight: 3, fillColor: '#86efac', fillOpacity: 0.2 }} />
                  {coverageCells.map((cell, index) => <Rectangle key={index} bounds={cell.bounds} pathOptions={{ color: cell.covered ? '#15803d' : '#94a3b8', weight: 1, fillColor: cell.covered ? '#22c55e' : '#f8fafc', fillOpacity: cell.covered ? 0.58 : 0.12 }} />)}
                </MapContainer>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-[#55705c]"><span>Green = pollen covered</span><span>Gray = remaining area</span></div>
              <div className="mt-4 flex items-center justify-between"><div><p className="text-xs text-[#718446]">Pollen spread progress</p><p className="mt-1 text-3xl font-bold text-[#183d2d]">{coverage}%</p></div><div className="text-right"><p className="text-xs text-[#718446]">Zones covered</p><p className="mt-1 text-lg font-semibold text-[#557a45]">{coveredZones} / {zoneCount}</p></div></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d8e3d2]"><div className="h-full rounded-full bg-[#557a45] transition-all" style={{ width: `${coverage}%` }} /></div>
            </CardContent>
          </Card>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_12px_30px_rgba(24,61,45,0.06)]"><CardHeader><CardTitle className="text-[#183d2d]">Flight conditions</CardTitle></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-[#e8f1e2] p-4"><div className="flex items-center gap-2 text-[#557a45]"><Wind className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.14em]">Wind</span></div><p className="mt-2 text-2xl font-bold text-[#183d2d]">Safe window</p><p className="mt-1 text-xs text-[#718446]">Monitor gusts before the next pass.</p></div><div className="rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-4"><div className="flex items-center gap-2 text-[#557a45]"><CloudRain className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.14em]">Weather</span></div><p className="mt-2 text-sm font-bold text-[#183d2d]">No rain detected</p><p className="mt-1 text-xs text-[#718446]">Pollen spread should pause during rain.</p></div><button type="button" onClick={togglePollen} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#b8cbae] bg-white px-4 py-3 text-sm font-semibold text-[#355340]"><Pause className="h-4 w-4" />{paused ? 'Resume pollen spread' : 'Pause pollen spread'}</button><p className="text-[10px] text-[#718446]">{pollenRunning ? 'Pump command: running' : 'Pump command: paused'}</p></CardContent></Card>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
