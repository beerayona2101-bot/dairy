import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import { motion } from "framer-motion";

export default function OfferingProductCard({ image, title, hideNameOnWeb = false, className = "" }) {
    const cardRef = useRef(null);
    const [transformStyle, setTransformStyle] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handlePointerMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        const rotateX = ((y - 0.5) * -16).toFixed(2);
        const rotateY = ((x - 0.5) * 16).toFixed(2);

        setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`);
        setSpotlightPos({ x: (x * 100).toFixed(1), y: (y * 100).toFixed(1) });
        setIsHovered(true);
    };

    const handlePointerLeave = () => {
        setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
        setIsHovered(false);
    };

    return (
        <Link to={`/products/${slugify(title)}`} className="block cursor-pointer group select-none">
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerLeave}
                onTouchMove={handlePointerMove}
                onTouchStart={handlePointerMove}
                onTouchEnd={handlePointerLeave}
                style={{
                    transform: transformStyle,
                    transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    transformStyle: "preserve-3d",
                }}
                className={`relative ${className || "h-44 sm:h-64 md:h-80 lg:h-96"} w-full shadow-md sm:shadow-[0_16px_40px_rgba(0,0,0,0.12)] rounded-2xl sm:rounded-[24px] overflow-hidden border border-white/40 dark:border-gray-700/60 transition-all duration-300 floating-border-light periodic-glass-shine ${isHovered ? 'active-touch' : ''}`}
            >
                {/* Dynamic Mouse & Touch Cursor Spotlight Glow Effect */}
                <div
                    className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(350px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(255, 255, 255, 0.25), transparent 80%)`,
                    }}
                />

                {/* Full-bleed Product Category Image with Lazy Loading */}
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Bottom Dark Gradient Shade for optimal text contrast without pill card */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/45 z-10" />

                {/* On-Image Category Title Overlay - Clean Direct Text on Bottom Gradient */}
                <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 inset-x-0 z-20 flex items-center justify-center px-3 text-center pointer-events-none">
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-105">
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
