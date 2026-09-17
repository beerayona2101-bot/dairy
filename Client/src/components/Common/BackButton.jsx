import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppBack } from "../../hooks/useAppBack";

export default function BackButton({
  fallbackPath = "/home",
  label = "Back",
  title = "Go Back",
  className = "",
  variant = "pill", // 'pill' | 'circle' | 'text' | 'glass'
  hideOnWeb = true,
  onClick,
}) {
  const goBack = useAppBack(fallbackPath);

  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onClick === "function") {
      onClick(e);
    }
    goBack(fallbackPath);
  };

  const webHideClass = hideOnWeb ? "md:hidden" : "";

  if (variant === "circle") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={title}
        aria-label={label || title || "Go back"}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-white shadow-md hover:scale-105 active:scale-95 transition cursor-pointer ${webHideClass} ${className}`}
      >
        <ArrowBackIcon sx={{ fontSize: "1.15rem" }} className="text-[#6C5CE7] dark:text-[#A78BFA]" />
      </button>
    );
  }

  if (variant === "glass") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={title}
        aria-label={label || title || "Go back"}
        className={`flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 bg-black/40 hover:bg-black/60 active:scale-95 border border-white/30 rounded-full sm:rounded-xl text-white backdrop-blur-md transition-all cursor-pointer shadow-md text-xs sm:text-sm font-extrabold ${webHideClass} ${className}`}
      >
        <ArrowBackIcon sx={{ fontSize: "1.1rem" }} />
        {label && <span className="hidden sm:inline">{label}</span>}
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={title}
        aria-label={label || title || "Go back"}
        className={`inline-flex items-center justify-center gap-1.5 p-1 sm:p-0 text-xs sm:text-sm font-bold text-[#6C5CE7] dark:text-[#A78BFA] hover:underline cursor-pointer active:scale-95 transition-all ${webHideClass} ${className}`}
      >
        <ArrowBackIcon sx={{ fontSize: "1.1rem" }} />
        {label && <span className="hidden sm:inline">{label}</span>}
      </button>
    );
  }

  // Default 'pill' variant matching mobile header back buttons
  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={label || title || "Go back"}
      className={`flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 active:scale-95 rounded-full sm:rounded-xl text-purple-700 dark:text-purple-300 transition-all text-xs font-black cursor-pointer border border-purple-200/60 dark:border-purple-800/60 shadow-xs ${webHideClass} ${className}`}
    >
      <ArrowBackIcon sx={{ fontSize: "1.15rem" }} className="text-[#6C5CE7] dark:text-[#A78BFA]" />
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
