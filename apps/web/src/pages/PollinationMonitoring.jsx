import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { CheckCircle2, CloudRain, Gauge, MapPin, Navigation, Pause, Plane, Play, Radio, Sparkles, Wind } from 'lucide-react';
import { MapContainer, Polygon, Rectangle, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';
import { fieldZones } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const FIELD_ZONE_BY_ID = {
  'field-a': 'north',
  'field-b': 'east',
  'field-c': 'south',
  'field-d': 'west',
};

function FieldViewport({ boundary }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(boundary, { padding: [24, 24] });
  }, [boundary, map]);

  return null;
}

function getZoneBounds(zone) {
  const latitudes = zone.coordinates.map(([latitude]) => latitude);
  const longitudes = zone.coordinates.map(([, longitude]) => longitude);
  return {
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
  };
}

function getPollinationMapBounds(zones, fallbackBoundary) {
  const coordinates = zones.flatMap((zone) => zone.coordinates || []);
  if (coordinates.length < 3) return fallbackBoundary;
  const latitudes = coordinates.map(([latitude]) => latitude);
  const longitudes = coordinates.map(([, longitude]) => longitude);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

export default function PollinationMonitoring() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(() => localStorage.getItem('melissa_pollen_paused') === 'true');
  const [savedMissions] = useState(() => {
    try {
      const missions = JSON.parse(localStorage.getItem('melissa_missions') || '[]');
      return Array.isArray(missions) ? missions : [];
    } catch {
      return [];
    }
  });
  const [activeMission, setActiveMission] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('melissa_active_mission') || 'null');
    } catch {
      return null;
    }
  });
  const [selectedMissionId, setSelectedMissionId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('melissa_active_mission') || 'null')?.id || '';
    } catch {
      return '';
    }
  });
  const [selectedFieldId, setSelectedFieldId] = useState(() => FIELD_ZONE_BY_ID[activeMission?.field] || 'east');
  const selectedField = fieldZones.find((field) => field.id === selectedFieldId) || fieldZones[0];
  const selectedBoundary = selectedField.geometry.coordinates[0].map(([longitude, latitude]) => [latitude, longitude]);
  const missionId = activeMission?.backendMissionId || 1;
  const pollinationZones = activeMission?.pollinationZones || [];
  const pesticideZones = activeMission?.pesticideZones || [];
  const pollinationMapBounds = getPollinationMapBounds(pollinationZones, selectedBoundary);

  const handleMissionChange = (missionId) => {
    const mission = savedMissions.find((item) => item.id === missionId);
    if (!mission) return;
    setSelectedMissionId(missionId);
    setActiveMission(mission);
    setSelectedFieldId(FIELD_ZONE_BY_ID[mission.field] || 'east');
    localStorage.setItem('melissa_active_mission', JSON.stringify(mission));
    setProgress(null);
  };

  useEffect(() => {
    let active = true;
    const loadProgress = async () => {
      try {
        const response = await apiServerClient.fetch(`/pollination/mission/${missionId}`);
        const data = await response.json();
        if (active) setProgress(data);
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load mission progress.');
      }
    };
    loadProgress();
    const interval = window.setInterval(loadProgress, 5000);
    return () => { active = false; window.clearInterval(interval); };
  }, [missionId]);

  const coverage = progress?.progress || 0;
  const coveredZones = pollinationZones.filter((_, index) => coverage >= ((index + 1) / Math.max(pollinationZones.length, 1)) * 100).length;
  const status = progress?.status === 'not_found' ? 'No active mission' : (progress?.status || 'Connecting');
  const active = Boolean(progress?.pollen_active);
  const pollenRunning = active && !paused;
  const zoneCompletion = (index) => Math.max(0, Math.min(100, coverage * pollinationZones.length - index * 100));

  const togglePollen = async () => {
    const next = !paused;
    setPaused(next);
    try {
      await apiServerClient.fetch(`/pollination/mission/${missionId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused: next }),
      });
      localStorage.setItem('melissa_pollen_paused', String(next));
      window.dispatchEvent(new Event('storage'));
    } catch (toggleError) {
      setError(toggleError.message || 'Unable to toggle the pollen pump.');
      setPaused(!next);
    }
  };

  const setPollenState = async (shouldPause) => {
    if (paused === shouldPause) return;
    await togglePollen();
  };

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
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="flex items-center gap-2 text-[#183d2d]"><MapPin className="h-5 w-5 text-[#557a45]" />Pollen coverage map</CardTitle><p className="mt-1 text-xs text-[#718446]">{activeMission?.missionName || 'No saved mission'} • {selectedField.name} • amber zones are selected pollination areas.</p></div><div className="flex flex-wrap items-center gap-2"><select value={selectedMissionId} onChange={(event) => handleMissionChange(event.target.value)} className="rounded-xl border border-[#cbd8c5] bg-white px-3 py-2 text-xs font-semibold text-[#355340]"><option value="">Select saved mission</option>{savedMissions.map((mission) => <option key={mission.id} value={mission.id}>{mission.missionName}</option>)}</select><select value={selectedFieldId} onChange={(event) => setSelectedFieldId(event.target.value)} className="rounded-xl border border-[#cbd8c5] bg-white px-3 py-2 text-xs font-semibold text-[#355340]">{fieldZones.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}</select><span className="rounded-full bg-[#dcefd5] px-3 py-1 text-[10px] font-semibold text-[#557a45]">{pollenRunning ? 'Spreading pollen' : paused ? 'Pollen paused' : 'Standby'}</span></div></CardHeader>
            <CardContent>
              <div className="relative h-[330px] overflow-hidden rounded-2xl border border-[#cbd8c5]">
                <MapContainer key={`${selectedMissionId}-${pollinationZones.length}`} center={pollinationMapBounds[0]} zoom={17} style={{ height: '100%', width: '100%' }}>
                  <FieldViewport boundary={pollinationMapBounds} />
                  <TileLayer attribution="Imagery &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
                  {pollinationZones.map((zone, index) => {
                    const completion = zoneCompletion(index);
                    const complete = completion >= 100;
                    const bounds = getZoneBounds(zone);
                    const coveredEast = bounds.minLongitude + ((bounds.maxLongitude - bounds.minLongitude) * completion) / 100;
                    return <React.Fragment key={zone.id}>
                      <Polygon positions={zone.coordinates} pathOptions={{ color: complete ? '#15803d' : '#d97706', weight: 4, fillColor: complete ? '#22c55e' : completion > 0 ? '#fbbf24' : '#cbd5e1', fillOpacity: complete ? 0.62 : 0.42 }} />
                      {zone.shape === 'rectangle' && completion > 0 && completion < 100 && <Rectangle bounds={[[bounds.minLatitude, bounds.minLongitude], [bounds.maxLatitude, coveredEast]]} pathOptions={{ color: '#15803d', weight: 2, fillColor: '#22c55e', fillOpacity: 0.38 }} />}
                    </React.Fragment>;
                  })}
                </MapContainer>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-[#55705c]"><span>Selected pollination zones only</span><span>Gray = not started • Amber = in progress • Green = pollinated</span></div>
              <div className="mt-4 flex items-center justify-between"><div><p className="text-xs text-[#718446]">Pollen spread progress</p><p className="mt-1 text-3xl font-bold text-[#183d2d]">{coverage}%</p></div><div className="text-right"><p className="text-xs text-[#718446]">Zones complete</p><p className="mt-1 text-lg font-semibold text-[#557a45]">{coveredZones} / {pollinationZones.length}</p></div></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d8e3d2]"><div className="h-full rounded-full bg-[#557a45] transition-all" style={{ width: `${coverage}%` }} /></div>
              <div className="mt-4 space-y-2">
                {pollinationZones.length === 0 ? <p className="rounded-lg border border-dashed border-[#cbd8c5] px-3 py-2 text-xs text-[#718446]">No pollination zones saved. Create a zone in Mission Planner and save the mission.</p> : pollinationZones.map((zone, index) => {
                  const completion = Math.round(zoneCompletion(index));
                  const complete = completion >= 100;
                  return <div key={zone.id} className="flex items-center justify-between rounded-lg border border-[#d2ddc8] bg-white px-3 py-2 text-xs"><span className={complete ? 'font-semibold text-[#15803d]' : 'text-[#55705c]'}>{complete ? 'Complete • ' : ''}{zone.name}</span><span className={complete ? 'font-bold text-[#15803d]' : 'font-semibold text-[#9a7130]'}>{completion}%</span></div>;
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_12px_30px_rgba(24,61,45,0.06)]"><CardHeader><CardTitle className="text-[#183d2d]">Flight conditions</CardTitle></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-[#e8f1e2] p-4"><div className="flex items-center gap-2 text-[#557a45]"><Wind className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.14em]">Wind</span></div><p className="mt-2 text-2xl font-bold text-[#183d2d]">Safe window</p><p className="mt-1 text-xs text-[#718446]">Monitor gusts before the next pass.</p></div><div className="rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-4"><div className="flex items-center gap-2 text-[#557a45]"><CloudRain className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.14em]">Weather</span></div><p className="mt-2 text-sm font-bold text-[#183d2d]">No rain detected</p><p className="mt-1 text-xs text-[#718446]">Pollen spread should pause during rain.</p></div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setPollenState(false)} disabled={!paused} className="flex items-center justify-center gap-2 rounded-xl bg-[#557a45] px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"><Play className="h-4 w-4" />Start pollen</button><button type="button" onClick={() => setPollenState(true)} disabled={paused} className="flex items-center justify-center gap-2 rounded-xl border border-[#b8cbae] bg-white px-3 py-3 text-sm font-semibold text-[#355340] disabled:opacity-50"><Pause className="h-4 w-4" />Stop pollen</button></div><p className="text-[10px] text-[#718446]">{pollenRunning ? 'Pollen pump: running' : 'Pollen pump: stopped'} • Drone remains active • Manual control applies anywhere</p></CardContent></Card>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
