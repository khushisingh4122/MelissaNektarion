import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { cropHealthData } from "../data/sampleData.js";
import { apiServerClient } from "../lib/apiServerClient.js";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  FileImage,
  Leaf,
  Loader2,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

const CropHealthAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setUploadError("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      const response = await apiServerClient.fetch("/pest-detection/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Image analysis failed.");
      setAnalysis(data);
    } catch (error) {
      setUploadError(error.message || "Could not analyze this image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-[#173f30] px-6 py-7 text-white shadow-[0_24px_55px_rgba(24,61,45,0.18)] sm:px-8">
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full border-[22px] border-[#b7d68f]/20" />
          <div className="relative max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c8df9d]"><Sparkles className="h-4 w-4" /> AI field intelligence</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">See what your crops are telling you.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Upload a leaf or field image and turn visual symptoms into a clear next step for your farm team.</p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-[#cbd8c5] bg-[#f7faf4] p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718446]">New scan</p><h2 className="mt-2 text-xl font-bold text-[#183d2d]">Upload a crop image</h2><p className="mt-1 text-sm text-[#718446]">Best results come from a close, well-lit leaf photo.</p></div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dcefd5] text-[#1f5d3d]"><ScanLine className="h-5 w-5" /></div>
            </div>
            <label className="mt-6 flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9d19d] bg-white px-5 text-center transition hover:border-[#6e9d58] hover:bg-[#f5faef]">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { setSelectedImage(event.target.files?.[0] || null); setAnalysis(null); setUploadError(""); }} />
              {selectedImage ? <FileImage className="h-9 w-9 text-[#1f5d3d]" /> : <Upload className="h-9 w-9 text-[#6e9d58]" />}
              <span className="mt-3 text-sm font-semibold text-[#183d2d]">{selectedImage ? selectedImage.name : "Choose an image to scan"}</span>
              <span className="mt-1 text-xs text-[#718446]">JPEG, PNG, or WebP · up to 10 MB</span>
            </label>
            <button type="button" onClick={analyzeImage} disabled={!selectedImage || isAnalyzing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f5d3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174b31] disabled:cursor-not-allowed disabled:opacity-45">
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}{isAnalyzing ? "Reading crop signals..." : "Run AI scan"}
            </button>
            {uploadError && <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{uploadError}</span></div>}
          </div>

          <div className="rounded-[24px] bg-[#e8f1e2] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[#557a45]"><ShieldCheck className="h-5 w-5" /><p className="text-xs font-semibold uppercase tracking-[0.18em]">Scan guide</p></div>
            <h2 className="mt-4 text-xl font-bold text-[#183d2d]">A better diagnosis starts with a better frame.</h2>
            <div className="mt-6 space-y-4 text-sm text-[#55705c]">
              {[[Leaf, "Show the symptom", "Fill most of the frame with the affected leaf or fruit."], [CircleAlert, "Avoid harsh shadows", "Use daylight and keep the camera steady."], [CheckCircle2, "Confirm before treating", "Use the result as guidance and ask an agronomist for serious cases."]].map(([Icon, title, copy]) => <div key={title} className="flex gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#557a45]" /><div><p className="font-semibold text-[#355340]">{title}</p><p className="mt-0.5 text-xs leading-5">{copy}</p></div></div>)}
            </div>
          </div>
        </section>

        {analysis && <section className="rounded-[24px] border border-[#b9d19d] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718446]">Latest scan</p><h2 className="mt-2 text-2xl font-bold text-[#183d2d]">{analysis.status === "analyzed" ? "Analysis complete" : "Model setup required"}</h2></div><CheckCircle2 className="h-6 w-6 text-[#5d9347]" /></div>{analysis.disease && <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#eef6e9] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-[#718446]">Primary signal</p><p className="mt-1 text-xl font-bold text-[#183d2d]">{analysis.disease}</p><p className="mt-1 text-sm text-[#55705c]">Suggested solution: {analysis.solution}</p></div><div className="rounded-xl bg-white px-4 py-3 text-center"><p className="text-2xl font-bold text-[#1f5d3d]">{analysis.confidence}%</p><p className="text-[10px] uppercase tracking-widest text-[#718446]">confidence</p></div></div>}{analysis.message && <p className="mt-4 text-sm text-amber-800">{analysis.message}</p>}{analysis.detections?.map((detection, index) => <div key={`${detection.disease}-${index}`} className="mt-3 flex items-center justify-between border-t border-[#e1eadb] pt-3 text-sm"><span className="font-semibold text-[#355340]">{detection.disease}</span><span className="text-[#718446]">{detection.confidence}% · {detection.solution}</span></div>)}</section>}

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#d8e3d2] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718446]">Watchlist</p><h2 className="mt-1 text-xl font-bold text-[#183d2d]">Known disease signals</h2></div><ArrowUpRight className="h-5 w-5 text-[#718446]" /></div><div className="mt-5 space-y-3">{cropHealthData.diseases.map((disease) => <div key={disease.name} className="flex items-center justify-between rounded-xl bg-[#f5f8f2] p-3"><div><p className="text-sm font-semibold text-[#355340]">{disease.name}</p><p className="mt-1 text-xs text-[#718446]">{disease.confidence}% confidence · {disease.affectedArea}% area</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${disease.severity === "High" ? "bg-red-100 text-red-700" : disease.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{disease.severity}</span></div>)}</div></div>
          <div className="rounded-[24px] border border-[#d8e3d2] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718446]">Field alerts</p><h2 className="mt-1 text-xl font-bold text-[#183d2d]">Pest watch</h2></div><CircleAlert className="h-5 w-5 text-amber-600" /></div><div className="mt-5 space-y-3">{cropHealthData.pests.map((pest) => <div key={pest.name} className="flex items-center justify-between rounded-xl bg-[#fff9ed] p-3"><div><p className="text-sm font-semibold text-[#6b4b1f]">{pest.name}</p><p className="mt-1 text-xs text-[#92734a]">{pest.location} · {pest.detected}</p></div><span className="rounded-full bg-[#f6e5b9] px-2.5 py-1 text-[10px] font-bold uppercase text-[#80571f]">{pest.severity}</span></div>)}</div></div>
        </section>
      </div>

    </DashboardLayout>
  );
};

export default CropHealthAnalysis;