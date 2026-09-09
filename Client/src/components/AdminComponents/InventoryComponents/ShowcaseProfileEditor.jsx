import React from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";

export const generateAiNutritionalProfile = (title) => {
  const lower = (title || "").toLowerCase();
  
  if (lower.includes("cream")) {
    return [
      { label: "Milk Fat & Creaminess", percent: 96, val: "40% Pure Milk Fat", color: "#6C5CE7" },
      { label: "Energy & Calories", percent: 92, val: "340 kcal / 100g", color: "#F59E0B" },
      { label: "Calcium & Minerals", percent: 85, val: "95mg Calcium", color: "#00ACC1" },
      { label: "Natural Protein", percent: 78, val: "2.1g Protein", color: "#00B894" },
      { label: "Customer Approval", percent: 98, val: "4.9★ Whipping Grade", color: "#FF7675" }
    ];
  } else if (lower.includes("paneer")) {
    return [
      { label: "Protein Content", percent: 98, val: "18.3g / 100g", color: "#00B894" },
      { label: "Calcium Level", percent: 94, val: "480mg DV", color: "#00ACC1" },
      { label: "Healthy Dairy Fat", percent: 90, val: "20.8% A2 Fat", color: "#6C5CE7" },
      { label: "Sugar Content", percent: 99, val: "0.2g Low Sugar", color: "#F59E0B" },
      { label: "Customer Approval", percent: 97, val: "4.9★ Verified", color: "#FF7675" }
    ];
  } else if (lower.includes("ghee")) {
    return [
      { label: "Pure Healthy Fat", percent: 99, val: "99.7% A2 Ghee", color: "#6C5CE7" },
      { label: "Energy Boost", percent: 96, val: "897 kcal/100g", color: "#F59E0B" },
      { label: "Vitamin A & E", percent: 94, val: "Rich Antioxidants", color: "#00B894" },
      { label: "Lactose & Sugar", percent: 100, val: "0% Lactose Free", color: "#00ACC1" },
      { label: "Customer Approval", percent: 98, val: "5.0★ Rating", color: "#FF7675" }
    ];
  } else if (lower.includes("curd") || lower.includes("dahi")) {
    return [
      { label: "Probiotics & Gut Health", percent: 97, val: "Live Cultures", color: "#00B894" },
      { label: "Protein Content", percent: 90, val: "4.2g / 100g", color: "#00ACC1" },
      { label: "Calcium Level", percent: 93, val: "150mg DV", color: "#6C5CE7" },
      { label: "Natural Sugar", percent: 86, val: "3.2g Natural", color: "#F59E0B" },
      { label: "Customer Approval", percent: 95, val: "4.8★ Choice", color: "#FF7675" }
    ];
  } else if (lower.includes("butter")) {
    return [
      { label: "Pure Dairy Fat", percent: 97, val: "82% Milk Fat", color: "#6C5CE7" },
      { label: "Vitamin A & D", percent: 92, val: "Essential Vitamins", color: "#F59E0B" },
      { label: "Natural Moisture", percent: 88, val: "16% Natural Water", color: "#00ACC1" },
      { label: "Sodium / Salt", percent: 84, val: "1.2% Balanced Salt", color: "#00B894" },
      { label: "Customer Approval", percent: 96, val: "4.9★ Creamy", color: "#FF7675" }
    ];
  } else if (lower.includes("lassi") || lower.includes("chaas") || lower.includes("buttermilk")) {
    return [
      { label: "Hydration & Coolant", percent: 96, val: "Natural Coolant", color: "#00ACC1" },
      { label: "Probiotics", percent: 92, val: "Active Cultures", color: "#00B894" },
      { label: "Protein Content", percent: 85, val: "2.8g / 100ml", color: "#6C5CE7" },
      { label: "Sugar Content", percent: 84, val: "Balanced Taste", color: "#F59E0B" },
      { label: "Customer Approval", percent: 94, val: "4.8★ Refreshing", color: "#FF7675" }
    ];
  } else if (lower.includes("sweet") || lower.includes("ped") || lower.includes("jamun") || lower.includes("rasgulla") || lower.includes("shrikhand") || lower.includes("basundi")) {
    return [
      { label: "Rich Milk Solids", percent: 94, val: "100% Pure Khoya", color: "#6C5CE7" },
      { label: "Natural Energy", percent: 90, val: "Instant Energy", color: "#F59E0B" },
      { label: "Calcium & Minerals", percent: 88, val: "Dairy Minerals", color: "#00B894" },
      { label: "Sweetness Balance", percent: 92, val: "Pure Cane Sugar", color: "#00ACC1" },
      { label: "Customer Approval", percent: 99, val: "5.0★ Traditional", color: "#FF7675" }
    ];
  } else {
    return [
      { label: "Protein Content", percent: 92, val: "3.4g / 100ml", color: "#00B894" },
      { label: "Calcium & Minerals", percent: 95, val: "120mg DV", color: "#00ACC1" },
      { label: "Healthy Milk Fat", percent: 88, val: "3.8% Pure Fat", color: "#6C5CE7" },
      { label: "Natural Sugar Content", percent: 82, val: "4.7g Natural", color: "#F59E0B" },
      { label: "Customer Approval", percent: 96, val: "4.9★ Favorite", color: "#FF7675" }
    ];
  }
};

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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-indigo-600 hover:from-[#5b4cc4] hover:to-indigo-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer border border-purple-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
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
              {["#00B894", "#00ACC1", "#6C5CE7", "#F59E0B", "#FF7675", "#0284C7"].map((cHex) => (
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
