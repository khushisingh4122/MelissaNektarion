import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { AlertTriangle, Bug, Droplets, Leaf, MapPinned, ShieldCheck, Sprout, Thermometer } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';

const fallback = { farm_health: 84, healthy_fields: 3, attention_fields: 1, pest_alerts: 3, fields_data: [], crop_health: [], pest_detection: [], sensors: [], insights: [] };

export default function FarmIntelligence() {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    apiServerClient.fetch('/farm-intelligence/')
      .then((response) => response.ok ? response.json() : null)
      .then((value) => value && setData(value))
      .catch(() => undefined);
  }, []);

  return <DashboardLayout>
    <Helmet><title>Farm Intelligence - Mellisanectorian</title></Helmet>
    <div className="space-y-5">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718446]">Farm intelligence</p><h1 className="mt-1 text-3xl font-bold text-[#183d2d]">Know every field better.</h1><p className="mt-1 text-sm text-[#55705c]">Crop health, pest risk, sensors, and field history in one view.</p></div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[Leaf, 'Farm health', `${data.farm_health}%`], [Sprout, 'Healthy fields', data.healthy_fields], [AlertTriangle, 'Attention needed', data.attention_fields], [Bug, 'Pest alerts', data.pest_alerts]].map(([Icon, label, value]) => <Card key={label} className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardContent className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcefd5] text-[#557a45]"><Icon className="h-5 w-5" /></div><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#718446]">{label}</p><p className="mt-1 text-2xl font-bold text-[#183d2d]">{value}</p></div></CardContent></Card>)}</div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#183d2d]"><MapPinned className="h-5 w-5 text-[#557a45]" />Field map</CardTitle></CardHeader><CardContent><div className="relative h-[330px] overflow-hidden rounded-2xl border border-[#cbd8c5] bg-[linear-gradient(180deg,rgba(18,63,45,0.08),rgba(18,63,45,0.22)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=85')] bg-cover bg-center">{data.fields_data.map((field, index) => <div key={field.id} className={`absolute rounded-full px-3 py-2 text-[10px] font-semibold shadow ${field.status === 'attention' ? 'bg-[#f5ecd8] text-[#9a7130]' : 'bg-[#dcefd5] text-[#355340]'}`} style={{ left: `${20 + index * 28}%`, top: `${28 + (index % 2) * 28}%` }}>{field.name} • {field.health}%</div>)}</div></CardContent></Card>
        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="text-[#183d2d]">AI farm insight</CardTitle></CardHeader><CardContent className="space-y-3">{(data.insights.length ? data.insights : fallback.insights).map((insight) => <div key={insight.title} className="rounded-xl bg-[#e8f1e2] p-4"><ShieldCheck className="h-5 w-5 text-[#557a45]" /><p className="mt-2 text-sm font-semibold text-[#183d2d]">{insight.title}</p><p className="mt-1 text-xs leading-5 text-[#55705c]">{insight.description}</p><p className="mt-3 text-xs font-semibold text-[#557a45]">{insight.recommendation}</p></div>)}</CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2"><Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#183d2d]"><Bug className="h-5 w-5 text-[#9e5146]" />Pest detection</CardTitle></CardHeader><CardContent className="space-y-2">{data.pest_detection.length ? data.pest_detection.map((pest) => <div key={`${pest.pest}-${pest.confidence}`} className="rounded-xl bg-[#f7e5df] p-3 text-xs text-[#7f443c]"><strong>{pest.pest}</strong> • {pest.field}<span className="float-right">{Math.round(pest.confidence)}% confidence</span></div>) : <p className="text-sm text-[#718446]">No recent pest detections.</p>}</CardContent></Card><Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#183d2d]"><Thermometer className="h-5 w-5 text-[#557a45]" />Sensor snapshot</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{[['Soil moisture', '68%', Droplets], ['Temperature', '24°C', Thermometer], ['Crop status', 'Healthy', Leaf], ['Pest risk', 'Low', ShieldCheck]].map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-3"><Icon className="h-4 w-4 text-[#557a45]" /><p className="mt-2 text-[10px] text-[#718446]">{label}</p><strong className="text-sm text-[#183d2d]">{value}</strong></div>)}</CardContent></Card></div>
    </div>
  </DashboardLayout>;
}
