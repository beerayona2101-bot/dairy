import { useState, useEffect, useRef, useCallback, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import slide1Img from "../../assets/hero_carousel_slide_1.jpg";
import slide2Img from "../../assets/hero_carousel_slide_2.jpg";
import slide3Img from "../../assets/hero_carousel_slide_3.jpg";
import slide4Img from "../../assets/hero_carousel_slide_4.jpg";
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Truck, Sparkles, ChevronDown } from "lucide-react";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";

const STATIC_HERO_SLIDES_2_4 = [
    {
        id: "slide-2",
        badge: "🥛 100% PURE & UNADULTERATED",
        headline: "Pure Farm-Fresh Milk",
        highlight: "Delivered Daily",
        description: "Sourced directly from our certified local dairy farms, chilled at 4°C with zero preservatives for complete daily family wellness.",
        image: slide2Img,
        primaryCta: "Shop Fresh Milk",
        primaryLink: "/products/milk",
        secondaryCta: "Explore Products",
        secondaryLink: "#categories",
    },
    {
        id: "slide-3",
        badge: "FESTIVE SWEETS & DELIGHTS",
        headline: "Authentic Sweets Made with",
        highlight: "Pure Dairy Khoya",
        description: "Delicious gulab jamun, saffron basundi, and velvety shrikhand prepared from fresh milk solids with zero preservatives.",
        image: slide3Img,
        primaryCta: "Shop Products",
        primaryLink: "/products",
        secondaryCta: "Explore Products",
        secondaryLink: "#featured-products",
    },
    {
        id: "slide-4",
        badge: "PURE MORNING CONVENIENCE",
        headline: "Freshness at Your Door",
        highlight: "Before 7:00 AM",
        description: "Reliable 365-day cold chain delivery ensuring your breakfast tea and family nutrition are never delayed.",
        image: slide4Img,
        primaryCta: "Shop Products",
        primaryLink: "/products",
        secondaryCta: "Explore Products",
        secondaryLink: "#why-choose-us",
    },
];

