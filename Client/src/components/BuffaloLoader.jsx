import React from "react";
import PropTypes from "prop-types";

/**
 * BufferCircleSVG Component
 * Modern, high-performance dual-tone Blue & Green buffer spinner circle.
 * Features an elegant rotating gradient stroke, smooth fluid dash animation,
 * and ambient soft glow.
 */
function BufferCircleSVG({ size = "lg", className = "" }) {
  // Dimensions and stroke widths tuned for each size
  const config = {
    button: { dim: 18, stroke: 2.5, viewBox: 32 },
    sm: { dim: 30, stroke: 3, viewBox: 48 },
    md: { dim: 44, stroke: 3.5, viewBox: 56 },
    lg: { dim: 56, stroke: 4, viewBox: 64 },
    xl: { dim: 72, stroke: 4.5, viewBox: 80 },
  }[size] || { dim: 56, stroke: 4, viewBox: 64 };

  const center = config.viewBox / 2;
  const radius = center - config.stroke - 2;

  // Unique gradient ID suffix to avoid DOM collisions
  const gradId = `bufferBlueGreenGrad_${size}`;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Ambient soft glow for larger sizes */}
      {(size === "lg" || size === "xl") && (
        <div
          className="absolute rounded-full -z-10 blur-lg opacity-40 animate-pulse pointer-events-none"
          style={{
            width: config.dim * 1.25,
            height: config.dim * 1.25,
            background: "radial-gradient(circle, rgba(7,86,181,0.35) 0%, rgba(7,92,42,0.35) 60%, transparent 100%)",
          }}
        />
      )}

      <svg
        width={config.dim}
        height={config.dim}
        viewBox={`0 0 ${config.viewBox} ${config.viewBox}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="buffer-circle-spin"
        style={{ animation: "bufferSpin 1.15s cubic-bezier(0.4, 0.15, 0.2, 0.9) infinite" }}
      >
        <defs>
          {/* Vibrant Dairy Blue to Fresh Pure Green Gradient Combo */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0756B5" />
            <stop offset="35%" stopColor="#0284C7" />
            <stop offset="70%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#075C2A" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes bufferSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes bufferDash {
            0% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 125, 200;
              stroke-dashoffset: -35;
            }
            100% {
              stroke-dasharray: 125, 200;
              stroke-dashoffset: -175;
            }
          }
        `}</style>

        {/* Faint subtle background track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-slate-200 dark:text-slate-800 opacity-35"
        />

        {/* Dynamic Blue-Green Gradient Loading Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            animation: "bufferDash 1.4s ease-in-out infinite",
          }}
        />
      </svg>
    </div>
  );
}

/**
 * Universal BuffaloLoader (Buffer Circle Variant)
 * Replaces the old running cow animation with a modern, smooth
 * Blue & Green dual-tone circular buffer.
 */
export default function BuffaloLoader({
  variant = "full",
  size = "lg",
  text,
  className = "",
}) {
  // Mini button loader variant (clean, fits into buttons)
  if (variant === "button") {
    return (
      <span className={`inline-flex items-center justify-center gap-2 font-medium ${className}`}>
        <BufferCircleSVG size="button" />
        {text && <span>{text}</span>}
      </span>
    );
  }

  // Inline / Section loader
  if (variant === "inline") {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <BufferCircleSVG size={size === "sm" ? "sm" : size === "xl" ? "xl" : "lg"} />
        {text && (
          <p className="mt-3.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  // Fullscreen / Overlay page loader
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-all duration-300 ${className}`}
    >
      <div className="relative flex flex-col items-center justify-center select-none px-6 py-8 rounded-3xl">
        <BufferCircleSVG size="xl" />
        <p className="mt-5 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 tracking-wide animate-pulse text-center">
          {text || "Loading Natural Milk Dairy..."}
        </p>
      </div>
    </div>
  );
}

BuffaloLoader.propTypes = {
  variant: PropTypes.oneOf(["full", "inline", "button"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "button"]),
  text: PropTypes.string,
  className: PropTypes.string,
};
