import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useWebSocketSimulator } from '../hooks/useWebSocketSimulator.js';
import { droneData } from '../data/sampleData.js';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { apiServerClient } from '../lib/apiServerClient.js';
import { Battery, Camera, Gauge, MapPin, Navigation, Plane, Radio, ShieldCheck, Timer } from 'lucide-react';

const DroneMonitoring = () => {
  const { t } = useTranslation();
  const simulatedData = useWebSocketSimulator(droneData);
  const [telemetry, setTelemetry] = useState(simulatedData);

  useEffect(() => {
    let active = true;
    apiServerClient.fetch('/drones/1/telemetry')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data) setTelemetry(data); })
      .catch(() => undefined);
    return () => { active = false; };
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
                  <div className="relative h-[360px] overflow-hidden rounded-2xl border border-[#cbd8c5] bg-[linear-gradient(180deg,rgba(18,63,45,0.12),rgba(18,63,45,0.22)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85')] bg-cover bg-center">
                    <div className="absolute left-[48%] top-[42%] flex h-12 w-12 items-center justify-center rounded-full bg-[#1f5d3d] text-white shadow-lg"><Plane className="h-5 w-5" /></div>
                    <div className="absolute right-[24%] top-[28%] text-red-500"><span className="text-2xl">▲</span></div>
                    <div className="absolute bottom-3 left-3 flex gap-2 text-[10px] font-medium"><span className="rounded-full bg-[#f5f7f1] px-3 py-1.5 text-[#355340]">GPS locked</span><span className="rounded-full bg-[#f5f7f1] px-3 py-1.5 text-[#355340]">Route active</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="text-lg text-[#183d2d]">Flight telemetry</CardTitle></CardHeader><CardContent className="space-y-3">{[[Battery, 'Battery', `${telemetry?.battery ?? 72}%`], [Gauge, 'Speed', `${telemetry?.speed ?? 5.2} m/s`], [Navigation, 'Altitude', `${telemetry?.altitude ?? 12} m`], [MapPin, 'Location', telemetry?.location || 'Apple Orchard']].map(([Icon, label, value]) => <div key={label} className="flex items-center justify-between rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-3"><span className="flex items-center gap-2 text-xs text-[#55705c]"><Icon className="h-4 w-4 text-[#557a45]" />{label}</span><strong className="text-sm text-[#183d2d]">{value}</strong></div>)}</CardContent></Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[Radio, 'GPS', telemetry?.gps || 'Locked'], [Battery, 'Battery', `${telemetry?.battery ?? 72}%`], [Camera, 'Camera', telemetry?.camera || 'Online'], [ShieldCheck, 'Mission safety', 'Clear']].map(([Icon, label, value]) => <Card key={label} className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardContent className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcefd5] text-[#557a45]"><Icon className="h-5 w-5" /></div><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#718446]">{label}</p><p className="mt-1 text-sm font-bold text-[#183d2d]">{value}</p></div></CardContent></Card>)}</div>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg">{t('drone.recentCaptures')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {simulatedData.lastImages.map((image) => (
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