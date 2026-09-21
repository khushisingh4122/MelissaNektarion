import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { AlertCircle, BrainCircuit, CheckCircle2, FileImage, Leaf, Loader2, Sparkles, Upload } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';

export default function AIAnalysis() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [analysisFocus, setAnalysisFocus] = useState('complete');
  const [recentCaptures, setRecentCaptures] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('melissa_camera_captures') || '[]');
    } catch {
      return [];
    }
  });

  const analyzeFile = async (imageFile, focus = analysisFocus) => {
    if (!imageFile) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('analysis_focus', focus);
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

  useEffect(() => {
    let active = true;
    let capture;
    try {
      capture = JSON.parse(localStorage.getItem('melissa_latest_camera_capture') || 'null');
    } catch {
      capture = null;
    }
    if (!capture?.url) return undefined;

    fetch(capture.url)
      .then((response) => response.blob())
      .then((blob) => {
        if (!active) return;
        const imageFile = new File([blob], 'raspberry-pi-capture.jpg', { type: blob.type || 'image/jpeg' });
        setFile(imageFile);
        setPreviewUrl(URL.createObjectURL(blob));
        if (capture.analysis &&
          ['analyzed', 'analyzed_by_groq'].includes(capture.analysis.status) &&
          (capture.analysisFocus || 'complete') === analysisFocus) {
          setResult(capture.analysis);
          return null;
        }
        return analyzeFile(imageFile, analysisFocus);
      })
      .catch(() => {
        if (active) setError('The latest Raspberry Pi capture could not be loaded.');
      });

    return () => {
      active = false;
    };
  }, []);

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

  const selectCapture = async (capture) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch(capture.url);
      if (!response.ok) throw new Error('Captured image could not be loaded.');
      const blob = await response.blob();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const imageFile = new File([blob], `${capture.id}.jpg`, { type: blob.type || 'image/jpeg' });
      setFile(imageFile);
      setPreviewUrl(URL.createObjectURL(blob));
      if (capture.analysis &&
        ['analyzed', 'analyzed_by_groq'].includes(capture.analysis.status) &&
        (capture.analysisFocus || 'complete') === analysisFocus) {
        setResult(capture.analysis);
      } else {
        await analyzeFile(imageFile, analysisFocus);
      }
    } catch (captureError) {
      setError(captureError.message || 'Captured image could not be analyzed.');
    } finally {
      setLoading(false);
    }
  };

  const detections = result?.detections || (result?.disease ? [{ disease: result.disease, category: result.category, confidence: result.confidence, solution: result.solution, prevention: result.prevention, precautions: result.precautions }] : []);

  const analyze = async () => {
    analyzeFile(file, analysisFocus);
  };

  const saveFeedback = (value) => {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('melissa_ai_feedback') || '[]');
    } catch {
      history = [];
    }
    history.unshift({
      value,
      imageName: file?.name || 'camera-capture.jpg',
      result,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('melissa_ai_feedback', JSON.stringify(history.slice(0, 100)));
    setFeedback(value);
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

        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-[#cbd8c5] bg-[#f5f7f1] shadow-[0_12px_30px_rgba(24,61,45,0.06)]">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileImage className="h-5 w-5 text-emerald-700" />Image workspace</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 text-center">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
                {previewUrl ? <img src={previewUrl} alt="Selected crop" className="h-full max-h-[280px] w-full object-contain" /> : <><Upload className="mb-3 h-10 w-10 text-emerald-700" /><strong className="text-emerald-950">Upload a crop photograph</strong><span className="mt-2 text-xs text-gray-500">Use a clear, well-lit image of the leaf, fruit, or affected area</span></>}
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="text-xs font-semibold text-[#55705c]">What should AI check?
                  <select value={analysisFocus} onChange={(event) => setAnalysisFocus(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#cbd8c5] bg-white px-3 py-2 text-sm font-normal text-[#183d2d]">
                    <option value="complete">Complete crop health</option>
                    <option value="crop">Identify crop type</option>
                    <option value="disease">Check for disease</option>
                    <option value="pest">Check for pests</option>
                    <option value="prevention">Prevention and next steps</option>
                  </select>
                </label>
                <div className="rounded-xl bg-[#e8f1e2] px-3 py-2 text-xs text-[#55705c]">The same question can analyze uploads or drone captures.</div>
              </div>
              {recentCaptures.length > 0 && <div className="mt-4"><p className="text-xs font-semibold text-[#55705c]">Analyze a Drone Monitoring capture</p><div className="mt-2 flex gap-2 overflow-x-auto pb-1">{recentCaptures.slice(0, 6).map((capture) => <button type="button" key={capture.id} onClick={() => selectCapture(capture)} className="w-24 shrink-0 rounded-xl border border-[#cbd8c5] bg-white p-1 text-left"><img src={capture.url} alt={capture.location || 'Drone capture'} className="h-16 w-full rounded-lg object-cover" /><span className="mt-1 block truncate text-[10px] text-[#55705c]">{capture.timestamp}</span></button>)}</div></div>}
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500"><span className="truncate">{file ? file.name : 'No image selected'}</span><span>JPEG, PNG, WebP • 10 MB max</span></div>
              <button type="button" onClick={analyze} disabled={!file || loading} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Running AI analysis...' : 'Run AI analysis'}
              </button>
              {error && <p className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
            </CardContent>
          </Card>

          <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
            {result && (
              <Card className="border border-emerald-200 bg-emerald-50/60 shadow-[0_12px_30px_rgba(24,61,45,0.08)]">
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-700" />AI analysis result</CardTitle></CardHeader>
                <CardContent>
                  {result.status !== 'analyzed' && result.status !== 'analyzed_by_groq' && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><strong>Model status:</strong> {result.message || 'The analysis service returned no model result.'}<p className="mt-2 text-xs">Configure a trained model in the backend or enable the vision provider, then run the analysis again.</p></div>}
                  {(result.status === 'analyzed' || result.status === 'analyzed_by_groq') && <div className="mb-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-white/70 p-3"><p className="text-xs text-gray-500">Findings</p><p className="mt-1 text-2xl font-bold text-[#183d2d]">{detections.length}</p></div><div className="rounded-lg bg-white/70 p-3"><p className="text-xs text-gray-500">Model status</p><p className="mt-1 font-semibold text-emerald-700">Complete</p></div></div>}
                  {detections.length > 0 && <div className="space-y-3">{detections.map((detection, index) => <div key={`${detection.disease}-${index}`} className="rounded-lg border border-emerald-200 bg-white/70 p-4"><div><p className="font-semibold text-[#183d2d]">{detection.disease}</p>{detection.category && <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#718446]">{detection.category}</p>}</div><p className="mt-3 text-sm text-[#55705c]"><strong>Suggested solution:</strong> {detection.solution}</p>{detection.prevention && <p className="mt-2 text-sm text-[#55705c]"><strong>Prevention:</strong> {detection.prevention}</p>}{detection.precautions && <p className="mt-2 text-sm text-amber-900"><strong>Precautions:</strong> {detection.precautions}</p>}</div>)}</div>}
                  {result.ai_advice && <div className="mt-4 rounded-xl border border-[#b8d4a9] bg-[#e8f1e2] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#183d2d]">AI explanation and action plan</p><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#718446]">{result.advice_source}</span></div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#55705c]">{result.ai_advice}</p></div>}
                  {result.status === 'analyzed' && !detections.length && <p className="text-sm text-[#55705c]">No disease or pest detections were returned for this image.</p>}
                  <div className="mt-4 rounded-xl border border-[#d2ddc8] bg-white/70 p-4"><p className="text-xs font-semibold text-[#183d2d]">Help improve future analysis</p><p className="mt-1 text-xs text-[#718446]">Confirm whether this result matches the crop image. Feedback is saved for reviewed retraining data.</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => saveFeedback('confirmed')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${feedback === 'confirmed' ? 'bg-emerald-700 text-white' : 'bg-[#dcefd5] text-[#355340]'}`}>Looks correct</button><button type="button" onClick={() => saveFeedback('incorrect')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${feedback === 'incorrect' ? 'bg-amber-700 text-white' : 'bg-[#f5ecd8] text-[#9a7130]'}`}>Needs review</button></div></div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
