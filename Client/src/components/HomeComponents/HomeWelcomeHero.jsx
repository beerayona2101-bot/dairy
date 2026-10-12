import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import slide1Img from "../../assets/hero_carousel_slide_1.jpg";
import slide2Img from "../../assets/hero_carousel_slide_2.jpg";
import slide3Img from "../../assets/hero_carousel_slide_3.jpg";
import { ChevronLeft, ChevronRight, ArrowRight, Clock, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function HomeWelcomeHero() {
    const slides = useMemo(() => [
        {
            id: "slide-1",
            label: "100% PURE & UNADULTERATED",
            headline: "Farm Fresh",
            headlineHighlight: "A2 & Whole Milk",
            highlightColor: "text-[#15803D] dark:text-[#22C55E]",
            subtitle: "Chilled at 4°C within hours of milking. Zero chemicals, zero additives.",
            mobileSubtitle: "Chilled at 4°C • 100% Pure & Fresh",
            description: "Directly from our ethical dairy farms straight to your home. Untouched by hand, chilled within hours, and laboratory tested for complete family wellness.",
            ctaText: "Explore Fresh Milk",
            ctaLink: "/products/milk",
            image: slide1Img,
            alt: "Natural Milk Dairy - Fresh Whole Milk Bottle and Pouring Glass Splash",
            badgeIcon: Sparkles,
            badgeStyle: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
            overlayGradient: "from-[#FAF6ED]/95 via-[#FAF6ED]/85 via-50% to-transparent dark:from-slate-950/95 dark:via-slate-950/85 dark:via-50% dark:to-transparent",
            ctaStyle: "bg-[#15803D] hover:bg-[#166534] shadow-[0_4px_16px_rgba(21,128,61,0.35)] hover:shadow-[0_6px_22px_rgba(21,128,61,0.5)]",
            features: [
                "100% Raw & Unadulterated Whole Milk",
                "Chilled at 4°C with Zero Preservatives",
                "Delivered Fresh Every Single Morning",
            ],
        },
        {
            id: "slide-2",
            label: "DAILY 7:00 AM SUBSCRIPTION",
            headline: "Morning Doorstep",
            headlineHighlight: "Fresh Delivery",
            highlightColor: "text-[#0756B5] dark:text-[#38BDF8]",
            subtitle: "Farm-fresh milk delivered to your doorstep every morning before 7:00 AM.",
            mobileSubtitle: "At Your Door Before 7:00 AM Daily",
            description: "Start your family's morning with pure farm freshness. Flexible pause, resume, and modify your subscription anytime with zero delivery fees.",
            ctaText: "Start Subscription",
            ctaLink: "/products",
            image: slide2Img,
            alt: "Natural Milk Dairy - Daily 7 AM Morning Doorstep Milk Delivery",
            badgeIcon: Clock,
            badgeStyle: "bg-blue-600/15 text-blue-900 dark:text-blue-300 border-blue-500/30",
            overlayGradient: "from-[#FAF7F2]/95 via-[#FAF7F2]/85 via-50% to-transparent dark:from-slate-950/95 dark:via-slate-950/85 dark:via-50% dark:to-transparent",
            ctaStyle: "bg-[#0756B5] hover:bg-[#06428d] shadow-[0_4px_16px_rgba(7,86,181,0.35)] hover:shadow-[0_6px_22px_rgba(7,86,181,0.5)]",
            features: [
                "Guaranteed Arrival Before 7:00 AM",
                "Pause or Modify Subscription Anytime",
                "Free Doorstep Delivery 365 Days a Year",
            ],
        },
        {
            id: "slide-3",
            label: "TRADITIONAL & ARTISANAL",
            headline: "Pure Desi Ghee,",
            headlineHighlight: "Paneer & Curd",
            highlightColor: "text-[#15803D] dark:text-[#22C55E]",
            subtitle: "Handcrafted Bilona cow ghee, soft malai paneer, and probiotic thick curd.",
            mobileSubtitle: "Bilona Ghee, Malai Paneer & Thick Curd",
            description: "Prepared with time-honored traditional methods. Slow-cooked aromatic bilona ghee, melt-in-mouth fresh paneer, and rich probiotic curd.",
            ctaText: "Explore Dairy Range",
            ctaLink: "/products",
            image: slide3Img,
            alt: "Natural Milk Dairy - Artisanal Bilona Desi Ghee, Malai Paneer and Thick Curd",
            badgeIcon: ShieldCheck,
            badgeStyle: "bg-amber-600/15 text-amber-900 dark:text-amber-200 border-amber-500/30",
            overlayGradient: "from-[#FCF7ED]/95 via-[#FCF7ED]/85 via-50% to-transparent dark:from-slate-950/95 dark:via-slate-950/85 dark:via-50% dark:to-transparent",
            ctaStyle: "bg-[#15803D] hover:bg-[#166534] shadow-[0_4px_16px_rgba(21,128,61,0.35)] hover:shadow-[0_6px_22px_rgba(21,128,61,0.5)]",
            features: [
                "Traditional Bilona Danedar Cow Ghee",
                "High-Protein Soft Malai Paneer",
                "Natural Probiotic Set Thick Curd",
            ],
        },
    ], []);

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

    // Touch swipe gesture handlers (left and right)
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX.current - touchEndX;
        if (diffX > 40) {
            handleNext();
        } else if (diffX < -40) {
            handlePrev();
        }
        touchStartX.current = null;
    };

    const currentSlide = slides[currentIndex] || slides[0];
    const BadgeIconComponent = currentSlide.badgeIcon || Sparkles;

    // Smooth motion variants between slides from left to right
    const slideVariants = {
        enter: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "100%" : "-100%",
        }),
        center: {
            opacity: 1,
            x: 0,
            transition: {
                x: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.42 },
            },
        },
        exit: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "-100%" : "100%",
            transition: {
                x: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.42 },
            },
        }),
    };

    // Staggered Text Layer Animation Variants
    const textLayerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.08,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.22,
                ease: "easeInOut",
            },
        },
    };

    const textItemFadeIn = {
        initial: { opacity: 0, x: -18 },
        animate: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
        },
        exit: {
            opacity: 0,
            x: -12,
            transition: { duration: 0.18 },
        },
    };

    const featurePillPop = {
        initial: { opacity: 0, x: -14, scale: 0.95 },
        animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.32, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            scale: 0.92,
            transition: { duration: 0.16 },
        },
    };

    return (
        <section
            aria-label="Natural Milk Dairy Hero Highlights"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            /* RECTANGULAR SHAPE FROM LEFT TO RIGHT: Wide landscape proportions on mobile, expansive on desktop */
            className="group relative w-full aspect-[2.05/1] xs:aspect-[2.1/1] sm:aspect-[16/7.5] md:aspect-[16/7] min-h-[170px] xs:min-h-[185px] sm:min-h-[260px] md:min-h-[440px] max-h-[560px] rounded-2xl sm:rounded-3xl md:rounded-none overflow-hidden bg-[#FAF3E6] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 md:border-0 md:border-b shadow-md dark:shadow-slate-950/50 md:shadow-none select-none"
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
                            className="w-full h-full object-cover object-center"
                            loading={currentIndex === 0 ? "eager" : "lazy"}
                            decoding={currentIndex === 0 ? "sync" : "async"}
                            fetchPriority={currentIndex === 0 ? "high" : "low"}
                        />
                        {/* Smooth horizontal gradient to guarantee 100% typography contrast on the left, letting the visual asset shine on the right */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.overlayGradient || "from-white/98 via-white/88 via-55% to-transparent dark:from-slate-950/98 dark:via-slate-950/88 dark:via-55% dark:to-transparent"} pointer-events-none`} />
                    </div>

                    {/* Staggered Content Overlay (Left-Aligned with generous space for visual asset on the right) */}
                    <div className="absolute inset-0 flex flex-col justify-center z-10 pointer-events-none">
                        <div className="w-full max-w-7xl mx-auto px-3.5 xs:px-4 sm:px-10 md:px-14 lg:px-18">
                            <motion.div
                                variants={textLayerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="max-w-[62%] xs:max-w-[60%] sm:max-w-lg md:max-w-xl lg:max-w-2xl text-left pointer-events-auto space-y-1 xs:space-y-1.5 sm:space-y-3"
                            >
                                {/* Eyebrow Badge */}
                                <motion.div variants={textItemFadeIn} className="flex items-center gap-1.5">
                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 xs:px-2.5 xs:py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-md border shadow-2xs ${currentSlide.badgeStyle}`}>
                                        <BadgeIconComponent className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                                        <span className="text-[8px] xs:text-[9px] sm:text-xs font-black uppercase tracking-wider truncate">
                                            {currentSlide.label}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Main Campaign Heading */}
                                <motion.h1
                                    variants={textItemFadeIn}
                                    className="text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-[42px] font-black tracking-tight leading-tight sm:leading-[1.12]"
                                >
                                    <span className="text-[#0B2545] dark:text-white">
                                        {currentSlide.headline}{" "}
                                    </span>
                                    <span className={currentSlide.highlightColor}>
                                        {currentSlide.headlineHighlight}
                                    </span>
                                </motion.h1>

                                {/* Subtitle / Value Prop */}
                                <motion.p
                                    variants={textItemFadeIn}
                                    className="text-[10px] xs:text-[11px] sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1"
                                >
                                    {currentSlide.mobileSubtitle || currentSlide.subtitle}
                                </motion.p>

                                {/* Descriptive Copy (Hidden on mobile, visible on tablet & desktop) */}
                                <motion.p
                                    variants={textItemFadeIn}
                                    className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg line-clamp-2"
                                >
                                    {currentSlide.description}
                                </motion.p>

                                {/* Key Features Checklist (Visible on tablet & desktop) */}
                                <div className="hidden sm:block space-y-1 sm:space-y-1.5 pt-0.5">
                                    {currentSlide.features.map((feat, idx) => (
                                        <motion.div
                                            key={`feat-${idx}`}
                                            variants={featurePillPop}
                                            className="flex items-center gap-1.5 sm:gap-2 text-slate-800 dark:text-slate-200"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#15803D] dark:text-[#22C55E] shrink-0" />
                                            <span className="text-xs sm:text-sm font-bold">
                                                {feat}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Call to Action Button */}
                                <motion.div variants={textItemFadeIn} className="pt-0.5 sm:pt-2">
                                    <Link
                                        to={currentSlide.ctaLink}
                                        className={`inline-flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-3 py-1 xs:px-3.5 xs:py-1.5 sm:px-6 sm:py-2.5 rounded-full text-white font-black text-[10px] xs:text-xs sm:text-sm md:text-base hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm ${currentSlide.ctaStyle || "bg-[#15803D] hover:bg-[#166534]"}`}
                                    >
                                        <span>{currentSlide.ctaText}</span>
                                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Desktop Navigation Chevrons: Visible on desktop hover */}
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

            {/* Pagination Indicators */}
            <div className="absolute bottom-2 xs:bottom-2.5 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20">
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
                                ? "w-5 xs:w-6 sm:w-8 h-1.5 sm:h-2.5 bg-[#15803D] ring-1.5 sm:ring-2 ring-white shadow-md"
                                : "w-1.5 xs:w-2 sm:w-2.5 h-1.5 xs:h-2 sm:h-2.5 bg-white/70 hover:bg-white shadow-2xs"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
