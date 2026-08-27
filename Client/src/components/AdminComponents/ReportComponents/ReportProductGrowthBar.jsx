import React from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { formatNumberWithCommas } from "../../../utils/format";

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
        <p className="font-bold text-gray-800 dark:text-white line-clamp-1">{data.name}</p>
        <p className="text-gray-500 dark:text-gray-400">Category: {data.category}</p>
        <p className="text-[#43A047] font-bold">Units Sold: {data.sold} units</p>
        <p className="text-[#1E88E5] font-bold">Revenue: ₹{formatNumberWithCommas(data.revenue)}</p>
        <p className="text-pink-600 font-semibold flex items-center gap-1">
          <TrendingUpIcon sx={{ fontSize: "0.9rem" }} />
          Growth Rate: +{data.growth}%
        </p>
      </div>
    );
  }
  return null;
};

CustomBarTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export default function ReportProductGrowthBar({ productGrowthData = [] }) {
  const barColors = ["#1E88E5", "#1E88E5", "#43A047", "#FE8C00", "#E91E63", "#9C27B0"];

  return (
    <div className="bg-white dark:bg-gray-500/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-4">
      <div className="border-b border-gray-100 dark:border-gray-700/60 pb-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChartIcon className="text-[#43A047] dark:text-green-400" />
            Top Product Sales & Revenue Growth
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Comparative bar chart presentation of top seller units vs revenue
          </p>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700/50" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(val) => val.split(" ")[1] || val.slice(0, 8)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomBarTooltip />} />

            <Bar dataKey="sold" name="Units Sold" radius={[6, 6, 0, 0]}>
              {productGrowthData.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

ReportProductGrowthBar.propTypes = {
  productGrowthData: PropTypes.array.isRequired,
};
