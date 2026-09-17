import React from "react";
import PropTypes from "prop-types";
import CheckIcon from '@mui/icons-material/Check';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { slugify } from "../../utils/slugify";
import userPeekingCowImg from "../../assets/user_peeking_cow.png";

export function CowDecoration({ isReversed }) {
    return (
        <div
            className={`absolute z-20 pointer-events-none transition-transform duration-300 group-hover/card:scale-105 ${
                isReversed 
                    ? 'bottom-1 sm:bottom-2 left-1 sm:left-2 md:left-3' 
                    : 'bottom-1 sm:bottom-2 right-1 sm:right-2 md:right-3'
            }`}
        >
            {/* Soft White Shade & Radial Glow Backdrop (Enhances cow visibility in dark mode) */}
            <div 
                className="absolute inset-0 m-auto w-[85%] h-[85%] rounded-full blur-xl dark:blur-2xl opacity-90 dark:opacity-95 pointer-events-none -z-10 transition-all duration-300 group-hover/card:scale-110"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0) 80%)'
                }}
            />
            {/* Secondary soft white glow ring for extra depth */}
            <div className="absolute inset-0 m-auto w-[70%] h-[70%] rounded-full bg-white/60 dark:bg-white/50 blur-md pointer-events-none -z-10" />

            <img
                src={userPeekingCowImg}
                alt="Peeking Cow Head"
                loading="lazy"
                decoding="async"
                className={`w-14 sm:w-24 md:w-36 h-auto object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] ${
                    isReversed ? 'transform -scale-x-100' : ''
                }`}
            />
        </div>
    );
}

export function ProductImage({ image, title, targetPath }) {
    return (
        <Link 
            to={targetPath} 
            className="w-full md:w-[46%] h-60 sm:h-64 md:h-64 lg:h-72 rounded-xl sm:rounded-[22px] overflow-hidden flex-shrink-0 relative group shadow-sm sm:shadow-md bg-white/30 dark:bg-slate-800/30 backdrop-blur-md block cursor-pointer z-10 border border-white/60 dark:border-white/10"
        >
            <img
                src={image}
                alt={title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
            />
            {/* Subtle glass reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
        </Link>
    );
}

export function ProductBenefits({ features }) {
    const defaultFeatures = [
        "100% Pure & Fresh",
        "Quality Guaranteed"
    ];
    const displayFeatures = (Array.isArray(features) && features.length > 0) ? features : defaultFeatures;

    return (
        <ul className="space-y-1.5 sm:space-y-2 py-1">
            {displayFeatures.slice(0, 3).map((feature, i) => (
                <li
                    key={i}
                    className="flex items-center text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                >
                    <span className="mr-2 flex items-center justify-center w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-amber-500/20 dark:bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 flex-shrink-0 backdrop-blur-sm">
                        <CheckIcon sx={{ fontSize: "0.8rem" }} />
                    </span>
                    <span className="truncate">{feature}</span>
                </li>
            ))}
        </ul>
    );
}

export function ProductInfo({ title, description, targetPath, features }) {
    return (
        <div className="w-full md:w-[50%] p-3 sm:p-5 md:p-6 flex flex-col justify-center z-10 relative space-y-3 sm:space-y-4">
            <Link to={targetPath} className="block hover:text-[#2563EB] dark:hover:text-sky-300 transition-colors cursor-pointer">
                <h3 className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    {title}
                </h3>
            </Link>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3 font-semibold">
                {description || `Pure, fresh, high-quality ${title} products delivered daily.`}
            </p>

            <ProductBenefits features={features} />

            <Link 
                to={targetPath} 
                className="inline-flex items-center gap-1.5 w-fit text-xs sm:text-sm font-black text-[#2563EB] dark:text-sky-400 hover:text-[#1D4ED8] dark:hover:text-sky-300 hover:underline underline-offset-4 pt-1 transition-all"
            >
                <span>View More</span>
                <span>&rarr;</span>
            </Link>
        </div>
    );
}

export default function ProductCard({ title, description, image, features, isReversed = false, isStacked = false }) {
    const targetPath = `/products/${slugify(title)}`;
    const cardRef = React.useRef(null);
    const [transformStyle, setTransformStyle] = React.useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    const [spotlightPos, setSpotlightPos] = React.useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = React.useState(false);

    const handlePointerMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        const rotateX = ((y - 0.5) * -12).toFixed(2);
        const rotateY = ((x - 0.5) * 12).toFixed(2);

        setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        setSpotlightPos({ x: (x * 100).toFixed(1), y: (y * 100).toFixed(1) });
        setIsHovered(true);
    };

    const handlePointerLeave = () => {
        setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
        setIsHovered(false);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
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
            className={`relative w-full min-h-[460px] sm:min-h-[480px] md:min-h-0 ${
                isStacked
                    ? "bg-[#FFFDF7] dark:bg-[#1c1c1e] shadow-[0_10px_35px_rgba(23,63,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                    : "bg-white/60 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/80 dark:border-neutral-800 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(30,136,229,0.18)] hover:border-blue-400/50 hover:bg-white/85 dark:hover:bg-[#1c1c1e]"
            } p-5 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] transition-all duration-200 ease-out flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-4 sm:gap-6 md:gap-10 overflow-hidden cursor-pointer ${isHovered ? 'active-touch' : ''}`}
        >
            {/* Dynamic Mouse & Touch Cursor Spotlight Glow */}
            <div
                className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(450px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(108, 92, 231, 0.15), transparent 80%)`,
                }}
            />

            {/* Glass Ambient Glow backdrop */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-emerald-500/5 rounded-[30px] blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Exact User Uploaded Peeking Cow Head Image */}
            <CowDecoration isReversed={isReversed} />

            {/* Product Image Component */}
            <ProductImage image={image} title={title} targetPath={targetPath} />

            {/* Product Information Component */}
            <ProductInfo title={title} description={description} targetPath={targetPath} features={features} />

        </motion.div>
    );
}

ProductCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string),
    isReversed: PropTypes.bool,
    isStacked: PropTypes.bool,
};

CowDecoration.propTypes = {
    isReversed: PropTypes.bool,
};

ProductImage.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    targetPath: PropTypes.string.isRequired,
};

ProductBenefits.propTypes = {
    features: PropTypes.arrayOf(PropTypes.string),
};

ProductInfo.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    targetPath: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string),
};
