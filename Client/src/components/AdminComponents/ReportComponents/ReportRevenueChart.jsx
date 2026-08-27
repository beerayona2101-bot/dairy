import React from "react";
import PropTypes from "prop-types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { formatNumberWithCommas } from "../../../utils/format";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
        <p className="font-bold text-gray-700 dark:text-gray-200 border-b pb-1 border-gray-200 dark:border-gray-700">
          Period: {label}
        </p>
        <p className="text-[#1E88E5] font-semibold flex items-center justify-between gap-3">
          <span>Revenue:</span>
          <span>₹{formatNumberWithCommas(payload[0]?.value || 0)}</span>
        </p>
        <p className="text-[#1E88E5] font-semibold flex items-center justify-between gap-3">
          <span>Profit:</span>
          <span>₹{formatNumberWithCommas(payload[1]?.value || 0)}</span>
        </p>
        <p className="text-[#43A047] font-semibold flex items-center justify-between gap-3">
          <span>Sales (Units/Orders):</span>
          <span>{payload[2]?.value || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

export default function ReportRevenueChart({ timelineData = [], timeRange = "month" }) {
  const timeLabels = {
    today: "Daily Hourly Sales & Revenue Trend",
    week: "Weekly Performance Breakdown (Mon - Sun)",
    month: "Monthly Revenue & Sales Growth Trend",
    year: "Yearly Monthly Comparison Trend",
    all: "All-Time Multi-Year Growth Trends",
  };

  return (
    <div className="bg-white dark:bg-gray-500/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ShowChartIcon className="text-[#1E88E5] dark:text-pink-400" />
            Revenue & Sales Performance Graph
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {timeLabels[timeRange] || "Sales and Revenue Metrics over Time"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs px-3 py-1 rounded-full font-bold self-start sm:self-auto">
          <TrendingUpIcon sx={{ fontSize: "1rem" }} />
          <span>+22.4% Revenue Growth</span>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#43A047" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#43A047" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700/50" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />

            <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#1E88E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            <Area type="monotone" dataKey="profit" name="Net Profit (₹)" stroke="#1E88E5" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
            <Area type="monotone" dataKey="sales" name="Sales (Units)" stroke="#43A047" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

ReportRevenueChart.propTypes = {
  timelineData: PropTypes.array.isRequired,
  timeRange: PropTypes.string,
};
