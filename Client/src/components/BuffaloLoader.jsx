import React from "react";
import PropTypes from "prop-types";

/**
 * Realistic Animated Walking Dairy Cow Loader Component
 * Clean, seamless full-screen animation without cards or brand names.
 */
export default function BuffaloLoader({
  variant = "full",
  size = "lg",
  text,
  className = "",
}) {
  // Mini button loader variant
  if (variant === "button") {
    return (
      <span className={`inline-flex items-center justify-center gap-2 font-medium ${className}`}>
        <WalkingCowSVG size="button" />
        {text && <span>{text}</span>}
      </span>
    );
  }

  // Inline / Section loader
  if (variant === "inline") {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <WalkingCowSVG size={size === "sm" ? "sm" : size === "xl" ? "xl" : "lg"} />
      </div>
    );
  }

  // Fullscreen / Overlay page loader — CLEAN, NO CARD, NO BRAND NAME
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-all duration-300 ${className}`}
    >
      <div className="relative flex flex-col items-center justify-center select-none">
        <WalkingCowSVG size="xl" />
      </div>
    </div>
  );
}

/**
 * Realistic Animated Walking Dairy Cow SVG
 * Features natural quadruped gait, black-and-white Holstein coat patches,
 * articulated walking legs, breathing/bobbing body, swishing tail, and soft pulsing shadow.
 */
function WalkingCowSVG({ size = "lg" }) {
  const dims =
    size === "button"
      ? { width: 36, height: 26 }
      : size === "sm"
      ? { width: 90, height: 65 }
      : size === "md"
      ? { width: 130, height: 95 }
      : size === "xl"
      ? { width: 220, height: 160 }
      : { width: 170, height: 125 };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={dims.width}
        height={dims.height}
        viewBox="0 0 200 145"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="walking-cow-svg select-none overflow-visible"
      >
        <defs>
          {/* Subtle 3D gradient for cow body */}
          <linearGradient id="cowBodyGrad" x1="100" y1="35" x2="100" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Shading gradient for far (background) legs */}
          <linearGradient id="farLegGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Near leg gradient */}
          <linearGradient id="nearLegGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="80%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Horn gradient */}
          <linearGradient id="hornGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="35%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>

          {/* Pink snout gradient */}
          <linearGradient id="snoutGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FECDD3" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </linearGradient>

          {/* Ground shadow radial gradient */}
          <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#0F172A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <style>{`
          /* Natural realistic 4-beat quadruped walk animations */
          @keyframes cowWalkFrontNear {
            0%   { transform: rotate(-14deg); }
            25%  { transform: rotate(0deg) translateY(-2px); }
            50%  { transform: rotate(13deg); }
            75%  { transform: rotate(2deg) translateY(-3px); }
            100% { transform: rotate(-14deg); }
          }
          @keyframes cowWalkBackNear {
            0%   { transform: rotate(13deg); }
            25%  { transform: rotate(-1deg) translateY(-3px); }
            50%  { transform: rotate(-14deg); }
            75%  { transform: rotate(0deg) translateY(-1px); }
            100% { transform: rotate(13deg); }
          }
          @keyframes cowWalkFrontFar {
            0%   { transform: rotate(13deg); }
            25%  { transform: rotate(2deg) translateY(-3px); }
            50%  { transform: rotate(-14deg); }
            75%  { transform: rotate(0deg) translateY(-2px); }
            100% { transform: rotate(13deg); }
          }
          @keyframes cowWalkBackFar {
            0%   { transform: rotate(-14deg); }
            25%  { transform: rotate(0deg) translateY(-1px); }
            50%  { transform: rotate(13deg); }
            75%  { transform: rotate(-1deg) translateY(-3px); }
            100% { transform: rotate(-14deg); }
          }
          @keyframes cowBodyBob {
            0%, 50%, 100% { transform: translateY(0px); }
            25%, 75%      { transform: translateY(-2.2px); }
          }
          @keyframes cowHeadBob {
            0%, 100% { transform: rotate(0deg) translateY(0px); }
            50%      { transform: rotate(-2deg) translateY(-1.2px); }
          }
          @keyframes cowTailSwish {
            0%, 100% { transform: rotate(-7deg); }
            50%      { transform: rotate(9deg); }
          }
          @keyframes cowShadowPulse {
            0%, 50%, 100% { transform: scaleX(1); opacity: 0.25; }
            25%, 75%      { transform: scaleX(0.92); opacity: 0.16; }
          }

          .cow-front-near-leg {
            transform-origin: 64px 74px;
            animation: cowWalkFrontNear 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          }
          .cow-back-near-leg {
            transform-origin: 141px 70px;
            animation: cowWalkBackNear 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          }
          .cow-front-far-leg {
            transform-origin: 74px 72px;
            animation: cowWalkFrontFar 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          }
          .cow-back-far-leg {
            transform-origin: 133px 68px;
            animation: cowWalkBackFar 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          }
          .cow-main-torso {
            animation: cowBodyBob 1.05s ease-in-out infinite;
          }
          .cow-head-animated {
            transform-origin: 46px 48px;
            animation: cowHeadBob 1.05s ease-in-out infinite;
          }
          .cow-tail-animated {
            transform-origin: 160px 52px;
            animation: cowTailSwish 1.05s ease-in-out infinite;
          }
          .cow-ground-shadow {
            transform-origin: 104px 126px;
            animation: cowShadowPulse 1.05s ease-in-out infinite;
          }
        `}</style>

        {/* 1. SOFT PULSING GROUND SHADOW */}
        <ellipse
          cx="104"
          cy="126"
          rx="58"
          ry="7"
          fill="url(#shadowGrad)"
          className="cow-ground-shadow"
        />

        {/* 2. FAR LEGS (Background / Shadowed) */}
        {/* Far Front Leg */}
        <g className="cow-front-far-leg" opacity="0.88">
          <path
            d="M 70 72 Q 72 90 70 102 L 67 122 L 75 122 L 77 102 Q 78 90 77 72 Z"
            fill="url(#farLegGrad)"
          />
          {/* Far Front Hoof */}
          <path d="M 66 117 L 76 117 L 75.5 123 L 66.5 123 Z" fill="#1E293B" />
        </g>

        {/* Far Back Leg */}
        <g className="cow-back-far-leg" opacity="0.88">
          <path
            d="M 129 68 Q 134 84 133 102 L 130 122 L 138 122 L 140 102 Q 142 84 138 68 Z"
            fill="url(#farLegGrad)"
          />
          {/* Far Back Hoof */}
          <path d="M 129.5 117 L 139 117 L 138.5 123 L 130 123 Z" fill="#1E293B" />
        </g>

        {/* 3. TAIL (Background layer behind torso) */}
        <g className="cow-tail-animated">
          {/* Tail Root & Shaft */}
          <path
            d="M 160 52 Q 173 58 171 78 Q 170 89 173 98"
            stroke="#F1F5F9"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tail Black Patch */}
          <path
            d="M 170 82 Q 170 89 173 98"
            stroke="#0F172A"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Soft Black Tail Hair Tuft */}
          <path
            d="M 173 97 C 170 101, 168 107, 172 110 C 175 107, 178 102, 174 97 Z"
            fill="#0F172A"
          />
        </g>

        {/* 4. MAIN TORSO, UDDER, & BODY BOBBING */}
        <g className="cow-main-torso">
          {/* Pink Udder */}
          <g>
            <path
              d="M 112 84 Q 120 92 128 92 Q 136 92 140 84 Z"
              fill="url(#snoutGrad)"
              opacity="0.95"
            />
            {/* Teats */}
            <circle cx="118" cy="91" r="1.5" fill="#FDA4AF" />
            <circle cx="123" cy="93" r="1.5" fill="#FDA4AF" />
            <circle cx="129" cy="93" r="1.5" fill="#FDA4AF" />
            <circle cx="134" cy="91" r="1.5" fill="#FDA4AF" />
          </g>

          {/* Main Anatomical Body Contour */}
          <path
            d="M 52 42 
               C 62 44, 68 43, 75 44 
               C 92 46, 115 47, 138 45 
               C 148 44, 156 47, 161 52 
               C 165 58, 163 70, 158 76 
               C 152 82, 142 84, 135 84 
               C 118 86, 95 86, 75 83 
               C 60 81, 50 78, 46 70 
               C 42 62, 45 48, 52 42 Z"
            fill="url(#cowBodyGrad)"
            stroke="#E2E8F0"
            strokeWidth="0.8"
          />

          {/* Realistic Black Holstein Patches on Body */}
          {/* Shoulder / Withers Patch */}
          <path
            d="M 58 43 
               C 68 43, 76 45, 82 52 
               C 85 58, 80 66, 72 68 
               C 64 70, 58 64, 52 56 
               C 50 48, 53 44, 58 43 Z"
            fill="#0F172A"
          />

          {/* Large Flank & Spine Patch */}
          <path
            d="M 96 46 
               C 114 47, 126 46, 138 48 
               C 146 50, 148 60, 142 67 
               C 136 74, 124 72, 118 64 
               C 112 56, 104 62, 97 58 
               C 92 54, 92 48, 96 46 Z"
            fill="#0F172A"
          />

          {/* Small Hip Patch */}
          <path
            d="M 152 56 
               C 158 54, 161 62, 159 68 
               C 156 72, 150 70, 150 64 
               C 150 59, 151 57, 152 56 Z"
            fill="#0F172A"
          />

          {/* Belly Soft Contour Highlight */}
          <path
            d="M 56 75 C 75 80, 115 80, 135 77"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />

          {/* 5. NEAR LEGS (Foreground with realistic joint articulation) */}
          {/* Near Front Leg */}
          <g className="cow-front-near-leg">
            {/* Shoulder Muscle Base */}
            <path
              d="M 58 70 
                 C 59 78, 60 88, 59 98 
                 C 58 106, 56 114, 55 122 
                 L 64 122 
                 C 66 114, 67 106, 68 98 
                 C 70 88, 72 78, 71 70 Z"
              fill="url(#nearLegGrad)"
              stroke="#E2E8F0"
              strokeWidth="0.6"
            />
            {/* Front Leg Black Patch */}
            <path
              d="M 59 72 C 64 74, 68 76, 70 80 C 69 86, 62 88, 60 83 Z"
              fill="#0F172A"
            />
            {/* Near Front Dark Hoof with Cleft Detail */}
            <path d="M 54.5 117 L 65 117 L 64.5 123 L 55 123 Z" fill="#1E293B" />
            <line x1="59.5" y1="117" x2="59.5" y2="123" stroke="#0F172A" strokeWidth="0.8" />
          </g>

          {/* Near Back Leg */}
          <g className="cow-back-near-leg">
            {/* Hip & Hock Contour */}
            <path
              d="M 132 68 
                 C 140 76, 144 86, 142 98 
                 C 140 106, 138 114, 137 122 
                 L 146 122 
                 C 148 114, 150 106, 151 96 
                 C 153 84, 148 74, 144 68 Z"
              fill="url(#nearLegGrad)"
              stroke="#E2E8F0"
              strokeWidth="0.6"
            />
            {/* Near Back Hoof with Cleft Detail */}
            <path d="M 136.5 117 L 147 117 L 146.5 123 L 137 123 Z" fill="#1E293B" />
            <line x1="141.5" y1="117" x2="141.5" y2="123" stroke="#0F172A" strokeWidth="0.8" />
          </g>

          {/* 6. REALISTIC COW HEAD, EARS, HORNS & MUZZLE */}
          <g className="cow-head-animated">
            {/* Neck Joint & Muscle */}
            <path
              d="M 48 43 C 44 48, 38 56, 32 62 C 38 68, 48 68, 52 64 C 54 55, 52 47, 48 43 Z"
              fill="url(#cowBodyGrad)"
            />

            {/* Horns (Behind head) */}
            {/* Far Horn */}
            <path
              d="M 36 34 C 34 26, 32 18, 27 15 C 29 20, 32 28, 33 36 Z"
              fill="url(#hornGrad)"
            />
            {/* Near Horn */}
            <path
              d="M 43 32 C 43 23, 41 15, 36 13 C 38 18, 40 26, 40 34 Z"
              fill="url(#hornGrad)"
            />

            {/* Head Skull Shape */}
            <path
              d="M 46 36 
                 C 42 33, 34 35, 27 40 
                 C 22 45, 18 52, 14 58 
                 C 13 63, 17 68, 24 67 
                 C 32 66, 38 64, 44 58 
                 C 48 52, 48 42, 46 36 Z"
              fill="url(#cowBodyGrad)"
              stroke="#E2E8F0"
              strokeWidth="0.6"
            />

            {/* Black Patch Around Eye & Forehead */}
            <path
              d="M 44 37 
                 C 38 36, 32 38, 29 44 
                 C 26 50, 30 56, 37 56 
                 C 42 56, 46 50, 46 44 
                 C 46 40, 45 38, 44 37 Z"
              fill="#0F172A"
            />

            {/* White Forehead Star / Blaze */}
            <path
              d="M 35 41 C 37 38, 39 38, 41 41 C 39 43, 37 43, 35 41 Z"
              fill="#FFFFFF"
            />

            {/* Soft Ear with Pink Inner Tissue */}
            <g transform="rotate(8, 44, 40)">
              <path
                d="M 44 38 C 50 38, 54 44, 52 49 C 48 51, 44 46, 44 38 Z"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="0.5"
              />
              <path
                d="M 45 40 C 49 40, 52 44, 50 47 C 47 48, 45 45, 45 40 Z"
                fill="url(#snoutGrad)"
                opacity="0.8"
              />
            </g>

            {/* Realistic Soft Pink Snout / Muzzle */}
            <path
              d="M 14 57 
                 C 12 59, 11 63, 13 66 
                 C 16 69, 23 69, 25 66 
                 C 26 62, 23 58, 20 57 
                 C 18 56, 15 56, 14 57 Z"
              fill="url(#snoutGrad)"
              stroke="#FDA4AF"
              strokeWidth="0.5"
            />

            {/* Dark Nostril */}
            <ellipse cx="16" cy="62" rx="1.6" ry="2.2" fill="#475569" transform="rotate(-15, 16, 62)" />

            {/* Gentle Expressive Eye */}
            <circle cx="34" cy="46" r="3.2" fill="#0F172A" />
            <circle cx="33.2" cy="45" r="1.1" fill="#FFFFFF" />
            <circle cx="35.2" cy="47" r="0.5" fill="#FFFFFF" opacity="0.8" />
          </g>
        </g>
      </svg>
    </div>
  );
}

BuffaloLoader.propTypes = {
  variant: PropTypes.oneOf(["full", "inline", "button"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "button"]),
  text: PropTypes.string,
  className: PropTypes.string,
};
