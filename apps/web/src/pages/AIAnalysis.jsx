import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { AlertCircle, BrainCircuit, CheckCircle2, Loader2, Upload } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiServerClient } from '../lib/apiServerClient.js';

export default function AIAnalysis() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-emerald-700" />
            <h1 className="text-3xl font-bold text-[#183d2d]">AI Insights</h1>
          </div>
          <p className="mt-2 text-sm text-[#55705c]">Analyze crop images for disease and pest indicators across multiple crops.</p>
        </div>

        <Card className="border border-[#cbd8c5] bg-[#f5f7f1]">
          <CardHeader><CardTitle>Upload crop image</CardTitle></CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-12 text-center">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { setFile(event.target.files?.[0] || null); setResult(null); setError(''); }} />
              <Upload className="mb-3 h-8 w-8 text-emerald-700" />
              <strong className="text-emerald-950">{file ? file.name : 'Choose a crop image'}</strong>
              <span className="mt-1 text-xs text-gray-500">JPEG, PNG, or WebP up to 10 MB</span>
            </label>
            <button type="button" onClick={analyze} disabled={!file || loading} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Analyzing...' : 'Analyze image'}
            </button>
            {error && <p className="mt-4 flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <Card className="border border-emerald-200 bg-emerald-50/60">
            <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-700" />Analysis result</CardTitle></CardHeader>
            <CardContent>
              {result.status !== 'analyzed' && <p className="text-sm text-amber-800">{result.message}</p>}
              {result.disease && <div className="space-y-2 text-sm"><p>Detected: <strong>{result.disease}</strong></p><p>Confidence: <strong>{result.confidence}%</strong></p><p><strong>Recommendation:</strong> {result.solution}</p></div>}
              {result.detections?.length ? <div className="space-y-3">{result.detections.map((detection, index) => <div key={`${detection.disease}-${index}`} className="border-t border-emerald-200 pt-3 text-sm"><p><strong>{detection.disease}</strong> - {detection.confidence}% confidence</p><p className="mt-1">{detection.solution}</p></div>)}</div> : null}
              {result.status === 'analyzed' && !result.disease && !result.detections?.length && <p className="text-sm">No disease or pest detections were returned.</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
