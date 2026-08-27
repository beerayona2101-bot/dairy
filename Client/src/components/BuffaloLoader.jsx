import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * Animated Walking Buffalo SVG + CSS Loader Component
 * Supports 3 variants: "full" (fullscreen/overlay), "inline" (card/section), "button" (mini inline button loader)
 */
export default function BuffaloLoader({
  variant = "full",
  size = "md",
  text,
  className = "",
}) {
  // Mini button loader variant
  if (variant === "button") {
    return (
      <span className={`inline-flex items-center justify-center gap-2 font-medium ${className}`}>
        <WalkingBuffaloSVG size="button" />
        <span>{text || "Processing..."}</span>
      </span>
    );
  }

  // Card / Inline section loader
  if (variant === "inline") {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center space-y-3 ${className}`}>
        <div className="relative flex flex-col items-center">
          <WalkingBuffaloSVG size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"} />
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#1E88E5]/30 dark:via-blue-400/30 to-transparent rounded-full mt-1 animate-pulse" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 animate-pulse">
          {text || "Loading fresh dairy data..."}
        </p>
      </div>
    );
  }

  // Fullscreen / Overlay page loader
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 shadow-2xl max-w-sm w-full mx-4 text-center">
        {/* Walking Buffalo SVG Scene */}
        <div className="relative flex flex-col items-center py-2">
          {/* Milk Drop Bouncing */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="text-2xl mb-1 select-none"
          >
            🥛
          </motion.div>

          <WalkingBuffaloSVG size="lg" />

          {/* Moving Ground Line */}
          <div className="w-48 h-1 overflow-hidden relative mt-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#1E88E5] dark:via-blue-400 to-transparent animate-ground-move" />
          </div>
        </div>

        {/* Text Details */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-[#1E88E5] via-blue-600 to-[#1E88E5] dark:from-blue-400 dark:via-pink-400 dark:to-yellow-300 bg-clip-text text-transparent">
            Madhur Dairy & Daily Needs
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium animate-pulse">
            {text || "Connecting to fresh dairy server..."}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom Animated SVG for Walking Buffalo / Cow
 */
function WalkingBuffaloSVG({ size = "md" }) {
  // Dimensions depending on size
  const dims =
    size === "button"
      ? { width: 28, height: 20 }
      : size === "sm"
      ? { width: 64, height: 48 }
      : size === "lg"
      ? { width: 120, height: 90 }
      : { width: 90, height: 68 };

  return (
    <svg
      width={dims.width}
      height={dims.height}
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="buffalo-svg-animated select-none"
    >
      <style>{`
        @keyframes legSwingFront {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(22deg); }
        }
        @keyframes legSwingBack {
          0%, 100% { transform: rotate(22deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes bodyBobbing {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2.5px); }
        }
        @keyframes tailSway {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes hornNod {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(-3deg); }
        }
        @keyframes groundMove {
          0% { left: -50%; }
          100% { left: 100%; }
        }
        .animate-ground-move {
          animation: groundMove 1.4s linear infinite;
        }
        .leg-group-a {
          transform-origin: 38px 58px;
          animation: legSwingFront 0.65s ease-in-out infinite;
        }
        .leg-group-b {
          transform-origin: 82px 58px;
          animation: legSwingBack 0.65s ease-in-out infinite;
        }
        .leg-group-c {
          transform-origin: 44px 58px;
          animation: legSwingBack 0.65s ease-in-out infinite;
        }
        .leg-group-d {
          transform-origin: 76px 58px;
          animation: legSwingFront 0.65s ease-in-out infinite;
        }
        .buffalo-body-main {
          animation: bodyBobbing 0.65s ease-in-out infinite;
        }
        .buffalo-head-group {
          transform-origin: 32px 35px;
          animation: hornNod 0.65s ease-in-out infinite;
        }
        .buffalo-tail-group {
          transform-origin: 94px 38px;
          animation: tailSway 0.65s ease-in-out infinite;
        }
      `}</style>

      <g className="buffalo-root">
        {/* BACK LEGS (behind body) */}
        <g className="leg-group-c" opacity="0.85">
          <path d="M42 56 L38 78 L45 78 L47 56 Z" fill="#1E293B" />
          <rect x="37" y="75" width="8" height="4" rx="1" fill="#0F172A" />
        </g>
        <g className="leg-group-d" opacity="0.85">
          <path d="M74 56 L70 78 L77 78 L79 56 Z" fill="#1E293B" />
          <rect x="69" y="75" width="8" height="4" rx="1" fill="#0F172A" />
        </g>

        {/* TAIL */}
        <g className="buffalo-tail-group">
          <path d="M93 38 Q104 42 101 58" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <ellipse cx="101" cy="60" rx="3" ry="5" fill="#1E293B" />
        </g>

        {/* MAIN BODY */}
        <g className="buffalo-body-main">
          {/* Udder */}
          <ellipse cx="68" cy="54" rx="6" ry="4" fill="#F87171" opacity="0.6" />

          {/* Torso & Hump */}
          <path
            d="M30 38 Q32 26 44 25 Q58 20 72 26 Q92 28 95 40 Q96 52 86 56 Q60 60 38 56 Q28 52 30 38 Z"
            fill="#334155"
          />
          {/* Hump Overlay */}
          <path d="M38 26 Q46 18 56 22 Q48 28 38 26 Z" fill="#1E293B" opacity="0.4" />
          {/* Belly Patch */}
          <path d="M42 52 Q60 56 78 52 Q60 54 42 52 Z" fill="#475569" />

          {/* FRONT LEGS */}
          <g className="leg-group-a">
            <path d="M36 54 L32 78 L39 78 L42 54 Z" fill="#334155" />
            <rect x="31" y="75" width="8" height="4" rx="1" fill="#0F172A" />
          </g>
          <g className="leg-group-b">
            <path d="M80 54 L76 78 L83 78 L86 54 Z" fill="#334155" />
            <rect x="75" y="75" width="8" height="4" rx="1" fill="#0F172A" />
          </g>

          {/* HEAD & HORNS */}
          <g className="buffalo-head-group">
            <path
              d="M26 32 C 16 26, 12 14, 20 10 C 22 14, 24 22, 30 28 Z"
              fill="#E2E8F0"
              stroke="#94A3B8"
              strokeWidth="1"
            />
            <path
              d="M32 30 C 26 22, 28 10, 36 8 C 36 14, 34 22, 34 29 Z"
              fill="#CBD5E1"
            />
            <path d="M18 34 Q16 46 24 50 Q34 52 36 40 Q36 30 26 32 Z" fill="#1E293B" />
            <ellipse cx="20" cy="45" rx="5" ry="4" fill="#475569" />
            <circle cx="19" cy="46" r="1" fill="#0F172A" />
            <path d="M30 34 Q38 32 35 38 Z" fill="#334155" />
            <circle cx="26" cy="36" r="2" fill="#FFFFFF" />
            <circle cx="25.5" cy="36" r="1" fill="#0F172A" />
          </g>
        </g>
      </g>
    </svg>
  );
}

BuffaloLoader.propTypes = {
  variant: PropTypes.oneOf(["full", "inline", "button"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "button"]),
  text: PropTypes.string,
  className: PropTypes.string,
};