export default function HomeWelcomeHero() {
    const { authUser } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);

    const rawName = authUser?.firstName || authUser?.name || authAdmin?.name || authUser?.username;
    const userName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "";

    // Dynamic Time-of-Day Welcome & Greeting for Slide 1 (Weather/Time-based)
    const timeGreeting = useMemo(() => {
        const hour = new Date().getHours();
        let greetingText = "GOOD MORNING";
        let timeSalutation = "Good Morning";
        let emoji = "☀️";
        let desc = "Start your morning with 100% pure, farm-fresh milk chilled at 4°C and delivered to your doorstep before 7 AM.";

        if (hour >= 12 && hour < 17) {
            greetingText = "GOOD AFTERNOON";
            timeSalutation = "Good Afternoon";
            emoji = "🌤️";
            desc = "Energize and refresh your afternoon with wholesome malai paneer, thick probiotic curd, and chilled artisanal dairy essentials.";
        } else if (hour < 5 || hour >= 17) {
            greetingText = "GOOD EVENING";
            timeSalutation = "Good Evening";
            emoji = "🌙";
            desc = "Welcome home to farm-fresh nutrition—order tonight for cold-chain dairy delivery straight to your door tomorrow morning.";
        }

        return {
            badge: `${emoji} ${greetingText}`,
            headline: "Welcome to",
            highlight: userName ? `Natural Milk Dairy, ${userName}!` : "Natural Milk Dairy",
            description: userName
                ? `${timeSalutation}, ${userName}! ${desc}`
                : desc,
        };
    }, [userName]);

    const slides = useMemo(() => {
        return [
            {
                id: "slide-1",
                badge: timeGreeting.badge,
                headline: timeGreeting.headline,
                highlight: timeGreeting.highlight,
                description: timeGreeting.description,
                image: slide1Img,
                primaryCta: "Shop Products",
                primaryLink: "/products",
                secondaryCta: "Explore Products",
                secondaryLink: "#featured-products",
            },
            ...STATIC_HERO_SLIDES_2_4,
        ];
    }, [timeGreeting]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef(null);

    const handleNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    // Auto-advance slides every 5.5s, pause on hover
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            handleNext();
        }, 5500);
        return () => clearInterval(timer);
    }, [isHovered, handleNext]);

    // Touch swipe support for mobile
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX.current - touchEndX;
        if (diffX > 45) {
            handleNext();
        } else if (diffX < -45) {
            handlePrev();
        }
        touchStartX.current = null;
    };

    const currentSlide = slides[currentIndex] || slides[0];

    const slideVariants = {
        enter: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "100%" : "-100%",
        }),
        center: {
            opacity: 1,
            x: 0,
            transition: {
                x: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.5 },
            },
        },
        exit: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "-100%" : "100%",
            transition: {
                x: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.5 },
            },
        }),
    };

    const handleSecondaryClick = (e, target) => {
        if (target.startsWith("#")) {
            e.preventDefault();
            const elem = document.querySelector(target);
            if (elem) {
                elem.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    return (
        <section
            aria-label="Dairy Highlights Hero"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            /* Mobile: Balanced card with bottom gap. Web: Full-width 100% viewport */
            className="group relative w-full h-[calc(100dvh-185px)] min-h-[350px] max-h-[570px] sm:h-[calc(100dvh-182px)] sm:min-h-[420px] sm:max-h-[580px] md:h-[calc(100vh-60px)] md:min-h-[560px] md:max-h-none rounded-2xl sm:rounded-3xl md:rounded-none overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 md:border-0 md:border-b border-slate-200/90 dark:border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.09)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] md:shadow-none select-none"
        >
            {/* Animated Slide Carousel */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentSlide.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Slide Image */}
                    <div className="relative w-full h-full">
                        <img
                            src={currentSlide.image}
                            alt={`${currentSlide.headline} ${currentSlide.highlight}`}
                            className="w-full h-full object-cover object-center"
                        />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end sm:justify-center z-10 pointer-events-none">
                        <div className="w-full max-w-7xl mx-auto pl-12 sm:pl-16 md:pl-20 lg:pl-24 pr-4 sm:pr-8 md:pr-12 pb-5 sm:pb-0">
                            <div className="max-w-xl md:max-w-2xl lg:max-w-3xl text-left pointer-events-auto space-y-2 sm:space-y-3.5 md:space-y-4">
                                {/* Eyebrow Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: 0.1 }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 text-[#0756B5] dark:text-emerald-300 shadow-xs"
                                >
                                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#0756B5] dark:text-emerald-300">
                                        {currentSlide.badge}
                                    </span>
                                </motion.div>

                                {/* Headline */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.16 }}
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-black text-slate-950 dark:text-white tracking-tight leading-[1.18] sm:leading-[1.15]"
                                >
                                    <span>{currentSlide.headline} </span>
                                    <span className="text-[#0756B5] dark:text-[#38BDF8]">
                                        {currentSlide.highlight}
                                    </span>
                                </motion.h1>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.22 }}
                                    className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-200 font-semibold leading-relaxed max-w-xl md:max-w-2xl line-clamp-2 sm:line-clamp-3"
                                >
                                    {currentSlide.description}
                                </motion.p>

                                {/* Action Buttons: Primary & Secondary CTAs */}
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.28 }}
                                    className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3.5 pt-0.5 sm:pt-1 md:pt-2"
                                >
                                    <Link
                                        to={currentSlide.primaryLink}
                                        className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 md:px-7 py-2 sm:py-2.5 md:py-3.5 rounded-full bg-[#0756B5] hover:bg-[#054593] text-white font-black text-xs sm:text-sm md:text-base shadow-[0_4px_16px_rgba(7,86,181,0.35)] hover:shadow-[0_6px_22px_rgba(7,86,181,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                                    >
                                        <span>{currentSlide.primaryCta}</span>
                                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    </Link>

                                    <a
                                        href={currentSlide.secondaryLink}
                                        onClick={(e) => handleSecondaryClick(e, currentSlide.secondaryLink)}
                                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4.5 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3.5 rounded-full bg-white/95 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs sm:text-sm md:text-base border border-slate-300 dark:border-slate-700 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
                                    >
                                        <span>{currentSlide.secondaryCta}</span>
                                    </a>
                                </motion.div>

                                {/* Quick Trust Feature Pills */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.45, delay: 0.35 }}
                                    className="hidden sm:flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-1.5 md:pt-2"
                                >
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs md:text-[13px] font-bold shadow-xs">
                                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>100+ Lab Tests</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs md:text-[13px] font-bold shadow-xs">
                                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-sky-400" />
                                        <span>Chilled at 4°C</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs md:text-[13px] font-bold shadow-xs">
                                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 dark:text-amber-300" />
                                        <span>Zero Chemicals</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slide Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="absolute left-2.5 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-xl backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer border border-white/60"
                aria-label="Previous Hero Slide"
            >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
            </button>
            <button
                onClick={handleNext}
                className="absolute right-2.5 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-xl backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer border border-white/60"
                aria-label="Next Hero Slide"
            >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
            </button>

            {/* Bottom Indicator Dots */}
            <div className="absolute bottom-3.5 sm:bottom-4 md:bottom-6 right-4 sm:right-6 md:right-8 lg:right-12 z-20 flex items-center gap-1.5 sm:gap-2">
                {slides.map((_, i) => (
                    <button
                        key={`hero-dot-${i}`}
                        onClick={() => {
                            setDirection(i > currentIndex ? 1 : -1);
                            setCurrentIndex(i);
                        }}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                            i === currentIndex
                                ? "w-6 h-1.5 sm:w-7 sm:h-2 md:w-8 md:h-2.5 bg-[#0756B5] ring-2 ring-white shadow-lg"
                                : "w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-slate-900/40 hover:bg-slate-900/80 border border-white/60 shadow-2xs"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Bouncing Scroll Down to Explore indicator on Web */}
            <button
                onClick={() => {
                    const elem = document.querySelector("#featured-products");
                    if (elem) {
                        elem.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                        window.scrollBy({ top: window.innerHeight - 60, behavior: "smooth" });
                    }
                }}
                className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white text-xs font-bold animate-bounce pointer-events-auto cursor-pointer bg-transparent border-0 outline-none transition-colors"
                aria-label="Scroll to explore products"
            >
                <span className="text-[11px] font-black uppercase tracking-wider">Scroll to Explore</span>
                <ChevronDown className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            </button>
        </section>
    );
}
