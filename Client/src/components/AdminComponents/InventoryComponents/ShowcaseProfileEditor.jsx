import React from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { generateAiNutritionalProfile } from "../../../utils/nutritionUtils";

export { generateAiNutritionalProfile };



export default function ShowcaseProfileEditor({
  productName,
  category,
  currentImage,
  onImageChange,
  nutritionMetrics,
  onMetricsChange,
  disabled = false,
}) {
  const metrics = nutritionMetrics && nutritionMetrics.length === 5 
    ? nutritionMetrics 
    : generateAiNutritionalProfile(productName || category);

  const handleAiGenerate = () => {
    const aiGenerated = generateAiNutritionalProfile(productName || category);
    onMetricsChange(aiGenerated);
  };

  const handleMetricUpdate = (idx, field, value) => {
    const updated = [...metrics];
    updated[idx] = { ...updated[idx], [field]: value };
    onMetricsChange(updated);
  };

  return (
    <div className="space-y-4 bg-[#6C5CE7]/5 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-[#6C5CE7]/20 dark:border-gray-700">
      
      {/* Nutritional & Health Profile Header & AI Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-gray-700 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2D3748] dark:text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
            Nutritional & Health Profile (5 Key Metrics)
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Custom edit indicators or click AI Auto Generate.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={handleAiGenerate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-purple-800 hover:from-[#5b4cc4] hover:to-purple-900 text-white text-xs font-black shadow-xs transition-all cursor-pointer border border-purple-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-200" />
          <span>✨ AI Auto Generate Profile</span>
        </button>
      </div>

      {/* 5 Custom Metrics Inputs */}
      <div className="space-y-2.5">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Label #{idx + 1}
                </label>
                <input
                  type="text"
                  disabled={disabled}
                  value={metric.label}
                  onChange={(e) => handleMetricUpdate(idx, "label", e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Value String
                </label>
                <input
                  type="text"
                  disabled={disabled}
                  value={metric.val}
                  onChange={(e) => handleMetricUpdate(idx, "val", e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Percent ({metric.percent}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  disabled={disabled}
                  value={metric.percent}
                  onChange={(e) => handleMetricUpdate(idx, "percent", Number(e.target.value))}
                  className="w-full accent-[#6C5CE7] mt-1"
                />
              </div>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Color:</span>
              {["#6C5CE7", "#8B5CF6", "#A78BFA", "#6D28D9", "#3B0764", "#27272A"].map((cHex) => (
                <button
                  key={cHex}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleMetricUpdate(idx, "color", cHex)}
                  style={{ backgroundColor: cHex }}
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                    metric.color === cHex ? "ring-2 ring-black dark:ring-white scale-110" : "opacity-75 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
