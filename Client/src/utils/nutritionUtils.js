// Smart AI Nutritional & Health Profile Generator
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

export const getNormalizedNutritionMetrics = (item, title) => {
    const defaultMetrics = generateAiNutritionalProfile(title);

    let rawMetrics = item?.nutritionMetrics || item?.nutrition?.nutritionMetrics;
    if (Array.isArray(rawMetrics) && rawMetrics.length > 0) {
        return rawMetrics.map((m, idx) => ({
            label: m.label || m.name || `Metric ${idx + 1}`,
            percent: Number(m.percent) || (92 - idx * 3),
            val: m.val || m.value || `${m.percent || 90}%`,
            color: m.color || (idx === 0 ? "#00B894" : idx === 1 ? "#00ACC1" : idx === 2 ? "#6C5CE7" : idx === 3 ? "#F59E0B" : "#FF7675")
        }));
    }

    if (Array.isArray(item?.nutrition) && item.nutrition.length > 0) {
        return item.nutrition.map((str, idx) => {
            const parts = String(str).split(":");
            const label = parts[0]?.trim() || "Nutrient";
            const val = parts[1]?.trim() || String(str);
            const defaultM = defaultMetrics[idx] || defaultMetrics[0];
            return {
                label: label,
                percent: defaultM.percent || (92 - idx * 3),
                val: val,
                color: defaultM.color || "#00B894"
            };
        });
    }

    return defaultMetrics;
};
