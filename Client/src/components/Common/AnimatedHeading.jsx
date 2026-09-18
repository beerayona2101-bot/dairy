import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * AnimatedHeading Component
 * Scroll-triggered animation for section headings:
 * - Black / Dark text slides in from the LEFT (x: -70 -> 0)
 * - Violet / Purple text slides in from the RIGHT (x: 70 -> 0)
 */
export default function AnimatedHeading({
  blackText = "",
  violetText = "",
  suffixText = "",
  as = "h2",
  align = "center",
  className = "text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight",
  violetClassName = "text-[#6C5CE7] dark:text-[#A29BFE]",
  children,
}) {
  const Component = motion[as] || motion.h2;

  const getJustifyClass = () => {
    if (align === "left" || className.includes("justify-start") || className.includes("text-left")) {
      return "justify-start text-left";
    }
    if (align === "right" || className.includes("justify-end") || className.includes("text-right")) {
      return "justify-end text-right";
    }
    return "justify-center";
  };

  const leftVariant = {
    hidden: { opacity: 0, x: -45 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const rightVariant = {
    hidden: { opacity: 0, x: 45 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
    },
  };

  // If explicit blackText / violetText props are passed
  if (blackText || violetText) {
    return (
      <Component className={`inline-flex flex-wrap ${getJustifyClass()} items-center gap-x-2.5 ${className}`}>
        {blackText && (
          <motion.span
            variants={leftVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="inline-block"
          >
            {blackText}
          </motion.span>
        )}
        {violetText && (
          <motion.span
            variants={rightVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className={`inline-block ${violetClassName}`}
          >
            {violetText}
          </motion.span>
        )}
        {suffixText && (
          <motion.span
            variants={leftVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="inline-block"
          >
            {suffixText}
          </motion.span>
        )}
      </Component>
    );
  }

  // If children are passed, inspect elements and animate left/right depending on violet color presence
  return (
    <Component className={className}>
      {React.Children.map(children, (child, idx) => {
        if (child === null || child === undefined) return null;

        const childClass = (typeof child === "object" && child?.props?.className) || "";
        const isViolet =
          childClass.includes("#6C5CE7") ||
          childClass.includes("purple") ||
          childClass.includes("violet") ||
          childClass.includes("indigo") ||
          childClass.includes("#A29BFE") ||
          childClass.includes("#805AD5");

        const variant = isViolet ? rightVariant : leftVariant;

        if (React.isValidElement(child)) {
          return (
            <motion.span
              key={idx}
              variants={variant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="inline-block"
            >
              {child}
            </motion.span>
          );
        }

        return (
          <motion.span
            key={idx}
            variants={leftVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="inline-block"
          >
            {child}
          </motion.span>
        );
      })}
    </Component>
  );
}

AnimatedHeading.propTypes = {
  blackText: PropTypes.string,
  violetText: PropTypes.string,
  suffixText: PropTypes.string,
  as: PropTypes.string,
  className: PropTypes.string,
  violetClassName: PropTypes.string,
  children: PropTypes.node,
};
