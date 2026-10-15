import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function OfferingProductCard({ image, title, className = "" }) {
    return (
        <Link to={`/products/${slugify(title)}`} className="block cursor-pointer select-none">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.025, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`relative ${className || "h-44 sm:h-64 md:h-80 lg:h-96"} w-full shadow-md sm:shadow-[0_16px_40px_rgba(0,0,0,0.12)] rounded-2xl sm:rounded-[24px] overflow-hidden border border-white/40 dark:border-gray-700/60 floating-border-light periodic-glass-shine`}
            >
                {/* Full-bleed Product Category Image with Lazy Loading */}
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                />

                {/* Bottom Dark Gradient Shade for optimal text contrast without pill card */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/45 z-10" />

                {/* On-Image Category Title Overlay - Clean Direct Text on Bottom Gradient */}
                <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 inset-x-0 z-20 flex items-center justify-center px-3 text-center pointer-events-none">
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                        {title}
                    </h3>
                </div>
            </motion.div>
        </Link>
    );
}

OfferingProductCard.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    hideNameOnWeb: PropTypes.bool,
    className: PropTypes.string,
};
