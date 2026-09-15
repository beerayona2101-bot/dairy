import React from "react";
import PropTypes from "prop-types";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MopedOutlinedIcon from "@mui/icons-material/MopedOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

export const ORDER_STEPS = [
  {
    key: "Pending",
    label: "Order Placed",
    sublabel: "Received",
    icon: <ShoppingBagOutlinedIcon sx={{ fontSize: "1.1rem" }} />,
  },
  {
    key: "Confirmed",
    label: "Order Confirmed",
    sublabel: "Approved",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: "1.1rem" }} />,
  },
  {
    key: "Processing",
    label: "Order Packed",
    sublabel: "Packed at 4°C",
    icon: <Inventory2OutlinedIcon sx={{ fontSize: "1.1rem" }} />,
  },
  {
    key: "Shipped",
    label: "Order Shipped",
    sublabel: "In Transit",
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: "1.1rem" }} />,
  },
  {
    key: "Ready to Deliver",
    label: "Ready to Deliver",
    sublabel: "Out for Delivery",
    icon: <MopedOutlinedIcon sx={{ fontSize: "1.1rem" }} />,
  },
  {
    key: "Delivered",
    label: "Order Delivered",
    sublabel: "Completed",
    icon: <VerifiedIcon sx={{ fontSize: "1.1rem" }} />,
  },
];

export default function OrderStatusTracker({ currentStatus }) {
  const isCancelled = currentStatus === "Cancelled";

  const getStepIndex = (status) => {
    const normalized = (status || "").toLowerCase().trim();
    if (normalized === "pending" || normalized === "placed") return 0;
    if (normalized === "confirmed" || normalized === "approved") return 1;
    if (normalized === "processing" || normalized === "packed" || normalized === "packaging") return 2;
    if (normalized === "shipped" || normalized === "dispatched" || normalized === "in transit") return 3;
    if (normalized === "ready to deliver" || normalized === "out for delivery" || normalized === "delivering") return 4;
    if (normalized === "delivered" || normalized === "completed" || normalized === "received") return 5;
    if (normalized === "cancelled" || normalized === "rejected") return -1;
    return 0;
  };

  const activeIndex = getStepIndex(currentStatus);
  const progressPercent = isCancelled ? 0 : Math.min(100, Math.max(0, (activeIndex / (ORDER_STEPS.length - 1)) * 100));

  if (isCancelled) {
    return (
      <div className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 text-rose-900 dark:text-rose-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
            <CancelOutlinedIcon />
          </div>
          <div>
            <h4 className="font-black text-sm">Order Cancelled / Rejected</h4>
            <p className="text-xs text-rose-700 dark:text-rose-300">This order has been cancelled and will not be processed further.</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-300">
          Cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-gray-700 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Order Progress</span>
        </h4>
        <span className="text-xs font-extrabold text-[#1E88E5] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
          Step {activeIndex + 1} of {ORDER_STEPS.length}: {ORDER_STEPS[activeIndex]?.label}
        </span>
      </div>

      {/* Step Progress Line & Nodes Container */}
      <div className="relative pt-2 pb-1">
        {/* Background Grey Line */}
        <div className="absolute top-3.5 sm:top-5 left-3 sm:left-4 right-3 sm:right-4 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full z-0" />

        {/* Colored Progress Line Bar */}
        <div
          className="absolute top-3.5 sm:top-5 left-3 sm:left-4 h-1 sm:h-1.5 bg-gradient-to-r from-[#1E88E5] via-blue-500 to-emerald-500 rounded-full z-0 transition-all duration-500 ease-out"
          style={{ width: `calc(${progressPercent}% * 0.9 + 2%)` }}
        />

        {/* Step Nodes Row */}
        <div className="relative z-10 flex items-start justify-between">
          {ORDER_STEPS.map((step, idx) => {
            const isPassed = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.key} className="flex flex-col items-center text-center group w-1/6 px-0.5">
                {/* Node Icon Circle */}
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isPassed
                      ? "bg-gradient-to-tr from-[#1E88E5] to-emerald-500 text-white shadow-md shadow-blue-500/30 scale-105"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-300 dark:border-gray-600"
                  } ${isCurrent ? "ring-2 sm:ring-4 ring-blue-300/50 dark:ring-blue-800/50" : ""}`}
                >
                  <span className="scale-75 sm:scale-100 flex items-center justify-center">
                    {step.icon}
                  </span>
                </div>

                {/* Node Label Text */}
                <div className="mt-1 sm:mt-2 space-y-0.5">
                  <p
                    className={`text-[8px] sm:text-xs font-extrabold leading-tight tracking-tighter sm:tracking-normal line-clamp-2 ${
                      isPassed ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">
                    {step.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

OrderStatusTracker.propTypes = {
  currentStatus: PropTypes.string.isRequired,
};
