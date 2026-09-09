import React from "react";
import PropTypes from "prop-types";

/**
 * FloatingBorderCard
 * A reusable container component that adds a futuristic, floating perimeter border light effect
 * to any card component on mouse hover.
 */
export default function FloatingBorderCard({ children, className = "", style = {}, ...props }) {
  return (
    <div
      className={`floating-border-light ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

FloatingBorderCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};
