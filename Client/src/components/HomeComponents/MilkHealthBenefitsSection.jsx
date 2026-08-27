import { useContext } from "react";
import { motion } from "framer-motion";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import { features as defaultFeatures } from "../../data/productGoodness ";
import company from "../../data/company.json";
import landingHeroBgHD from "../../assets/landing_hero_bg_hd.png";

// 4K Ultra-High Resolution Pasture Liquid Milk Hero Background
const FARM_HERO_BG = landingHeroBgHD;

export function MilkHealthBenefitsHero() {
    const { pageContent } = useContext(PageContentContext);

    const displayCompanyName = pageContent?.companyName || company?.name || "Madhur Dairy & Daily Needs";
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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-4 sm:pb-6">
            {/* Glassmorphic Hero Card Container with Rounded Corners & Borders */}
            <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] rounded-[32px] sm:rounded-[36px] overflow-hidden flex items-center justify-start text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white/40 dark:border-white/10 group bg-white/20 dark:bg-black/30">
                
                {/* 4K Hero Background Image with Subtle Hover Zoom */}
                <img
                    src={FARM_HERO_BG}
                    alt="Madhur Dairy Pasture Milk Splash 16:9"
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

    const displayCompanyName = pageContent?.companyName || company?.name || "Madhur Dairy & Daily Needs";
    const displayGoodness = (pageContent?.goodnessOfferings && pageContent.goodnessOfferings.length > 0)
        ? pageContent.goodnessOfferings
        : defaultFeatures;

    const accentColors = ["#00B894", "#00ACC1", "#6C5CE7", "#F59E0B", "#FF7675", "#0284C7"];
    const bgGlows = [
        "from-emerald-500/20 to-teal-500/10",
        "from-cyan-500/20 to-blue-500/10",
        "from-purple-500/20 to-indigo-500/10",
        "from-amber-500/20 to-yellow-500/10",
        "from-rose-500/20 to-pink-500/10",
        "from-sky-500/20 to-blue-500/10"
    ];

    return (
        <section className="w-full py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
            {/* SECTION TITLE: CONSUMING USER GOODNESS OFFERINGS DATA */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 bg-[#6C5CE7]/10 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#6C5CE7]/20"
                >
                    <VerifiedIcon sx={{ fontSize: "0.9rem" }} />
                    <span>Why Choose {displayCompanyName}?</span>
                </motion.div>
                
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight"
                >
                    Our Promise of Dairy Excellence
                </motion.h2>

                <p className="text-sm sm:text-base text-[#718096] dark:text-gray-300 leading-relaxed font-medium">
                    Every product is crafted with care, strict cold-chain hygiene, and ethical farm sourcing for your family's health.
                </p>
            </div>

            {/* 6 GLASSMORPHIC FEATURE CARDS GRID */}
            <div className="space-y-6 sm:space-y-8">
                {displayGoodness.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    const color = accentColors[idx % accentColors.length];
                    const bgGlow = bgGlows[idx % bgGlows.length];

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`rounded-[32px] bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 p-6 sm:p-8 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(30,136,229,0.18)] hover:-translate-y-2 hover:border-blue-400/50 hover:bg-white/85 dark:hover:bg-gray-800/85 transition-all duration-200 ease-out grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative overflow-hidden cursor-pointer`}
                        >
                            {/* Ambient Color Glow */}
                            <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-64 h-64 bg-gradient-to-br ${bgGlow} filter blur-3xl rounded-full opacity-60 pointer-events-none`} />

                            {/* TEXT CONTENT COLUMN (7 cols) */}
                            <div className={`lg:col-span-7 space-y-4 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-700 shadow-md border border-gray-100 dark:border-gray-600 flex items-center justify-center shrink-0">
                                        <CheckCircleIcon style={{ color: color }} sx={{ fontSize: "1.4rem" }} />
                                    </div>
                                    <span style={{ color: color }} className="text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                                        Purity Guarantee #0{idx + 1}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-[#2D3748] dark:text-white leading-tight">
                                        {item.title || item.name}
                                    </h3>
                                </div>

                                <p className="text-xs sm:text-sm text-[#718096] dark:text-gray-300 leading-relaxed font-medium">
                                    {item.description}
                                </p>

                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[11px] font-extrabold text-[#6C5CE7] bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800">
                                        100% Quality Assured
                                    </span>
                                    <span className="text-[11px] font-extrabold text-[#00B894] bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                                        Farm Fresh Daily
                                    </span>
                                </div>
                            </div>

                            {/* VISUAL IMAGE COLUMN (5 cols) */}
                            <div className={`lg:col-span-5 flex items-center justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                                <div className="w-full relative rounded-2xl overflow-hidden h-44 sm:h-52 bg-gray-100 dark:bg-gray-700 shadow-md border border-white dark:border-gray-600">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 text-4xl">
                                            🥛
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                                        <span className="text-white text-xs font-bold flex items-center gap-1.5">
                                            <LocalShippingIcon sx={{ fontSize: "1rem" }} className="text-amber-300" />
                                            {item.title || item.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

export default function MilkHealthBenefitsSection() {
    return <MilkHealthBenefitsHero />;
}
