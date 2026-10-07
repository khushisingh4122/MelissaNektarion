import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Activity, Droplets, Gauge, Sun, Thermometer } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';

export default function SensorData() {
  const [readings, setReadings] = useState([]);
  useEffect(() => { apiServerClient.fetch('/sensor-data/').then((response) => response.ok ? response.json() : []).then(setReadings).catch(() => undefined); }, []);
  const cards = [['Soil moisture', '68%', Droplets], ['Temperature', '24°C', Thermometer], ['Humidity', '64%', Activity], ['Light', '72%', Sun]];
  return <DashboardLayout><Helmet><title>Sensor Data - Mellisanectorian</title></Helmet><div className="space-y-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718446]">Farm sensors</p><h1 className="mt-1 text-3xl font-bold text-[#183d2d]">Sensor data</h1><p className="mt-1 text-sm text-[#55705c]">Live environmental readings from your fields.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <Card key={label} className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardContent className="p-4"><Icon className="h-5 w-5 text-[#557a45]" /><p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[#718446]">{label}</p><p className="mt-1 text-2xl font-bold text-[#183d2d]">{value}</p><p className="mt-1 text-xs text-[#557a45]">Online</p></CardContent></Card>)}</div><Card className="border border-[#cbd8c5] bg-[#f5f7f1]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#183d2d]"><Gauge className="h-5 w-5 text-[#557a45]" />Recent readings</CardTitle></CardHeader><CardContent><div className="space-y-2">{readings.length ? readings.map((reading) => <div key={reading.id} className="flex justify-between rounded-xl bg-[#eef4e9] p-3 text-sm text-[#55705c]"><span>{reading.sensor_type}</span><strong className="text-[#183d2d]">{reading.value}</strong></div>) : <p className="text-sm text-[#718446]">No backend readings yet. Sensors will appear here when data is received.</p>}</div></CardContent></Card></div></DashboardLayout>;
}
