import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function AdminAccordion({
  title,
  subtitle,
  icon,
  badgeCount,
  defaultExpanded = false,
  children,
  headerExtra,
  className = "",
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleAccordion = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden shadow-xs transition-all duration-300 ${className}`}
    >
      {/* Accordion Header Bar */}
      <div
        onClick={toggleAccordion}
        className="w-full p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleAccordion();
          }
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate">
                {title}
              </h3>
              {badgeCount !== undefined && badgeCount !== null && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                  {badgeCount}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {headerExtra && <div onClick={(e) => e.stopPropagation()}>{headerExtra}</div>}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 flex items-center justify-center"
          >
            <ChevronRightIcon className={`transform transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
          </motion.div>
        </div>
      </div>

      {/* Accordion Body Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700/60"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

AdminAccordion.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  badgeCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  defaultExpanded: PropTypes.bool,
  children: PropTypes.node.isRequired,
  headerExtra: PropTypes.node,
  className: PropTypes.string,
};
