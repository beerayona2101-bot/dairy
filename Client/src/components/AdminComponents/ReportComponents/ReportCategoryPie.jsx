import React from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import PieChartIcon from "@mui/icons-material/PieChart";

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-2.5 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
        <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Market Share: <span className="font-bold text-gray-900 dark:text-white">{data.value}%</span>
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Units Sold: <span className="font-medium">{data.count} units</span>
        </p>
      </div>
    );
  }
  return null;
};

CustomPieTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export default function ReportCategoryPie({ categoryData = [] }) {
  // Ensure palette colors for category segments
  const paletteColors = ["#1E88E5", "#43A047", "#00ACC1", "#FB8C00", "#0F2742", "#66BB6A", "#E53935"];
  const styledCategoryData = categoryData.map((item, index) => ({
    ...item,
    color: item.color || paletteColors[index % paletteColors.length],
  }));

  return (
    <div className="bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="border-b border-gray-100 dark:border-gray-700/60 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[#0F2742] dark:text-white flex items-center gap-2 tracking-tight">
            <PieChartIcon className="text-[#1E88E5] dark:text-blue-400" />
            Product Category Market Share
          </h2>
          <p className="text-xs text-[#64748B] dark:text-gray-400 mt-0.5">
            Circular breakdown of sales distribution across dairy categories
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E88E5] dark:text-blue-300">
          Live Breakdown
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
        {/* Donut Pie Presentation */}
        <div className="h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={styledCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={4}
                dataKey="value"
              >
                {styledCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text in Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-black text-[#0F2742] dark:text-white">100%</span>
            <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Total Share</span>
          </div>
        </div>

        {/* Legend Badges & Percentage callouts */}
        <div className="space-y-2">
          {styledCategoryData.map((item, idx) => (
            <div key={item.name || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-[#1E293B] dark:text-gray-200 truncate">{item.name}</span>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <span className="text-xs text-[#64748B] dark:text-gray-400 font-medium">{item.count} pcs</span>
                <span className="text-xs font-extrabold text-[#0F2742] dark:text-white bg-white dark:bg-gray-800 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReportCategoryPie.propTypes = {
  categoryData: PropTypes.array.isRequired,
};
