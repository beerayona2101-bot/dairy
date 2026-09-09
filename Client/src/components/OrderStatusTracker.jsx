import React from "react";
import {
  FaShoppingBag,
  FaCheckCircle,
  FaBoxOpen,
  FaShippingFast,
  FaMotorcycle,
  FaCheckDouble,
  FaTimesCircle
} from "react-icons/fa";

const TRACKING_STEPS = [
  {
    id: "Pending",
    title: "Order Placed",
    subtitle: "Received",
    icon: FaShoppingBag,
  },
  {
    id: "Confirmed",
    title: "Order Confirmed",
    subtitle: "Approved",
    icon: FaCheckCircle,
  },
  {
    id: "Packed",
    title: "Order Packed",
    subtitle: "Packed at 4°C",
    icon: FaBoxOpen,
  },
  {
    id: "Shipped",
    title: "Order Shipped",
    subtitle: "In Transit",
    icon: FaShippingFast,
  },
  {
    id: "Ready to Deliver",
    title: "Ready to Deliver",
    subtitle: "Out for Delivery",
    icon: FaMotorcycle,
  },
  {
    id: "Delivered",
    title: "Order Delivered",
    subtitle: "Completed",
    icon: FaCheckDouble,
  },
];

export const getStepIndexByStatus = (status) => {
  const normalized = (status || "").toLowerCase().trim();
  if (normalized === "pending" || normalized === "placed") return 0;
  if (normalized === "confirmed" || normalized === "processing" || normalized === "approved") return 1;
  if (normalized === "packed" || normalized === "packaging") return 2;
  if (normalized === "shipped" || normalized === "dispatched" || normalized === "in transit") return 3;
  if (normalized === "ready to deliver" || normalized === "out for delivery" || normalized === "delivering") return 4;
  if (normalized === "delivered" || normalized === "completed" || normalized === "received") return 5;
  if (normalized === "cancelled" || normalized === "rejected") return -1;
  return 0;
};

export default function OrderStatusTracker({ status = "Pending" }) {
  const currentStepIndex = getStepIndexByStatus(status);
  const isCancelled = currentStepIndex === -1;

  if (isCancelled) {
    return (
      <div className="w-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 sm:p-5 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 mx-auto">
          <FaTimesCircle size={20} />
        </div>
        <h4 className="text-sm sm:text-base font-extrabold text-rose-700 dark:text-rose-300">
          Order Cancelled
        </h4>
        <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
          This order was cancelled. If you have any questions, please contact customer support.
        </p>
      </div>
    );
  }

  const activeStep = TRACKING_STEPS[Math.min(currentStepIndex, TRACKING_STEPS.length - 1)];

  return (
    <div className="w-full bg-gradient-to-r from-teal-50/50 via-cyan-50/30 to-blue-50/40 dark:bg-gray-800/70 border border-teal-100/80 dark:border-gray-700/80 rounded-2xl p-3.5 sm:p-5 space-y-3.5 sm:space-y-5 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-100">
            LIVE ORDER PROGRESS
          </span>
        </div>

        <div className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#00838F] dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 text-[10px] sm:text-xs font-extrabold shadow-2xs truncate">
          Step {currentStepIndex + 1} of {TRACKING_STEPS.length}: {activeStep.title}
        </div>
      </div>

      {/* Stepper Track & Nodes Container - Fits inside single card */}
      <div className="relative w-full px-1 sm:px-3 py-1">
        {/* Background Connecting Line */}
        <div className="absolute top-[15px] sm:top-[20px] left-4 right-4 h-0.5 sm:h-1 bg-gray-200 dark:bg-gray-700 -z-0" />

        {/* Filled Progress Line */}
        <div
          style={{
            width: `calc(${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}% - 8px)`,
          }}
          className="absolute top-[15px] sm:top-[20px] left-4 h-0.5 sm:h-1 bg-gradient-to-r from-[#00BCD4] via-[#00ACC1] to-[#00838F] transition-all duration-500 ease-out -z-0"
        />

        {/* Steps Grid */}
        <div className="grid grid-cols-6 gap-0.5 sm:gap-1 relative z-10">
          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center group min-w-0">
                {/* Node Circle */}
                <div
                  className={`w-7 h-7 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                    isActive
                      ? "bg-[#00BCD4] text-white scale-110 shadow-[0_4px_12px_rgba(0,188,212,0.4)] ring-2 sm:ring-4 ring-cyan-100 dark:ring-cyan-950/80"
                      : isCompleted
                      ? "bg-[#00BCD4] text-white shadow-2xs"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-300/60 dark:border-gray-600"
                  }`}
                >
                  <Icon className="text-[10px] sm:text-base" />
                </div>

                {/* Title & Subtitle */}
                <div className="mt-1.5 sm:mt-2.5 space-y-0.5 w-full px-0.5">
                  <p
                    className={`text-[8px] sm:text-xs font-extrabold leading-tight truncate ${
                      isActive
                        ? "text-[#00838F] dark:text-cyan-300"
                        : isCompleted
                        ? "text-gray-800 dark:text-gray-200"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                    title={step.title}
                  >
                    {step.title.replace("Order ", "")}
                  </p>
                  <p className="hidden sm:block text-[9px] sm:text-[10px] font-medium text-gray-400 dark:text-gray-400 truncate">
                    {step.subtitle}
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
