import PropTypes from "prop-types";

export default function DiscountBadge({
  discount,
  className = "",
  containerClassName = "",
  isFloating = false,
  size = "md",
}) {
  const discountVal = Number(discount) || 0;
  if (discountVal <= 0) return null;

  const sizeClasses = {
    sm: "text-[9px] sm:text-[10px] px-1.5 py-0.5",
    md: "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5",
    lg: "text-xs sm:text-sm px-2.5 py-1",
  }[size] || "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5";

  const badgeContent = (
    <span
      className={`inline-flex items-center justify-center bg-[#FEF9C3] dark:bg-yellow-400/95 text-[#854D0E] dark:text-yellow-950 font-black rounded-full border border-[#FDE047] shadow-xs tracking-wide select-none ${sizeClasses} ${className}`}
    >
      {discountVal}% OFF
    </span>
  );

  if (isFloating) {
    return (
      <div
        className={`absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none select-none ${containerClassName}`}
      >
        {badgeContent}
      </div>
    );
  }

  return badgeContent;
}

DiscountBadge.propTypes = {
  discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  isFloating: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};
