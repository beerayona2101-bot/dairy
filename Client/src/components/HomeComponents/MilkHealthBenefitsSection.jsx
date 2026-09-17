import { useContext, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
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
            <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-[32px] sm:rounded-[36px] overflow-hidden flex items-center justify-start text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white/40 dark:border-white/10 group bg-white/20 dark:bg-black/30">
                <img
                    src={FARM_HERO_BG}
                    alt="MADHU Dairy Pasture Milk Splash 16:9"
                    className="absolute inset-0 w-full h-full object-cover object-center z-0 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 inline-flex items-center gap-1.5 bg-emerald-600/85 backdrop-blur-md text-white border border-emerald-300/50 text-[10px] sm:text-xs font-black uppercase px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-md tracking-wider"
                >
                    🌱 100% Pure & Organic A2 Dairy
                </motion.div>
                <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl space-y-4 sm:space-y-5 text-left">
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

function StackedDairyPromiseCard({ index, totalCards, scrollYProgress, item, color, isActive }) {
    const rangeCount = Math.max(1, totalCards - 1);
    const step = 1 / rangeCount;

    const startCover = (index - 1) * step;
    const endCover = index * step;

    const startUnder = index * step;
    const endUnder = (index + 1) * step;

    const y = useTransform(
        scrollYProgress,
        index === 0
            ? [0, startUnder, endUnder]
            : [Math.max(0, startCover - 0.001), startCover, endCover, Math.min(1, endUnder)],
        index === 0
            ? ["0px", "0px", "-15px"]
            : ["100vh", "100vh", "0px", "-15px"],
        { clamp: true }
    );

    const scale = useTransform(
        scrollYProgress,
        [startUnder, endUnder],
        [1, 0.96],
        { clamp: true }
    );

    const opacity = useTransform(
        scrollYProgress,
        index === 0 
            ? [0, 1]
            : [Math.max(0, startCover), Math.min(1, startCover + step * 0.15)],
        index === 0 
            ? [1, 1]
            : [0, 1],
        { clamp: true }
    );

    const isEven = index % 2 === 0;

    return (
        <motion.div
            style={{
                y,
                scale,
                opacity,
                zIndex: (index + 1) * 10,
            }}
            className="absolute inset-0 m-auto w-full max-w-6xl h-fit flex items-center justify-center transform-gpu will-change-transform px-2 sm:px-4"
        >
            <div
                className={`w-full min-h-[460px] sm:min-h-[480px] md:min-h-0 rounded-[24px] sm:rounded-[28px] md:rounded-[36px] bg-[#FFFDF7] dark:bg-[#1c1c1e] shadow-[0_10px_35px_rgba(23,63,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-5 sm:p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-center relative overflow-hidden transition-all duration-300`}
            >
                <div
                    style={{ backgroundColor: color }}
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none"
                />

                <div className={`lg:col-span-7 space-y-3 sm:space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#E8F5E9] dark:bg-slate-800 border border-[#477A50]/20 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                            <CheckCircleIcon style={{ color: color }} sx={{ fontSize: "1.2rem" }} />
                        </div>
                        <span
                            style={{ color: color }}
                            className="text-xs font-extrabold uppercase tracking-widest bg-[#E8F5E9] dark:bg-slate-800 px-3 py-1 rounded-full border border-[#477A50]/20 dark:border-slate-700"
                        >
                            Purity Guarantee #{index + 1}
                        </span>
                    </div>

                    <div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#173F2A] dark:text-white leading-tight tracking-tight">
                            {item.title || item.name}
                        </h3>
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-3 font-medium">
                        {item.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="text-xs font-extrabold text-[#173F2A] dark:text-emerald-300 bg-[#E8F5E9] dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-[#477A50]/20 dark:border-emerald-800">
                            100% Quality Assured
                        </span>
                        <span className="text-xs font-extrabold text-[#477A50] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                            Farm Fresh Daily
                        </span>
                    </div>
                </div>

                <div className={`lg:col-span-5 flex items-center justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="w-full relative rounded-xl sm:rounded-2xl overflow-hidden h-52 sm:h-60 md:h-64 bg-slate-100 dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700 group">
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
            </div>
        </motion.div>
    );
}

export function DairyPromiseCardsSection() {
    const { pageContent } = useContext(PageContentContext);
    const sectionRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const displayCompanyName = pageContent?.companyName || company?.name || "MADHU Dairy & Daily Needs";
    const displayGoodness = (pageContent?.goodnessOfferings && pageContent.goodnessOfferings.length > 0)
        ? pageContent.goodnessOfferings
        : defaultFeatures;

    const totalCards = displayGoodness.length;

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const rangeCount = Math.max(1, totalCards - 1);
        const rawIdx = Math.round(latest * rangeCount);
        const clampedIdx = Math.min(totalCards - 1, Math.max(0, rawIdx));
        if (clampedIdx !== activeIndex) {
            setActiveIndex(clampedIdx);
        }
    });

    const accentColors = ["#477A50", "#00ACC1", "#6C5CE7", "#D6A84F", "#FF7675", "#0284C7"];
    const sectionHeight = `${totalCards * 45}vh`;

    return (
        <section
            ref={sectionRef}
            style={{ height: sectionHeight }}
            className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
        >
            <div className="sticky top-[64px] sm:top-[72px] w-full flex flex-col items-center justify-start pt-3 sm:pt-6 pb-6">
                
                {/* 1. STICKY HEADING - Clean with generous gap below */}
                <div className="text-center space-y-1.5 sm:space-y-2 max-w-3xl mx-auto px-4 shrink-0 z-40 mb-6 sm:mb-8 md:mb-10">
                    <AnimatedHeading
                        blackText="Our Promise of Dairy"
                        violetText="Excellence"
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-center"
                    />

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 leading-relaxed font-semibold max-w-xl mx-auto line-clamp-1">
                        Every product is crafted with care, strict cold-chain hygiene, and ethical farm sourcing.
                    </p>
                </div>

                {/* 2. OVERLAPPING CARDS STAGE - Generous compact height directly below heading */}
                <div className="relative w-full max-w-6xl mx-auto h-[560px] sm:h-[580px] md:h-[440px] lg:h-[460px] flex items-center justify-center">
                    {displayGoodness.map((item, idx) => {
                        const color = accentColors[idx % accentColors.length];
                        const isActive = idx === activeIndex;

                        return (
                            <StackedDairyPromiseCard
                                key={`promise-card-${idx}`}
                                index={idx}
                                totalCards={totalCards}
                                scrollYProgress={scrollYProgress}
                                item={item}
                                color={color}
                                isActive={isActive}
                            />
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

export default function MilkHealthBenefitsSection() {
    return <MilkHealthBenefitsHero />;
}
