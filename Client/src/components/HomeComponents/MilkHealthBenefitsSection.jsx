import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import { features as defaultFeatures } from "../../data/productGoodness ";
import company from "../../data/company.json";
import landingHeroBgHD from "../../assets/landing_hero_bg_hd.png";
import AnimatedHeading from "../Common/AnimatedHeading";

// 4K Ultra-High Resolution Pasture Liquid Milk Hero Background
const FARM_HERO_BG = landingHeroBgHD;

export function MilkHealthBenefitsHero() {
    const { pageContent } = useContext(PageContentContext);

    const displayCompanyName = pageContent?.companyName || company?.name || "MADHU Dairy & Daily Needs";
    const displayTagline = pageContent?.companyTagline || company?.tagline || "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep";

    let mainTitle = displayCompanyName;
    let subTitle = "";
    if (/dairy/i.test(displayCompanyName)) {
        const match = displayCompanyName.match(/^(.*?dairy)\s*(&(?:amp;)?|\band\b)?\s*(.*)$/i);
        if (match) {
            mainTitle = match[1];
            const connector = match[2] ? match[2].toUpperCase() : "AND";
            const rest = match[3];
            subTitle = rest ? `${connector} ${rest}` : "";
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-4 sm:pb-6">
            {/* Glassmorphic Hero Card Container with Rounded Corners & Borders */}
            <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-[32px] sm:rounded-[36px] overflow-hidden flex items-center justify-start text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white/40 dark:border-white/10 group bg-white/20 dark:bg-black/30">
                
                {/* 4K Hero Background Image with Subtle Hover Zoom */}
                <img
                    src={FARM_HERO_BG}
                    alt="MADHU Dairy Pasture Milk Splash 16:9"
                    className="absolute inset-0 w-full h-full object-cover object-center z-0 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Compact Glassmorphic Pill Badge in Bottom Right Side */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 inline-flex items-center gap-1.5 bg-emerald-600/85 backdrop-blur-md text-white border border-emerald-300/50 text-[10px] sm:text-xs font-black uppercase px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-md tracking-wider"
                >
                    🌱 100% Pure & Organic A2 Dairy
                </motion.div>

                {/* Left Text Matter Layer (Consuming User Brand & Details) */}
                <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl space-y-4 sm:space-y-5 text-left">

                    {/* High-Contrast Eye-Capturing Brand Name in Logo Color & Typography */}
                    <motion.div
                        initial={{ y: 15, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="block font-serif uppercase tracking-[0.12em]"
                    >
                        <span className="block text-3xl sm:text-5xl lg:text-6xl font-[900] leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                            {mainTitle}
                        </span>
                        {subTitle && (
                            <span className="block text-base sm:text-2xl lg:text-3xl font-[900] tracking-[0.18em] text-amber-300 dark:text-yellow-300 drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)] mt-2">
                                {subTitle}
                            </span>
                        )}
                    </motion.div>



                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="pt-2"
                    >
                        <Link
                            to="/products"
                            className="bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black uppercase text-xs sm:text-sm tracking-widest px-8 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(132,204,22,0.6)] hover:scale-105 transition-all duration-300 border border-lime-300 inline-flex items-center gap-2 cursor-pointer"
                        >
                            <span>Get Started</span>
                            <span className="text-base">→</span>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export function DairyPromiseCardsSection() {
    const { pageContent } = useContext(PageContentContext);
    const sectionRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const displayCompanyName = pageContent?.companyName || company?.name || "MADHU Dairy & Daily Needs";
    const displayGoodness = (pageContent?.goodnessOfferings && pageContent.goodnessOfferings.length > 0)
        ? pageContent.goodnessOfferings
        : defaultFeatures;

    const totalCards = displayGoodness.length;

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const totalScrollable = rect.height - windowHeight;
            if (totalScrollable <= 0) return;

            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
            setScrollProgress(progress);

            const cardStep = 1 / totalCards;
            const rawIndex = Math.floor(progress * totalCards);
            const currentIdx = Math.min(totalCards - 1, Math.max(0, rawIndex));
            setActiveIndex(currentIdx);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [totalCards]);

    const accentColors = ["#477A50", "#00ACC1", "#6C5CE7", "#D6A84F", "#FF7675", "#0284C7"];

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-[340vh] sm:min-h-[400vh] py-4 px-3 sm:px-6 lg:px-8 transition-colors duration-300"
        >
            {/* 1. CENTRALIZED HEADING (NO CARD BOX WRAPPER, NO BORDER, NO BACKGROUND, NO DOTS/NUMBERS, NOT STICKY) */}
            <div className="text-center space-y-3 max-w-3xl mx-auto px-4 pt-4 pb-8">
                <div className="inline-flex items-center gap-2 bg-[#6C5CE7]/10 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#6C5CE7]/20">
                    <VerifiedIcon sx={{ fontSize: "0.9rem" }} />
                    <span>Why Choose {displayCompanyName}?</span>
                </div>
                
                <AnimatedHeading
                    blackText="Our Promise of Dairy"
                    violetText="Excellence"
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                />

                <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-gray-200 leading-relaxed font-semibold max-w-2xl mx-auto">
                    Every product is crafted with care, strict cold-chain hygiene, and ethical farm sourcing for your family's health.
                </p>
            </div>

            {/* 2. STICKY STACKING CARDS DECK UNDER HEADING */}
            <div className="max-w-6xl mx-auto relative w-full pt-1">
                {displayGoodness.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    const color = accentColors[idx % accentColors.length];
                    const cardStep = 1 / totalCards;
                    const cardNext = (idx + 1) * cardStep;

                    // Calculate depth for cards receding behind newer cards
                    let depth = 0;
                    if (scrollProgress > cardNext) {
                        depth = Math.min(3, (scrollProgress - cardNext) / cardStep);
                    }

                    const scale = Math.max(0.93, 1 - depth * 0.035);
                    const opacity = Math.max(0.75, 1 - depth * 0.08);
                    const brightness = Math.max(0.85, 1 - depth * 0.05);
                    const isActive = idx === activeIndex;

                    // Sticky top offset below fixed header (navbar height ~74px)
                    const topOffsetDesktop = 96 + idx * 12;

                    return (
                        <div
                            key={idx}
                            style={{
                                top: `${topOffsetDesktop}px`,
                                zIndex: (idx + 1) * 10,
                            }}
                            className="sticky transition-all duration-200 ease-out mb-8 sm:mb-12"
                        >
                            <motion.div
                                style={{
                                    transform: `scale(${scale})`,
                                    opacity: opacity,
                                    filter: `brightness(${brightness})`,
                                }}
                                className={`w-full rounded-[28px] sm:rounded-[36px] bg-[#FFFDF7] dark:bg-slate-900 border-2 ${
                                    isActive
                                        ? "border-[#477A50]/40 dark:border-emerald-500/40 shadow-[0_20px_50px_rgba(23,63,42,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                                        : "border-slate-200/80 dark:border-slate-800 shadow-md"
                                } p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center relative overflow-hidden transition-transform duration-300`}
                            >
                                {/* Subtle Ambient Color Glow */}
                                <div
                                    style={{ backgroundColor: color }}
                                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none"
                                />

                                {/* TEXT CONTENT COLUMN (7 cols) */}
                                <div className={`lg:col-span-7 space-y-3.5 sm:space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E8F5E9] dark:bg-slate-800 border border-[#477A50]/20 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                                            <CheckCircleIcon style={{ color: color }} sx={{ fontSize: "1.35rem" }} />
                                        </div>
                                        <span
                                            style={{ color: color }}
                                            className="text-xs font-extrabold uppercase tracking-widest bg-[#E8F5E9] dark:bg-slate-800 px-3 py-1 rounded-full border border-[#477A50]/20 dark:border-slate-700"
                                        >
                                            Purity Guarantee #0{idx + 1}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#173F2A] dark:text-white leading-tight tracking-tight">
                                            {item.title || item.name}
                                        </h3>
                                    </div>

                                    <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                                        <span className="text-[11px] font-extrabold text-[#173F2A] dark:text-emerald-300 bg-[#E8F5E9] dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-[#477A50]/20 dark:border-emerald-800">
                                            100% Quality Assured
                                        </span>
                                        <span className="text-[11px] font-extrabold text-[#477A50] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                            Farm Fresh Daily
                                        </span>
                                    </div>
                                </div>

                                {/* VISUAL IMAGE COLUMN (5 cols) */}
                                <div className={`lg:col-span-5 flex items-center justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                                    <div className="w-full relative rounded-2xl overflow-hidden h-48 sm:h-56 md:h-64 bg-slate-100 dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700 group">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title || item.name}
                                                loading="lazy"
                                                className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                                                    isActive ? "scale-105" : "scale-100"
                                                }`}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-slate-800 dark:to-slate-700 text-5xl">
                                                🥛
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                                            <span className="text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-md">
                                                <LocalShippingIcon sx={{ fontSize: "1rem" }} className="text-[#D6A84F]" />
                                                {item.title || item.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function MilkHealthBenefitsSection() {
    return <MilkHealthBenefitsHero />;
}
