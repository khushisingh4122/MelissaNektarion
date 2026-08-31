import React from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { cropHealthData } from "../data/sampleData.js";
import { Doughnut } from "react-chartjs-2";

const CropHealthAnalysis = () => {

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