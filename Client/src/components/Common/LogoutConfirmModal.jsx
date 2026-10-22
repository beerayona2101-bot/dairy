import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

/**
 * LogoutConfirmModal
 * A confirmation modal displayed before logging out across web and mobile web views.
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Invoked when user cancels or dismisses
 * @param {function} onConfirm - Invoked when user confirms logout
 * @param {string} [role="user"] - "user" or "admin"
 * @param {string} [userEmail] - Account email or display name to show in the confirmation
 * @param {string} [title] - Custom dialog title (default "Log Out?")
 * @param {string} [message] - Custom description message
 */
export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  role = "user",
  userEmail = "",
  title,
  message,
}) {
  // Close on Escape key & manage scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultTitle = role === "admin" ? "Log Out of Admin?" : "Log Out?";
  const defaultMessage =
    role === "admin"
      ? "Are you sure you want to log out of the admin management console?"
      : "Are you sure you want to log out of your account?";

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
    >
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Confirmation Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] text-center transform transition-all duration-300 animate-in zoom-in-95"
      >
        {/* Top Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Animated Red Icon Squircle Badge */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/60 dark:to-rose-950/40 border-2 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10 dark:shadow-red-950/50">
          <div className="absolute inset-0 rounded-3xl bg-red-500/10 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          <LogOut size={32} strokeWidth={2.4} className="relative z-10 translate-x-0.5" />
        </div>

        {/* Heading */}
        <h3
          id="logout-confirm-title"
          className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight"
        >
          {title || defaultTitle}
        </h3>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium mt-2 leading-relaxed">
          {message || defaultMessage}
        </p>

        {/* User identification badge */}
        {userEmail && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-3 rounded-full bg-gray-100 dark:bg-slate-800/90 border border-gray-200/80 dark:border-slate-700/70 text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-full truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="truncate">{userEmail}</span>
          </div>
        )}

        <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-2">
          You can log back in anytime with your credentials.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 sm:py-3.5 px-4 rounded-2xl border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold text-sm sm:text-base transition-all duration-200 active:scale-95 cursor-pointer shadow-xs hover:shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm sm:text-base transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-red-500/25 hover:shadow-red-500/40 flex items-center justify-center gap-2"
          >
            <LogOut size={18} strokeWidth={2.4} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
