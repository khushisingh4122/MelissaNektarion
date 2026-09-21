import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { AlertTriangle, Bug, Droplets, Leaf, MapPinned, ShieldCheck, Sprout, Thermometer } from 'lucide-react';
import { MapContainer, Polygon, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';
import { fieldZones } from '../data/sampleData.js';

const fallback = { farm_health: 84, healthy_fields: 3, attention_fields: 1, pest_alerts: 3, fields_data: [], crop_health: [], pest_detection: [], sensors: [], insights: [] };

const fieldDetails = {
  north: { crop: 'Apple', health: 92, pestRisk: 'Low', pests: 'No active detections', recommendation: 'Maintain current irrigation and continue weekly monitoring.' },
  east: { crop: 'Mango', health: 74, pestRisk: 'Medium', pests: 'Aphids detected', recommendation: 'Inspect the east rows and schedule a focused camera survey.' },
  south: { crop: 'Sunflower', health: 88, pestRisk: 'Low', pests: 'Whiteflies monitored', recommendation: 'Keep the field under routine observation.' },
  west: { crop: 'Apple', health: 61, pestRisk: 'High', pests: 'Leaf blight risk', recommendation: 'Review recent imagery and prioritize an agronomist inspection.' },
};

function FieldMapViewport({ boundary }) {
  const map = useMap();

  React.useEffect(() => {
    map.fitBounds(boundary, { padding: [24, 24] });
  }, [boundary, map]);

  return null;
}

export default function FarmIntelligence() {
  const [data, setData] = useState(fallback);
  const [selectedFieldId, setSelectedFieldId] = useState('north');
  const [mapStyle, setMapStyle] = useState('satellite');
  const selectedField = fieldZones.find((field) => field.id === selectedFieldId) || fieldZones[0];
  const selectedBoundary = selectedField.geometry.coordinates[0].map(([longitude, latitude]) => [latitude, longitude]);
  const selectedDetails = fieldDetails[selectedField.id];

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
        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2 text-[#183d2d]"><MapPinned className="h-5 w-5 text-[#557a45]" />Field map</CardTitle><select value={selectedFieldId} onChange={(event) => setSelectedFieldId(event.target.value)} className="rounded-xl border border-[#cbd8c5] bg-white px-3 py-2 text-xs font-semibold text-[#355340]">{fieldZones.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}</select></CardHeader><CardContent><div className="mb-3 flex justify-end"><div className="flex overflow-hidden rounded-lg border border-[#cbd8c5] bg-white text-[10px] font-semibold"><button type="button" onClick={() => setMapStyle('street')} className={`px-3 py-2 ${mapStyle === 'street' ? 'bg-[#dcefd5] text-[#355340]' : 'text-[#718446]'}`}>Map</button><button type="button" onClick={() => setMapStyle('satellite')} className={`border-l border-[#cbd8c5] px-3 py-2 ${mapStyle === 'satellite' ? 'bg-[#dcefd5] text-[#355340]' : 'text-[#718446]'}`}>Satellite</button></div></div><div className="h-[330px] overflow-hidden rounded-2xl border border-[#cbd8c5]"><MapContainer key={selectedField.id} center={selectedBoundary[0]} zoom={16} style={{ height: '100%', width: '100%' }}><FieldMapViewport boundary={selectedBoundary} /><TileLayer attribution={mapStyle === 'satellite' ? 'Imagery &copy; Esri' : '&copy; OpenStreetMap contributors'} url={mapStyle === 'satellite' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} maxZoom={19} /><Polygon positions={selectedBoundary} pathOptions={{ color: '#16a34a', weight: 3, fillColor: '#86efac', fillOpacity: 0.24 }}><Popup>{selectedField.name}</Popup></Polygon></MapContainer></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl bg-[#e8f1e2] p-3"><p className="text-[10px] text-[#718446]">Health</p><strong className="text-lg text-[#183d2d]">{selectedDetails.health}%</strong></div><div className="rounded-xl bg-[#eef4e9] p-3"><p className="text-[10px] text-[#718446]">Crop</p><strong className="text-sm text-[#183d2d]">{selectedDetails.crop}</strong></div><div className="rounded-xl bg-[#f5ecd8] p-3"><p className="text-[10px] text-[#718446]">Pest risk</p><strong className="text-sm text-[#9a7130]">{selectedDetails.pestRisk}</strong></div><div className="rounded-xl bg-[#f7e5df] p-3"><p className="text-[10px] text-[#718446]">Finding</p><strong className="text-xs text-[#7f443c]">{selectedDetails.pests}</strong></div></div></CardContent></Card>
        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="text-[#183d2d]">{selectedField.name} analysis</CardTitle></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-[#e8f1e2] p-4"><ShieldCheck className="h-5 w-5 text-[#557a45]" /><p className="mt-2 text-sm font-semibold text-[#183d2d]">Field health is {selectedDetails.health}%</p><p className="mt-1 text-xs leading-5 text-[#55705c]">{selectedDetails.recommendation}</p></div><div className="rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-4"><p className="text-[10px] uppercase tracking-[0.16em] text-[#718446]">Pest status</p><p className="mt-1 text-lg font-bold text-[#183d2d]">{selectedDetails.pestRisk}</p><p className="mt-1 text-xs text-[#55705c]">{selectedDetails.pests}</p></div>{(data.insights.length ? data.insights : fallback.insights).map((insight) => <div key={insight.title} className="rounded-xl bg-[#e8f1e2] p-4"><p className="text-sm font-semibold text-[#183d2d]">{insight.title}</p><p className="mt-1 text-xs leading-5 text-[#55705c]">{insight.description}</p></div>)}</CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2"><Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#183d2d]"><Bug className="h-5 w-5 text-[#9e5146]" />Pest detection</CardTitle></CardHeader><CardContent className="space-y-2">{data.pest_detection.length ? data.pest_detection.map((pest) => <div key={`${pest.pest}-${pest.confidence}`} className="rounded-xl bg-[#f7e5df] p-3 text-xs text-[#7f443c]"><strong>{pest.pest}</strong> • {pest.field}<span className="float-right">{Math.round(pest.confidence)}% confidence</span></div>) : <p className="text-sm text-[#718446]">No recent pest detections.</p>}</CardContent></Card><Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#183d2d]"><Thermometer className="h-5 w-5 text-[#557a45]" />Sensor snapshot</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{[['Soil moisture', '68%', Droplets], ['Temperature', '24°C', Thermometer], ['Crop status', 'Healthy', Leaf], ['Pest risk', 'Low', ShieldCheck]].map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-[#d2ddc8] bg-[#eef4e9] p-3"><Icon className="h-4 w-4 text-[#557a45]" /><p className="mt-2 text-[10px] text-[#718446]">{label}</p><strong className="text-sm text-[#183d2d]">{value}</strong></div>)}</CardContent></Card></div>
    </div>
  </DashboardLayout>;
}
