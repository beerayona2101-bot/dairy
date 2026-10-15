import { useState } from "react";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from "@mui/icons-material";
import PropTypes from "prop-types";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionAnswer({ question, answer, isOpen, onToggle }) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isExpanded = typeof isOpen === "boolean" ? isOpen : internalExpanded;

  const toggleExpand = () => {
    if (typeof onToggle === "function") {
      onToggle();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  if (!question || !answer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`mb-4 rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded
          ? "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-blue-400/60 dark:border-blue-500/60 shadow-xl ring-2 ring-blue-500/20"
          : "bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/70 dark:border-gray-700/60 shadow-sm hover:shadow-md hover:bg-white/60 dark:hover:bg-gray-800/60 hover:border-blue-300/50"
      }`}
    >
      <button
        onClick={toggleExpand}
        className="w-full flex justify-between items-center px-5 py-4 text-left transition-colors duration-200 cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={`faq-content-${question}`}
      >
        <h3
          className={`text-base sm:text-lg font-bold transition-colors duration-200 pr-4 ${
            isExpanded
              ? "text-[#1E88E5] dark:text-blue-300"
              : "text-gray-800 dark:text-gray-100"
          }`}
        >
          {question}
        </h3>
        <div
          className={`p-1.5 rounded-full transition-transform duration-300 flex items-center justify-center ${
            isExpanded
              ? "rotate-180 bg-blue-100 dark:bg-blue-900/50 text-[#1E88E5] dark:text-blue-300"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          }`}
        >
          <ExpandMoreIcon className="w-5 h-5" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`faq-content-${question}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 py-4 text-gray-700 dark:text-gray-200 text-sm leading-relaxed border-t border-white/50 dark:border-gray-700/50 bg-white/20 dark:bg-gray-900/30">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

QuestionAnswer.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
};
