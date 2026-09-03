import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import { motion } from "framer-motion";

export default function OfferingProductCard({ image, title }) {
    return (
        <Link to={`/products/${slugify(title)}`} className="block cursor-pointer group">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative h-72 sm:h-80 md:h-96 w-full shadow-[0_12px_35px_rgba(0,0,0,0.1)] rounded-[28px] overflow-hidden border border-white/20 dark:border-gray-700/50 transition-all duration-300 mb-6"
            >
                {/* Full-bleed Product Category Image with Lazy Loading */}
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Bottom-to-Top Black Gradient Shadow Overlay with Bottom-Centered White Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center pb-6 sm:pb-8 px-4 transition-all duration-300 group-hover:from-black">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-md transform group-hover:scale-105 transition-transform duration-300">
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
};
