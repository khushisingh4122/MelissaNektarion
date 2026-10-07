import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  BellRing,
  Bug,
  CloudSun,
  Camera,
  CloudRain,
  Droplets,
  Flower2,
  Gauge,
  Leaf,
  MapPinned,
  Plane,
  Radio,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Thermometer,
  TrendingUp,
  UserRound,
  Wind,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent } from '../components/ui/card';
import { fieldZones, pollinationData } from '../data/sampleData.js';
import { fetchSevenDayForecast } from '../lib/fieldData.js';
import { apiServerClient } from '../lib/apiServerClient.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

const kpis = [
  ['Total Drones', '2', '1 Active • 1 Idle', Plane, 'text-emerald-700 bg-emerald-50'],
  ['Active Missions', '1', '1 In Progress • 0 Completed', Activity, 'text-emerald-700 bg-emerald-50'],
  ['Healthy Crops', '78%', '+12% vs last week', Leaf, 'text-emerald-700 bg-emerald-50'],
  ['Pollination', `${Math.round(pollinationData.beeActivity)}%`, 'Bee activity is stable', Flower2, 'text-amber-600 bg-amber-50'],
];

const fieldCards = [
  ['North Orchard', 'Healthy', '98% canopy health', Leaf, 'emerald'],
  ['Greenhouse 3', 'Watering', 'Moisture at 64%', Droplets, 'cyan'],
  ['Drone Route', 'Tracking', '7 km active patrol', Plane, 'amber'],
];

const activity = [
  ['Mission completed', 'Field 2 • Crop Monitoring', '2 hours ago', Leaf, 'text-emerald-700 bg-emerald-50'],
  ['Sensor data synced', 'Soil moisture • Field 1', '4 hours ago', Radio, 'text-emerald-700 bg-emerald-50'],
  ['Pest risk flagged', 'Aphids • Field 3', '6 hours ago', Bug, 'text-red-600 bg-red-50'],
  ['Drone status updated', 'Drone A1 • In Mission', '8 hours ago', Plane, 'text-emerald-700 bg-emerald-50'],
  ['Profile saved', 'Your farm profile updated', '1 day ago', UserRound, 'text-slate-500 bg-slate-100'],
];

const quickActions = [
  ['Plan New Mission', 'Create a new drone mission', '/mission-planning', Sprout],
  ['View Drones', 'Check status and fleet health', '/drone-monitoring', Plane],
  ['Check Crop Health', 'Open field diagnostics', '/crop-health', Leaf],
  ['View Pest Detection', 'Latest field risk analysis', '/ai-analysis', Bug],
  ['View Sensor Data', 'Track moisture and climate', '/sensor-data', Radio],
];

