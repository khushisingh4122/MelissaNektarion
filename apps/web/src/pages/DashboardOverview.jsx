import React from 'react';
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
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent } from '../components/ui/card';
import { pollinationData } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';

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
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

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
              <div className="relative h-[320px] overflow-hidden rounded-[18px] border border-[#cbd8c5] bg-[linear-gradient(180deg,_rgba(25,87,50,0.08),_rgba(25,87,50,0.18)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=85')] bg-cover bg-center sm:h-[360px]">
                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1f5d3d] text-white shadow-lg"><Plane className="h-5 w-5" /></div>
                <div className="absolute right-[22%] top-[28%] text-red-500"><AlertTriangle className="h-6 w-6 fill-current" /></div>
                <div className="absolute bottom-3 left-3 rounded-full bg-[#f5f7f1] px-3 py-1.5 text-[10px] font-medium text-[#355340] shadow-sm">Drone active • Mission area • Alert</div>
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
                <span className="rounded-full bg-[#dcefd5] px-2.5 py-1 text-[10px] font-semibold text-[#557a45]">In progress</span>
              </div>
              <p className="text-xs text-[#55705c]">Field 2 • Automated pollination route</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-[#dce8d4]"><div className="h-2 w-[65%] rounded-full bg-[#4f8a5c]" /></div>
                <span className="text-xs font-semibold text-[#557a45]">65%</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  ['6.8 / 10', 'Acres covered'],
                  ['Dispensing', 'Pollen mechanism'],
                  ['72%', 'Battery'],
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
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><BatteryCharging className="h-4 w-4 text-[#557a45]" /> Battery</span><strong>72%</strong></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Plane className="h-4 w-4 text-[#557a45]" /> Altitude</span><strong>12 m</strong></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#557a45]" /> Speed</span><strong>5.2 m/s</strong></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Sprout className="h-4 w-4 text-[#557a45]" /> Pollen</span><strong className="text-[#557a45]">ON</strong></div>
              </div>
            </CardContent>
          </Card>
        </div>

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
