import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import slide1Img from "../../assets/hero_carousel_slide_1.jpg";
import slide2Img from "../../assets/hero_carousel_slide_2.jpg";
import slide3Img from "../../assets/hero_carousel_slide_3.jpg";
import { ChevronLeft, ChevronRight, ArrowRight, Clock, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function HomeWelcomeHero() {
    // Dynamic Time-of-day greeting for Slide 1
    const timeGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning!";
        if (hour >= 12 && hour < 17) return "Good Afternoon!";
        return "Good Evening!";
    }, []);

    const slides = useMemo(() => [
        {
            id: "slide-1",
            greeting: timeGreeting,
            label: "YOUR DAILY DOSE OF FRESHNESS",
            headline: "Welcome to",
            headlineHighlight: "Natural Milk Dairy",
            highlightColor: "text-[#15803D] dark:text-[#22C55E]",
            subtitle: "Freshness and goodness for your family.",
            description: "Chilled at 4°C within hours of morning milking, delivered directly from our ethical dairy farms for complete family wellness.",
            ctaText: "Explore Fresh Milk",
            ctaLink: "/products/milk",
            image: slide1Img,
            alt: "Welcome to Natural Milk Dairy - Fresh milk bottle, splash into glass, and happy family",
            badgeIcon: Sparkles,
            badgeStyle: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
            overlayGradient: "from-[#FAF3E6]/95 via-[#FAF3E6]/85 via-45% to-[#FAF3E6]/10 dark:from-slate-950/95 dark:via-slate-950/85 dark:via-45% dark:to-slate-950/10",
            ctaStyle: "bg-[#15803D] hover:bg-[#166534] shadow-[0_4px_16px_rgba(21,128,61,0.35)] hover:shadow-[0_6px_22px_rgba(21,128,61,0.5)]",
            features: [
                "100% Unadulterated Pure Milk",
                "Chilled at 4°C with Zero Chemicals",
                "Delivered Before 7:00 AM Daily",
            ],
        },
        {
            id: "slide-2",
            greeting: null,
            label: "DAILY DELIVERY AT 7 AM",
            headline: "Farm Fresh",
            headlineHighlight: "Milk",
            highlightColor: "text-[#0756B5] dark:text-[#38BDF8]",
            subtitle: "Freshness Delivered to Your Door.",
            description: "From our sunny green pastures and healthy cows straight to your breakfast table every single morning, 365 days a year.",
            ctaText: "Start Daily Subscription",
            ctaLink: "/products",
            image: slide2Img,
            alt: "Farm Fresh Milk - Green dairy farm pastures, grazing cows, and fresh milk bottle in morning sunlight",
            badgeIcon: Clock,
            badgeStyle: "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40",
            deliveryHighlight: "Guaranteed 7:00 AM Morning Doorstep Arrival",
            overlayGradient: "from-white/95 via-white/80 via-45% to-white/10 dark:from-slate-950/95 dark:via-slate-950/80 dark:via-45% dark:to-slate-950/10",
            ctaStyle: "bg-[#0756B5] hover:bg-[#06428d] shadow-[0_4px_16px_rgba(7,86,181,0.35)] hover:shadow-[0_6px_22px_rgba(7,86,181,0.5)]",
            features: [
                "Direct Farm Cold-Chain Logistics",
                "Raw A2 & Whole Cow Milk",
                "Daily Morning Delivery at 7 AM",
            ],
        },
        {
            id: "slide-3",
            greeting: null,
            label: "100% PURE & UNADULTERATED",
            headline: "Pure Goodness",
            headlineHighlight: "in Every Drop",
            highlightColor: "text-[#15803D] dark:text-[#22C55E]",
            subtitle: "Discover Your Daily Dairy Essentials.",
            description: "Handcrafted farm-fresh paneer, traditional bilona ghee, probiotic thick curd, and rich dairy sweets prepared with utmost purity.",
            ctaText: "Explore Our Products",
            ctaLink: "/products",
            image: slide3Img,
            alt: "Natural Milk Dairy Product Showcase - High protein paneer, farm fresh milk, and thick curd",
            badgeIcon: ShieldCheck,
            badgeStyle: "bg-blue-500/15 text-blue-900 dark:text-blue-200 border-blue-500/40",
            overlayGradient: "from-[#EBF6FC]/98 via-[#EBF6FC]/90 via-48% to-[#EBF6FC]/10 dark:from-slate-950/95 dark:via-slate-950/85 dark:via-45% dark:to-slate-950/10",
            ctaStyle: "bg-[#15803D] hover:bg-[#166534] shadow-[0_4px_16px_rgba(21,128,61,0.35)] hover:shadow-[0_6px_22px_rgba(21,128,61,0.5)]",
            features: [
                "High-Protein Malai Paneer",
                "Farm Whole Milk & Desi Ghee",
                "100+ Daily Quality & Lab Tests",
            ],
        },
    ], [timeGreeting]);

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

    // Auto-advance slides every 5.5 seconds, paused on hover
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            handleNext();
        }, 5500);
        return () => clearInterval(timer);
    }, [isHovered, handleNext]);

    // Touch swipe gesture handlers
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
    const BadgeIconComponent = currentSlide.badgeIcon || Sparkles;

    // Smooth motion variants between slides
    const slideVariants = {
        enter: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "100%" : "-100%",
        }),
        center: {
            opacity: 1,
            x: 0,
            transition: {
                x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.45 },
            },
        },
        exit: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "-100%" : "100%",
            transition: {
                x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.45 },
            },
        }),
    };

    // Staggered Text Layer Animation Variants
    const textLayerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            y: -12,
            transition: {
                duration: 0.25,
                ease: "easeInOut",
            },
        },
    };

    const textItemFadeIn = {
        initial: { opacity: 0, x: -22 },
        animate: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
        },
        exit: {
            opacity: 0,
            x: -16,
            transition: { duration: 0.2 },
        },
    };

    const featurePillPop = {
        initial: { opacity: 0, x: -16, scale: 0.95 },
        animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.35, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            scale: 0.92,
            transition: { duration: 0.18 },
        },
    };

    return (
        <section
            aria-label="Natural Milk Dairy Hero Highlights"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            /* Explicit responsive aspect ratio to eliminate layout shift */
            className="group relative w-full aspect-[16/8.5] sm:aspect-[16/7.5] md:aspect-[16/7] min-h-[300px] xs:min-h-[320px] sm:min-h-[380px] md:min-h-[460px] max-h-[580px] rounded-2xl sm:rounded-3xl md:rounded-none overflow-hidden bg-[#FAF3E6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 md:border-0 md:border-b shadow-md dark:shadow-slate-950/50 md:shadow-none select-none"
        >
            {/* Slide Container */}
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
                    {/* Background Visual Asset */}
                    <div className="relative w-full h-full">
                        <img
                            src={currentSlide.image}
                            alt={currentSlide.alt}
                            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                            loading={currentIndex === 0 ? "eager" : "lazy"}
                        />
                        {/* Smooth horizontal gradient to guarantee 100% typography contrast on the left */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.overlayGradient || "from-white/95 via-white/80 via-45% to-white/10 dark:from-slate-950/95 dark:via-slate-950/80 dark:via-45% dark:to-slate-950/10"} pointer-events-none`} />
                    </div>

                    {/* Staggered Content Overlay (Left-Aligned with Generous Negative Space) */}
                    <div className="absolute inset-0 flex flex-col justify-center z-10 pointer-events-none">
                        <div className="w-full max-w-7xl mx-auto px-4 xs:px-6 sm:px-10 md:px-14 lg:px-18">
                            <motion.div
                                variants={textLayerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="max-w-[290px] xs:max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl text-left pointer-events-auto space-y-1.5 xs:space-y-2 sm:space-y-3 md:space-y-3.5"
                            >
                                {/* Eyebrow Badge & Optional Greeting */}
                                <motion.div variants={textItemFadeIn} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    {currentSlide.greeting && (
                                        <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#15803D] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
                                            {currentSlide.greeting}
                                        </span>
                                    )}
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-md border shadow-2xs ${currentSlide.badgeStyle}`}>
                                        <BadgeIconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="text-[9px] xs:text-[10px] sm:text-xs font-black uppercase tracking-wider">
                                            {currentSlide.label}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Main Campaign Heading */}
                                <motion.h1
                                    variants={textItemFadeIn}
                                    className="text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-[44px] font-black tracking-tight leading-tight sm:leading-[1.12]"
                                >
                                    <span className="text-[#0B2545] dark:text-white">
                                        {currentSlide.headline}{" "}
                                    </span>
                                    <span className={currentSlide.highlightColor}>
                                        {currentSlide.headlineHighlight}
                                    </span>
                                </motion.h1>

                                {/* Subtitle & Supporting Line */}
                                <motion.p
                                    variants={textItemFadeIn}
                                    className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-slate-100"
                                >
                                    {currentSlide.subtitle}
                                </motion.p>

                                {/* Descriptive Copy (Hidden on small mobile for clean negative space, visible on tablet & desktop) */}
                                <motion.p
                                    variants={textItemFadeIn}
                                    className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg line-clamp-2"
                                >
                                    {currentSlide.description}
                                </motion.p>

                                {/* Key Features Checklist */}
                                <div className="space-y-1 sm:space-y-1.5 pt-0.5">
                                    {currentSlide.features.map((feat, idx) => (
                                        <motion.div
                                            key={`feat-${idx}`}
                                            variants={featurePillPop}
                                            className="flex items-center gap-1.5 sm:gap-2 text-slate-800 dark:text-slate-200"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#15803D] dark:text-[#22C55E] shrink-0" />
                                            <span className="text-[10px] xs:text-xs sm:text-sm font-bold">
                                                {feat}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Call to Action Button */}
                                <motion.div variants={textItemFadeIn} className="pt-1 sm:pt-2">
                                    <Link
                                        to={currentSlide.ctaLink}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-black text-xs sm:text-sm md:text-base hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${currentSlide.ctaStyle || "bg-[#15803D] hover:bg-[#166534] shadow-[0_4px_16px_rgba(21,128,61,0.35)]"}`}
                                    >
                                        <span>{currentSlide.ctaText}</span>
                                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Previous & Next Navigation Chevrons: Visible on desktop hover */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePrev();
                }}
                className="hidden md:flex absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer border border-white/70"
                aria-label="Previous Slide"
            >
                <ChevronLeft className="w-6 h-6 text-slate-900" />
            </button>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNext();
                }}
                className="hidden md:flex absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer border border-white/70"
                aria-label="Next Slide"
            >
                <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>

            {/* Three Pagination Pill Indicators */}
            <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20">
                {slides.map((_, i) => (
                    <button
                        key={`hero-dot-${i}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDirection(i > currentIndex ? 1 : -1);
                            setCurrentIndex(i);
                        }}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                            i === currentIndex
                                ? "w-6 sm:w-8 h-2 sm:h-2.5 bg-[#15803D] ring-2 ring-white shadow-md"
                                : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/70 hover:bg-white shadow-2xs"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
