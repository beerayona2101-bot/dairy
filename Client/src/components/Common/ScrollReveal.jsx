import { motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * ScrollReveal Component
 * Smoothly reveals child elements from bottom with slow, elegant fade-up effect on scroll.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.85,
  yOffset = 45,
  className = "",
  once = true,
  amount = 0.15,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Slow & ultra-smooth custom easeOut curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

ScrollReveal.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  yOffset: PropTypes.number,
  className: PropTypes.string,
  once: PropTypes.bool,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
