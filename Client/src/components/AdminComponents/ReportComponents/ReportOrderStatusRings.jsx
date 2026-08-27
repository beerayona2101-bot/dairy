import React from "react";
import PropTypes from "prop-types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

export default function ReportOrderStatusRings({ orderStatusData = {} }) {
  const { total = 0, delivered = { pct: 92, count: 108 }, pending = { pct: 6, count: 7 }, cancelled = { pct: 2, count: 3 } } = orderStatusData;

  const rings = [
    {
      title: "Delivered Orders",
      pct: delivered.pct || 92,
      count: delivered.count || 108,
      color: "#43A047",
      bgColor: "bg-green-500",
      stroke: "stroke-green-500",
      bgStroke: "stroke-green-100 dark:stroke-green-950",
      badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: <AssignmentTurnedInIcon className="text-green-600 dark:text-green-400" />,
    },
    {
      title: "Active / Shipping",
      pct: pending.pct || 6,
      count: pending.count || 7,
      color: "#1E88E5",
      bgColor: "bg-blue-500",
      stroke: "stroke-blue-500",
      bgStroke: "stroke-blue-100 dark:stroke-blue-950",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      icon: <LocalShippingIcon className="text-blue-600 dark:text-blue-400" />,
    },
    {
      title: "Cancelled Orders",
      pct: cancelled.pct || 2,
      count: cancelled.count || 3,
      color: "#EF4444",
      bgColor: "bg-red-500",
      stroke: "stroke-red-500",
      bgStroke: "stroke-red-100 dark:stroke-red-950",
      badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: <CancelIcon className="text-red-600 dark:text-red-400" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-500/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-4">
      <div className="border-b border-gray-100 dark:border-gray-700/60 pb-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <AssignmentTurnedInIcon className="text-[#1E88E5] dark:text-blue-400" />
            Order Fulfillment Circular Progress
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Circular progress ring presentations of total order statuses ({total} total orders)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {rings.map((ring, idx) => {
          const radius = 38;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (ring.pct / 100) * circumference;

          return (
            <div
              key={ring.title || idx}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 text-center space-y-3"
            >
              {/* Circular SVG Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    strokeWidth="8"
                    className={`${ring.bgStroke} fill-none`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`${ring.stroke} fill-none transition-all duration-1000 ease-out`}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">{ring.pct}%</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Rate</span>
                </div>
              </div>

              <div>
                <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ring.badge}`}>
                  {ring.title}
                </span>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">
                  {ring.count} Orders
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

ReportOrderStatusRings.propTypes = {
  orderStatusData: PropTypes.object,
};
