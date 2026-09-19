import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { cropHealthData } from "../data/sampleData.js";
import { Doughnut } from "react-chartjs-2";
import { apiServerClient } from "../lib/apiServerClient.js";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";

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

  // ✅ PIE CHART (uses your data)
  const chartData = {
    labels: ["Healthy", "Stressed", "Diseased"],
    datasets: [
      {
        data: [
          cropHealthData.healthyArea,
          cropHealthData.stressedArea,
          cropHealthData.diseasedArea
        ],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"]
      }
    ]
  };

  return (
    <DashboardLayout>

      <h1 className="text-2xl font-bold mb-6">Crop Health Analysis</h1>

      <section className="mb-6 rounded-xl bg-white p-5 shadow">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">AI Disease Detection</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload a clear crop image to identify disease and receive a treatment recommendation.
            </p>
          </div>
          <Upload className="h-5 w-5 text-emerald-700" aria-hidden="true" />
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-8 text-center hover:bg-emerald-50">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              setSelectedImage(event.target.files?.[0] || null);
              setAnalysis(null);
              setUploadError("");
            }}
          />
          <Upload className="mb-2 h-7 w-7 text-emerald-700" aria-hidden="true" />
          <span className="text-sm font-medium text-emerald-900">
            {selectedImage ? selectedImage.name : "Choose a crop image"}
          </span>
          <span className="mt-1 text-xs text-gray-500">JPEG, PNG, or WebP up to 10 MB</span>
        </label>

        <button
          type="button"
          onClick={analyzeImage}
          disabled={!selectedImage || isAnalyzing}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isAnalyzing ? "Analyzing image..." : "Analyze crop image"}
        </button>

        {uploadError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{uploadError}</span>
          </div>
        )}

        {analysis && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-950">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              {analysis.status === "analyzed" ? "AI analysis complete" : "AI model setup required"}
            </div>
            {analysis.disease && (
              <p className="mt-3 text-sm text-gray-700">
                Detected: <strong>{analysis.disease}</strong> ({analysis.confidence}% confidence)
              </p>
            )}
            {analysis.solution && (
              <p className="mt-2 text-sm text-gray-700"><strong>Suggested solution:</strong> {analysis.solution}</p>
            )}
            {analysis.message && <p className="mt-2 text-sm text-amber-800">{analysis.message}</p>}
            {analysis.detections?.map((detection, index) => (
              <div key={`${detection.disease}-${index}`} className="mt-3 border-t border-emerald-200 pt-3 text-sm text-gray-700">
                <strong>{detection.disease}</strong> ({detection.confidence}% confidence)
                <p>{detection.solution}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ✅ HEATMAP */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="mb-3 font-semibold">Crop Health Heatmap</h2>

          <div className="grid grid-cols-8 gap-1">
            {cropHealthData.heatmapData.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className="h-10 rounded"
                  style={{
                    backgroundColor:
                      cell > 85
                        ? "#22c55e"
                        : cell > 75
                        ? "#84cc16"
                        : cell > 65
                        ? "#eab308"
                        : "#ef4444"
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ✅ PIE */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="mb-3 font-semibold">Health Distribution</h2>
          <div className="h-64">
            <Doughnut data={chartData} />
          </div>
        </div>

      </div>

      {/* ✅ DISEASES */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Disease Detection</h3>

        {cropHealthData.diseases.map((d, i) => (
          <div key={i} className="border p-3 rounded mb-2 flex justify-between">
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-sm text-gray-500">
                Affected Area: {d.affectedArea}%
              </p>
              <p className="text-sm text-gray-500">
                Confidence: {d.confidence}%
              </p>
            </div>

            <span
              className={`px-2 py-1 rounded text-white text-xs
                ${d.severity === "High" ? "bg-red-500" :
                  d.severity === "Medium" ? "bg-yellow-500" :
                  "bg-gray-500"}`}
            >
              {d.severity}
            </span>
          </div>
        ))}
      </div>

      {/* ✅ PESTS */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Pest Alerts</h3>

        {cropHealthData.pests.map((p, i) => (
          <div key={i} className="border p-3 rounded mb-2 flex justify-between">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                Location: {p.location}
              </p>
              <p className="text-sm text-gray-500">
                Detected: {p.detected}
              </p>
            </div>

            <span
              className={`px-2 py-1 rounded text-white text-xs
                ${p.severity === "High" ? "bg-red-500" :
                  p.severity === "Medium" ? "bg-yellow-500" :
                  "bg-gray-500"}`}
            >
              {p.severity}
            </span>
          </div>
        ))}
      </div>

    </DashboardLayout>
  );
};

export default CropHealthAnalysis;