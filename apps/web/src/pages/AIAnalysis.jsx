import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { AlertCircle, BrainCircuit, CheckCircle2, FileImage, Leaf, Loader2, ScanSearch, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';

export default function AIAnalysis() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : '');
    setResult(null);
    setError('');
  };

  const detections = result?.detections || (result?.disease ? [{ disease: result.disease, confidence: result.confidence, solution: result.solution }] : []);
  const highestConfidence = detections.length ? Math.max(...detections.map((item) => Number(item.confidence) || 0)) : 0;

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiServerClient.fetch('/pest-detection/analyze-image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Analysis failed.');
      setResult(data);
    } catch (analysisError) {
      setError(analysisError.message || 'Could not connect to the analysis service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Helmet><title>AI Insights - Mellisanectorian</title></Helmet>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-[#183d2d] p-6 text-white shadow-[0_18px_45px_rgba(24,61,45,0.2)] sm:p-8">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[#c8df9d]"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-semibold uppercase tracking-[0.24em]">Field intelligence</span></div>
              <div className="flex items-center gap-3"><BrainCircuit className="h-9 w-9 text-[#c8df9d]" /><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Insights</h1></div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Turn a field photograph into a clear crop-health signal. Review possible disease or pest findings before deciding what to do next.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-[#e8f1e2]"><Leaf className="h-4 w-4 text-[#c8df9d]" />Multi-crop analysis</div>
          </div>
        </section>

        <div className="grid gap-2 sm:grid-cols-3">
          {[['01', 'Upload', 'Choose a clear field image'], ['02', 'Analyze', 'Run the trained vision model'], ['03', 'Act', 'Review findings and guidance']].map(([number, title, description], index) => <div key={number} className={`rounded-2xl border p-3 ${index === 0 ? 'border-[#b8d4a9] bg-[#e8f1e2]' : 'border-[#d8e3d2] bg-[#f5f7f1]'}`}><span className="text-[10px] font-bold tracking-[0.16em] text-[#718446]">{number}</span><p className="mt-1 text-sm font-semibold text-[#183d2d]">{title}</p><p className="mt-1 text-xs text-[#718446]">{description}</p></div>)}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_12px_30px_rgba(24,61,45,0.06)]">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileImage className="h-5 w-5 text-emerald-700" />Image workspace</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 text-center">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
                {previewUrl ? <img src={previewUrl} alt="Selected crop" className="h-full max-h-[280px] w-full object-contain" /> : <><Upload className="mb-3 h-10 w-10 text-emerald-700" /><strong className="text-emerald-950">Upload a crop photograph</strong><span className="mt-2 text-xs text-gray-500">Use a clear, well-lit image of the leaf, fruit, or affected area</span></>}
              </label>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500"><span className="truncate">{file ? file.name : 'No image selected'}</span><span>JPEG, PNG, WebP • 10 MB max</span></div>
              <button type="button" onClick={analyze} disabled={!file || loading} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Running AI analysis...' : 'Run AI analysis'}
              </button>
              {error && <p className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
            </CardContent>
          </Card>

          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_12px_30px_rgba(24,61,45,0.06)]">
            <CardHeader><CardTitle className="flex items-center gap-2"><ScanSearch className="h-5 w-5 text-[#557a45]" />Analysis lens</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm text-[#55705c]">
              <div className="flex gap-3 rounded-lg bg-[#e8f1e2] p-3"><ScanSearch className="h-5 w-5 shrink-0 text-emerald-700" /><span>Possible disease or pest class with model confidence.</span></div>
              <div className="flex gap-3 rounded-lg bg-[#e8f1e2] p-3"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" /><span>A practical recommendation for inspection and treatment planning.</span></div>
              <p className="pt-2 text-xs">Results are decision support, not a laboratory diagnosis. Confirm serious disease with an agronomist before applying chemicals.</p>
            </CardContent>
          </Card>
        </div>

        {result && (
          <Card className="border border-emerald-200 bg-emerald-50/60 shadow-[0_12px_30px_rgba(24,61,45,0.08)]">
            <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-700" />AI analysis result</CardTitle></CardHeader>
            <CardContent>
              {result.status !== 'analyzed' && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><strong>Model status:</strong> {result.message}</div>}
              {result.status === 'analyzed' && <div className="mb-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-white/70 p-3"><p className="text-xs text-gray-500">Findings</p><p className="mt-1 text-2xl font-bold text-[#183d2d]">{detections.length}</p></div><div className="rounded-lg bg-white/70 p-3"><p className="text-xs text-gray-500">Highest confidence</p><p className="mt-1 text-2xl font-bold text-[#183d2d]">{highestConfidence}%</p></div><div className="rounded-lg bg-white/70 p-3"><p className="text-xs text-gray-500">Model status</p><p className="mt-1 font-semibold text-emerald-700">Complete</p></div></div>}
              {detections.length > 0 && <div className="space-y-3">{detections.map((detection, index) => <div key={`${detection.disease}-${index}`} className="rounded-lg border border-emerald-200 bg-white/70 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-[#183d2d]">{detection.disease}</p><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{detection.confidence}% confidence</span></div><p className="mt-2 text-sm text-[#55705c]"><strong>Suggested next step:</strong> {detection.solution}</p></div>)}</div>}
              {result.ai_advice && <div className="mt-4 rounded-xl border border-[#b8d4a9] bg-[#e8f1e2] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#183d2d]">AI explanation and action plan</p><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#718446]">{result.advice_source}</span></div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#55705c]">{result.ai_advice}</p></div>}
              {result.status === 'analyzed' && !detections.length && <p className="text-sm text-[#55705c]">No disease or pest detections were returned for this image.</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
