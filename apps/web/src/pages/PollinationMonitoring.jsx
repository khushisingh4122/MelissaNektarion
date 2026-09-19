import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Button } from '../components/ui/button';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { Check, CheckCircle2, Clock3, Crosshair, Leaf, MapPin, Radio, RotateCcw } from 'lucide-react';

const INITIAL_FIELDS = [
  { id: 'field-a', name: 'Field A', crop: 'Apple orchard', progress: 100, status: 'complete', color: 'bg-emerald-500' },
  { id: 'field-b', name: 'Field B', crop: 'Apple orchard', progress: 68, status: 'active', color: 'bg-amber-400' },
  { id: 'field-c', name: 'Field C', crop: 'Mango block', progress: 42, status: 'active', color: 'bg-amber-400' },
  { id: 'field-d', name: 'Field D', crop: 'Vegetable rows', progress: 0, status: 'pending', color: 'bg-slate-300' },
  { id: 'field-e', name: 'Field E', crop: 'Apple orchard', progress: 100, status: 'complete', color: 'bg-emerald-500' },
  { id: 'field-f', name: 'Field F', crop: 'Mango block', progress: 0, status: 'pending', color: 'bg-slate-300' },
];

const statusMeta = {
  complete: { label: 'Pollination complete', icon: CheckCircle2 },
  active: { label: 'In progress', icon: Clock3 },
  pending: { label: 'Not started', icon: Clock3 },
};

const PollinationMonitoring = () => {
  const { t } = useTranslation();
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = useState('field-b');
  const selectedField = fields.find((field) => field.id === selectedFieldId) || fields[0];
  const completedCount = fields.filter((field) => field.status === 'complete').length;
  const overallProgress = Math.round(fields.reduce((total, field) => total + field.progress, 0) / fields.length);

  const completionLabel = useMemo(() => (
    overallProgress === 100 ? 'All field zones are complete' : `${completedCount} of ${fields.length} field zones completed`
  ), [completedCount, fields.length, overallProgress]);

  const markComplete = () => {
    setFields((current) => current.map((field) => field.id === selectedFieldId
      ? { ...field, progress: 100, status: 'complete' }
      : field));
  };

  const resetFields = () => setFields(INITIAL_FIELDS);

  return (
    <DashboardLayout>
      <Helmet><title>{`${t('nav.pollination')} - ${t('app.title')}`}</title></Helmet>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-[#173f30] px-6 py-7 text-white shadow-[0_24px_55px_rgba(24,61,45,0.18)] sm:px-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border-[22px] border-[#b7d68f]/20" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c8df9d]"><Leaf className="h-4 w-4" /> Field pollination</div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Know exactly where pollination stands.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Track completed zones, continue active routes, and mark each part of the farm when the pass is done.</p>
            </div>
            <div className="min-w-[190px] rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-end justify-between"><span className="text-xs text-white/65">Farm completion</span><span className="text-3xl font-bold text-[#d7efb1]">{overallProgress}%</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#c8df9d] transition-all" style={{ width: `${overallProgress}%` }} /></div>
              <p className="mt-2 text-[11px] text-white/60">{completionLabel}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[24px] border border-[#cbd8c5] bg-[#f7faf4] p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718446]">Farm zones</p><h2 className="mt-1 text-xl font-bold text-[#183d2d]">Pollination coverage map</h2></div><div className="flex items-center gap-2 text-xs text-[#718446]"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> complete <span className="ml-2 h-2.5 w-2.5 rounded-full bg-amber-400" /> active</div></div>
            <div className="relative mt-5 grid grid-cols-3 gap-2 overflow-hidden rounded-2xl border border-[#cbd8c5] bg-[#dbe9d2] p-3 sm:gap-3 sm:p-5">
              <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(#8fac84_1px,transparent_1px),linear-gradient(90deg,#8fac84_1px,transparent_1px)] [background-size:28px_28px]" />
              {fields.map((field) => { const isSelected = field.id === selectedFieldId; const meta = statusMeta[field.status]; const StatusIcon = meta.icon; return <button key={field.id} type="button" onClick={() => setSelectedFieldId(field.id)} className={`relative min-h-[112px] rounded-2xl border-2 p-3 text-left transition sm:min-h-[135px] ${isSelected ? 'border-[#183d2d] shadow-lg' : 'border-white/70'} ${field.status === 'complete' ? 'bg-[#9bc98b]' : field.status === 'active' ? 'bg-[#f3cf76]' : 'bg-[#b9c9b3]'}`}><div className="flex items-start justify-between"><span className="text-sm font-bold text-[#183d2d]">{field.name}</span><StatusIcon className="h-4 w-4 text-[#355340]" /></div><p className="mt-2 text-[11px] text-[#355340]">{field.crop}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10"><div className={`h-full rounded-full ${field.color}`} style={{ width: `${field.progress}%` }} /></div><div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-[#355340]"><span>{field.progress}% done</span><span>{field.status === 'complete' ? 'Done' : field.status === 'active' ? 'Route live' : 'Queued'}</span></div></button>; })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d8e3d2] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-[#718446]"><Crosshair className="h-5 w-5" /><p className="text-xs font-semibold uppercase tracking-[0.18em]">Selected zone</p></div>
            <h2 className="mt-3 text-2xl font-bold text-[#183d2d]">{selectedField.name}</h2><p className="mt-1 text-sm text-[#718446]">{selectedField.crop}</p>
            <div className="mt-6 flex items-end gap-2"><span className="text-5xl font-bold text-[#1f5d3d]">{selectedField.progress}%</span><span className="pb-2 text-sm text-[#718446]">pollination complete</span></div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e8f1e2]"><div className={`h-full rounded-full transition-all ${selectedField.status === 'complete' ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${selectedField.progress}%` }} /></div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f5f8f2] p-3 text-sm text-[#55705c]"><Radio className="h-4 w-4 text-[#557a45]" /> {statusMeta[selectedField.status].label}</div>
            <div className="mt-5 flex flex-wrap gap-2"><Button type="button" onClick={markComplete} disabled={selectedField.status === 'complete'} className="gap-2"><Check className="h-4 w-4" /> Mark pollination done</Button><Button type="button" variant="outline" onClick={resetFields} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset demo zones</Button></div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[[CheckCircle2, 'Completed', fields.filter((field) => field.status === 'complete').length, 'emerald'], [Clock3, 'In progress', fields.filter((field) => field.status === 'active').length, 'amber'], [MapPin, 'Waiting', fields.filter((field) => field.status === 'pending').length, 'slate']].map(([Icon, label, value, tone]) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#d8e3d2] bg-white p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' : tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-5 w-5" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#718446]">{label}</p><p className="mt-1 text-xl font-bold text-[#183d2d]">{value} zones</p></div></div>)}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default PollinationMonitoring;