export default function DashboardOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const [selectedFieldId, setSelectedFieldId] = useState('north');
  const [forecast, setForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');
  const [pollinationProgress, setPollinationProgress] = useState(null);
  const [droneTelemetry, setDroneTelemetry] = useState(null);
  const [pollenPaused, setPollenPaused] = useState(() => localStorage.getItem('melissa_pollen_paused') === 'true');
  const selectedField = fieldZones.find((field) => field.id === selectedFieldId) || fieldZones[0];

  useEffect(() => {
    let active = true;
    const loadLiveOperations = async () => {
      const [pollinationResponse, telemetryResponse] = await Promise.all([
        apiServerClient.fetch('/pollination/mission/1'),
        apiServerClient.fetch('/drones/1/telemetry'),
      ]);
      if (!active) return;
      if (pollinationResponse.ok) setPollinationProgress(await pollinationResponse.json());
      if (telemetryResponse.ok) setDroneTelemetry(await telemetryResponse.json());
    };
    loadLiveOperations().catch(() => undefined);
    const interval = window.setInterval(() => { loadLiveOperations().catch(() => undefined); }, 5000);
    const syncPollenPause = () => setPollenPaused(localStorage.getItem('melissa_pollen_paused') === 'true');
    window.addEventListener('storage', syncPollenPause);
    return () => { active = false; window.clearInterval(interval); window.removeEventListener('storage', syncPollenPause); };
  }, []);

  useEffect(() => {
    let active = true;
    setWeatherLoading(true);
    setWeatherError('');
    fetchSevenDayForecast(selectedField)
      .then((value) => { if (active) setForecast(value); })
      .catch((error) => { if (active) setWeatherError(error.message); })
      .finally(() => { if (active) setWeatherLoading(false); });
    return () => { active = false; };
  }, [selectedField]);

  const todayForecast = forecast[0];
  const pollinationReady = todayForecast && todayForecast.wind <= 15 && todayForecast.rain < 35;
  const missionProgress = pollinationProgress?.progress ?? 0;
  const coveredAcres = pollinationProgress?.covered_acres ?? 0;
  const totalAcres = pollinationProgress?.total_acres ?? 10;
  const battery = droneTelemetry?.battery?.battery_remaining;
  const altitude = droneTelemetry?.altitude;
  const speed = droneTelemetry?.speed?.ground_speed;
  const pollenActive = Boolean(pollinationProgress?.pollen_active) && !pollenPaused;

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${t('nav.dashboard')} - ${t('app.title')}`}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl space-y-6 px-1 pb-4">
        <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <div
              className="relative h-[235px] overflow-hidden rounded-[22px] border border-[#cbd8c5] bg-cover bg-center p-4 shadow-[0_18px_45px_rgba(24,61,45,0.10)] sm:h-[255px] sm:p-5"
              style={{ backgroundImage: "url('/ai-images/IMG_0044.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#f5f7f1]/95 via-[#f5f7f1]/72 to-[#f5f7f1]/10" />
              <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718446]">{currentDate}</p>
                  <h1 className="mt-2 text-xl font-bold tracking-[-0.04em] text-[#183d2d] sm:text-2xl">Good morning, Niharika.</h1>
                  <p className="mt-2 max-w-xs text-xs text-[#355340]/80">Here&apos;s what&apos;s happening on your farm today.</p>
                </div>
                <div className="rounded-2xl border border-[#cbd8c5] bg-[#f5f7f1] px-3 py-2 text-right">
                  <Sun className="ml-auto h-4 w-4 text-[#b4843c]" />
                  <p className="mt-1 text-lg font-bold text-[#183d2d]">24°C</p>
                  <p className="text-[10px] text-[#718446]">Partly cloudy</p>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2 text-xs text-[#55705c]">
                  <span className="h-2 w-2 rounded-full bg-[#718446]" />
                  Apple Orchard Farm
                  <span className="text-[#9aa994]">•</span>
                  Roorkee, Uttarakhand
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => navigate('/mission-planning')} className="inline-flex items-center gap-2 rounded-xl bg-[#1f5d3d] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#184a31]">
                    View mission <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => navigate('/crop-health')} className="rounded-xl border border-[#b7cdb0] bg-[#f5f7f1] px-4 py-2.5 text-xs font-semibold text-[#355340]">Crop health</button>
                </div>
              </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {fieldCards.map(([title, status, detail, Icon, tone]) => {
                const tones = {
                  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-800',
                  cyan: 'border-cyan-100 bg-cyan-50 text-cyan-800',
                  amber: 'border-amber-100 bg-amber-50 text-amber-800',
                };
                return <div key={title} className={`min-w-0 rounded-2xl border p-3 ${tones[tone]}`}><div className="flex items-center justify-between gap-2"><Icon className="h-4 w-4 shrink-0" /><span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em]">{status}</span></div><p className="mt-3 truncate text-xs font-bold text-slate-800">{title}</p><p className="mt-1 truncate text-[10px] text-slate-500">{detail}</p></div>;
              })}
            </div>
          </div>

          <Card className="overflow-hidden border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_18px_45px_rgba(24,61,45,0.10)]">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718446]">Live field view</p>
                  <h2 className="mt-1 text-xl font-bold text-[#183d2d]">Farm overview</h2>
                </div>
                <span className="rounded-full bg-[#dcefd5] px-3 py-1 text-[10px] font-semibold text-[#557a45]">Drone A1 • In progress</span>
              </div>
              <div className="relative h-[320px] overflow-hidden rounded-[18px] border border-[#cbd8c5] bg-[#dce8d4] sm:h-[360px]">
                {!cameraUnavailable ? (
                  <img
                    src={`${API_BASE}/camera/stream`}
                    alt="Live Raspberry Pi farm camera"
                    className="h-full w-full object-cover"
                    onError={() => setCameraUnavailable(true)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-[#55705c]">
                    <Camera className="h-8 w-8 text-[#718446]" />
                    <p className="text-sm font-semibold text-[#183d2d]">Farm camera is offline</p>
                    <p className="text-xs">Connect the Raspberry Pi camera and start the backend to view live footage.</p>
                  </div>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-semibold text-white">
                  <span className={`h-2 w-2 rounded-full ${cameraUnavailable ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  {cameraUnavailable ? 'Camera offline' : 'Live farm footage'}
                </div>
                <button type="button" onClick={() => navigate('/drone-monitoring')} className="absolute bottom-3 right-3 rounded-xl bg-[#f5f7f1] px-3 py-2 text-[10px] font-semibold text-[#355340] shadow-sm">Open full monitoring</button>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(([title, value, note, Icon, colors], index) => (
            <div key={title} className={`farm-card animated-panel delay-${index + 1} rounded-[22px] p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-2xl p-3 ${colors}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-emerald-800/50" />
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-emerald-800/70">{title}</p>
              <p className="mt-2 text-3xl font-black text-emerald-950">{value}</p>
              <p className="mt-1 text-xs text-emerald-900/60">{note}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_14px_32px_rgba(17,71,35,0.07)]">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#718446]">Current mission</p>
                  <h2 className="mt-1 text-lg font-bold text-[#183d2d]">Apple Orchard Pollination</h2>
                </div>
                  <span className="rounded-full bg-[#dcefd5] px-2.5 py-1 text-[10px] font-semibold text-[#557a45]">{pollinationProgress?.status || 'Connecting'}</span>
              </div>
              <p className="text-xs text-[#55705c]">{selectedField.name} • Automated pollination route</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-[#dce8d4]"><div className="h-2 rounded-full bg-[#4f8a5c]" style={{ width: `${missionProgress}%` }} /></div>
                <span className="text-xs font-semibold text-[#557a45]">{missionProgress}%</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  [`${coveredAcres} / ${totalAcres}`, 'Acres covered'],
                  [pollenActive ? 'Dispensing' : pollenPaused ? 'Paused' : 'Standby', 'Pollen mechanism'],
                  [battery == null ? '—' : `${battery}%`, 'Battery'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-3">
                    <p className="text-sm font-bold text-[#183d2d]">{value}</p>
                    <p className="mt-1 text-[10px] text-[#718446]">{label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/mission-planning')} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#dcefd5] px-3 py-2 text-xs font-semibold text-[#355340]">View mission <ArrowRight className="h-3.5 w-3.5" /></button>
            </CardContent>
          </Card>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_14px_32px_rgba(17,71,35,0.07)]">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#718446]">Live drone status</p>
                  <h2 className="mt-1 text-lg font-bold text-[#183d2d]">Drone A1</h2>
                </div>
                <span className="rounded-full bg-[#dcefd5] px-2.5 py-1 text-[10px] font-semibold text-[#557a45]">Active</span>
              </div>
              <div className="space-y-3 text-xs text-[#55705c]">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><BatteryCharging className="h-4 w-4 text-[#557a45]" /> Battery</span><strong>{battery == null ? '—' : `${battery}%`}</strong></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Plane className="h-4 w-4 text-[#557a45]" /> Altitude</span><strong>{altitude == null ? '—' : `${altitude} m`}</strong></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#557a45]" /> Speed</span><strong>{speed == null ? '—' : `${speed} m/s`}</strong></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Sprout className="h-4 w-4 text-[#557a45]" /> Pollen</span><strong className="text-[#557a45]">{pollenActive ? 'ON' : pollenPaused ? 'PAUSED' : 'STANDBY'}</strong></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_14px_32px_rgba(17,71,35,0.07)]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#718446]">Pollination weather window</p>
                <h2 className="mt-1 text-lg font-bold text-[#183d2d]">{weatherLoading ? 'Loading field forecast...' : pollinationReady ? 'Good conditions for pollination' : 'Wait for a safer weather window'}</h2>
                <p className="mt-1 text-xs text-[#55705c]">{selectedField.name} • live seven-day forecast</p>
              </div>
              <span className={`rounded-full px-3 py-2 text-xs font-semibold ${pollinationReady ? 'bg-[#dcefd5] text-[#557a45]' : 'bg-[#f5ecd8] text-[#9a7130]'}`}>
                {pollinationReady ? 'Recommended' : 'Not recommended'}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <select value={selectedFieldId} onChange={(event) => setSelectedFieldId(event.target.value)} className="rounded-xl border border-[#cbd8c5] bg-white px-3 py-2 text-xs font-semibold text-[#355340]">{fieldZones.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}</select>
              <div className="flex items-center gap-2 text-xs text-[#55705c]"><CloudSun className="h-4 w-4 text-[#b4843c]" />{todayForecast ? `${todayForecast.high}° / ${todayForecast.low}°C` : 'No forecast'}</div>
            </div>
            {weatherError ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{weatherError}</p> : <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{forecast.slice(0, 4).map((day) => <div key={day.date} className="rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-3"><p className="text-[10px] font-semibold text-[#718446]">{new Date(`${day.date}T12:00:00`).toLocaleDateString('en', { weekday: 'short' })}</p><p className="mt-2 text-sm font-bold text-[#183d2d]">{day.high}° / {day.low}°</p><p className="mt-1 text-[10px] text-[#55705c]">Rain {day.rain}% • Wind {Math.round(day.wind)}</p></div>)}</div>}
            {!weatherLoading && !weatherError && forecast.length > 4 && <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-7">{forecast.slice(4).map((day) => <div key={day.date} className="rounded-xl border border-[#d2ddc8] bg-white p-2 text-center"><p className="text-[10px] text-[#718446]">{new Date(`${day.date}T12:00:00`).toLocaleDateString('en', { weekday: 'short' })}</p><p className="mt-1 text-xs font-bold text-[#183d2d]">{day.high}°</p><p className="text-[10px] text-[#55705c]">{day.rain}% rain</p></div>)}</div>}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_14px_32px_rgba(17,71,35,0.07)]">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[#183d2d]">Crop health</h2><Target className="h-4 w-4 text-[#557a45]" /></div>
              <div className="flex items-center gap-3"><div className="flex h-20 w-20 items-center justify-center rounded-full border-[9px] border-[#4fbd83] text-lg font-black text-[#183d2d]">78%</div><div className="space-y-1 text-[10px] text-[#55705c]"><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#4fbd83]" />Healthy 78%</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#d5a64f]" />Moderate 15%</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#d85b55]" />Critical 7%</p></div></div>
            </CardContent>
          </Card>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_14px_32px_rgba(17,71,35,0.07)]">
            <CardContent className="p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-[#183d2d]">AI farm insight</h2><span className="text-[10px] text-[#718446]">View all →</span></div><div className="h-20 rounded-xl bg-[url('https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=500&q=80')] bg-cover bg-center" /><p className="mt-3 text-[11px] leading-4 text-[#55705c]">Field 2 shows signs of water stress based on recent sensor readings.</p><button onClick={() => navigate('/crop-health')} className="mt-3 rounded-lg bg-[#dcefd5] px-3 py-1.5 text-[10px] font-semibold text-[#355340]">View analysis →</button></CardContent>
          </Card>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_14px_32px_rgba(17,71,35,0.07)]">
            <CardContent className="p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-[#183d2d]">Important alerts</h2><BellRing className="h-4 w-4 text-[#557a45]" /></div><div className="space-y-2 text-[10px] text-[#55705c]"><p className="rounded-lg bg-[#f7e5df] p-2 text-[#9e5146]">Aphids detected • Field 3</p><p className="rounded-lg bg-[#f5ecd8] p-2 text-[#9a7130]">Drone battery below 25%</p><p className="rounded-lg bg-[#dcefd5] p-2 text-[#557a45]">Mission completed • Field 1</p></div></CardContent>
          </Card>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_14px_32px_rgba(17,71,35,0.07)]">
            <CardContent className="p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-[#183d2d]">Sensor snapshot</h2><Gauge className="h-4 w-4 text-[#557a45]" /></div><div className="space-y-2 text-[10px] text-[#55705c]"><div className="flex justify-between"><span>Soil moisture</span><strong>32%</strong></div><div className="flex justify-between"><span>Temperature</span><strong>24°C</strong></div><div className="flex justify-between"><span>Humidity</span><strong>68%</strong></div><div className="flex justify-between"><span>Light</span><strong>845 lux</strong></div></div><button onClick={() => navigate('/sensor-data')} className="mt-4 rounded-lg bg-[#dcefd5] px-3 py-1.5 text-[10px] font-semibold text-[#355340]">View sensor data →</button></CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-[#f5f7f1] shadow-[0_20px_50px_rgba(17,71,35,0.08)]">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700">Smart actions</p>
                <h2 className="text-xl font-bold text-emerald-950">Quick access</h2>
              </div>
              <MapPinned className="h-5 w-5 text-emerald-700" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {quickActions.map(([title, text, path, Icon]) => (
                <button
                  key={title}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-3 rounded-[20px] border border-emerald-200 bg-white/70 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="block text-sm font-semibold text-emerald-950">{title}</p>
                    <small className="mt-1 block truncate text-[10px] text-emerald-800/70">{text}</small>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
