import { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import bannerWelcomeImg from "../../assets/banner_welcome_sunrise.jpg";
import bannerMilkImg from "../../assets/banner_farm_fresh_milk.jpg";
import bannerProductsImg from "../../assets/banner_pure_healthy_products.jpg";
import bannerDeliveryImg from "../../assets/banner_farm_to_home_delivery.jpg";
import {
    Sun,
    Leaf,
    Droplets,
    Truck,
    Award,
    ShieldCheck,
    Clock,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Milk,
} from "lucide-react";

export default function HomeWelcomeHero() {
    const { pageContent } = useContext(PageContentContext);

    // Detect mobile viewport (under 768px)
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 768;
        }
        return false;
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Canonical default slides fallback
    const defaultSlides = useMemo(() => [
        {
            id: "welcome-slide",
            isWelcomeSlide: true, // Shown in web/desktop; excluded in mobile response
            badgeText: "Good Morning",
            badgeIcon: Sun,
            badgeIconColor: "text-amber-500 fill-amber-400",
            eyebrow: "Welcome to",
            mainHeading: "Natural Milk Dairy",
            subHeading: "",
            description: "Direct from our ethical farms to your home. Pure, hygienic & fresh dairy for you and your family.",
            mobileSubtitle: "Fresh & Natural • Hygienic & Safe • Daily Delivery",
            pills: [
                { icon: Leaf, label: "Fresh & Natural" },
                { icon: Droplets, label: "Hygienic & Safe" },
                { icon: Truck, label: "Daily Delivery" },
            ],
            ctaText: "Explore Fresh Dairy",
            ctaLink: "/products",
            image: bannerWelcomeImg,
            alt: "Good Morning Welcome to Natural Milk Dairy - Sunrise Farm Pasture with Fresh Milk",
            highlightColor: "text-[#134E24] dark:text-[#4ADE80]",
            overlayGradient: "from-white/70 via-white/30 via-40% to-transparent/0 dark:from-slate-950/75 dark:via-slate-950/35 dark:via-40% dark:to-transparent/0",
        },
        {
            id: "farm-fresh-milk",
            badgeText: "100% PURE & UNTOUCHED",
            badgeIcon: Sparkles,
            badgeIconColor: "text-emerald-500",
            eyebrow: "",
            mainHeading: "Farm Fresh Milk",
            subHeading: "Every Day at 7 AM",
            description: "Direct from our farms to your home. Untouched by hand, chilled within hours, and laboratory tested.",
            mobileSubtitle: "Direct from our farms to your home.",
            pills: [
                { icon: Leaf, label: "100% Natural" },
                { icon: Award, label: "Quality Assured" },
                { icon: Truck, label: "On-Time Delivery" },
            ],
            ctaText: "Order Fresh Milk",
            ctaLink: "/products/milk",
            image: bannerMilkImg,
            alt: "Farm Fresh Milk Every Day at 7 AM - Direct From Our Farms To Your Home",
            highlightColor: "text-[#134E24] dark:text-[#4ADE80]",
            overlayGradient: "from-white/70 via-white/30 via-40% to-transparent/0 dark:from-slate-950/75 dark:via-slate-950/35 dark:via-40% dark:to-transparent/0",
        },
        {
            id: "pure-healthy-products",
            badgeText: "ARTISANAL & NUTRITIOUS",
            badgeIcon: ShieldCheck,
            badgeIconColor: "text-blue-500",
            eyebrow: "",
            mainHeading: "Pure & Healthy",
            subHeading: "Dairy Products",
            description: "Goodness for a Healthier Tomorrow. Thick curd, soft malai paneer, and aromatic bilona cow ghee.",
            mobileSubtitle: "Goodness for a Healthier Tomorrow.",
            pills: [
                { icon: Milk, label: "Whole Farm Milk" },
                { icon: Sparkles, label: "Pure Desi Ghee" },
                { icon: ShieldCheck, label: "Fresh Soft Paneer" },
            ],
            ctaText: "Explore Dairy Range",
            ctaLink: "/products",
            image: bannerProductsImg,
            alt: "Pure & Healthy Dairy Products - Goodness for a Healthier Tomorrow",
            highlightColor: "text-[#134E24] dark:text-[#4ADE80]",
            overlayGradient: "from-white/70 via-white/30 via-40% to-transparent/0 dark:from-slate-950/75 dark:via-slate-950/35 dark:via-40% dark:to-transparent/0",
        },
        {
            id: "from-our-farm",
            badgeText: "DAILY MORNING DISPATCH",
            badgeIcon: Clock,
            badgeIconColor: "text-amber-500",
            eyebrow: "",
            mainHeading: "From Our Farm",
            subHeading: "To Your Home",
            description: "Trusted by thousands of happy customers. Guaranteed morning arrival at your doorstep before 7:00 AM.",
            mobileSubtitle: "Trusted by thousands of happy customers.",
            pills: [
                { icon: Truck, label: "Cold-Chain Fleet" },
                { icon: Clock, label: "Morning 7 AM" },
                { icon: Award, label: "Free Doorstep Delivery" },
            ],
            ctaText: "Start Subscription",
            ctaLink: "/products",
            image: bannerDeliveryImg,
            alt: "From Our Farm To Your Home - Trusted By Thousands of Happy Customers",
            highlightColor: "text-[#134E24] dark:text-[#4ADE80]",
            overlayGradient: "from-white/70 via-white/30 via-40% to-transparent/0 dark:from-slate-950/75 dark:via-slate-950/35 dark:via-40% dark:to-transparent/0",
        },
    ], []);

    // Dynamic catalog of slides merged with CRM custom inputs
    const allSlides = useMemo(() => {
        const rawSlides = Array.isArray(pageContent?.heroCarouselSlides) && pageContent.heroCarouselSlides.length > 0
            ? pageContent.heroCarouselSlides
            : [];

        return defaultSlides.map((def, idx) => {
            const custom = rawSlides[idx] || {};
            return {
                ...def,
                ...custom,
                badgeText: custom.badgeText || def.badgeText,
                badgeIcon: def.badgeIcon,
                badgeIconColor: def.badgeIconColor,
                eyebrow: custom.eyebrow !== undefined && custom.eyebrow !== "" ? custom.eyebrow : def.eyebrow,
                mainHeading: custom.mainHeading || custom.title || def.mainHeading,
                subHeading: custom.subHeading !== undefined && custom.subHeading !== "" ? custom.subHeading : (custom.subtitle || def.subHeading),
                description: custom.description || def.description,
                mobileSubtitle: custom.mobileSubtitle || def.mobileSubtitle,
                ctaText: custom.ctaText || custom.buttonText || def.ctaText,
                ctaLink: custom.ctaLink || custom.buttonLink || def.ctaLink,
                image: custom.image || def.image,
                pills: Array.isArray(custom.pills) && custom.pills.length > 0 ? custom.pills : def.pills,
            };
        });
    }, [pageContent?.heroCarouselSlides, defaultSlides]);

    // Responsive configuration:
    // Web response: 4 carousels (including Welcome Note)
    // Mobile response: 3 cards only (without Welcome Note, as mobile already has top welcome banner)
    const activeSlides = useMemo(() => {
        if (isMobile) {
            return allSlides.filter((slide) => !slide.isWelcomeSlide);
        }
        return allSlides;
    }, [isMobile, allSlides]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef(null);

    // Keep currentIndex within bounds when switching between mobile (3) and web (4)
    useEffect(() => {
        if (currentIndex >= activeSlides.length) {
            setCurrentIndex(0);
        }
    }, [activeSlides.length, currentIndex]);

    const handleNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, [activeSlides.length]);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    }, [activeSlides.length]);

    // Auto-advance slides every 5.5 seconds, paused on hover
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            handleNext();
        }, 5500);
        return () => clearInterval(timer);
    }, [isHovered, handleNext]);

    // Touch swipe gesture handlers for mobile
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

    const currentSlide = activeSlides[currentIndex] || activeSlides[0];

    // Smooth horizontal slide transition variants
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
                opacity: { duration: 0.4 },
            },
        },
        exit: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "-100%" : "100%",
            transition: {
                x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.4 },
            },
        }),
    };

    // Staggered text entry container
    const textContainerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.06,
            },
        },
        exit: {
            opacity: 0,
            x: -15,
            transition: { duration: 0.2, ease: "easeInOut" },
        },
    };

    // Slide-in & blur fade for individual text lines
    const itemSlideIn = {
        initial: { opacity: 0, x: -32, filter: "blur(4px)" },
        animate: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        },
    };

    // Pop-in animation for feature pills
    const pillPopIn = {
        initial: { opacity: 0, y: 12, scale: 0.94 },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.32, ease: "easeOut" },
        },
    };

    // CTA Button entrance
    const ctaEntry = {
        initial: { opacity: 0, scale: 0.92, y: 8 },
        animate: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.35, ease: [0.34, 1.35, 0.64, 1] },
        },
    };

    return (
        <section
            aria-label="Natural Milk Dairy Hero Highlights"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="group relative w-full aspect-[2.1/1] xs:aspect-[2.15/1] sm:aspect-[16/7.2] md:aspect-[16/6.8] min-h-[175px] xs:min-h-[190px] sm:min-h-[270px] md:min-h-[420px] max-h-[540px] rounded-2xl sm:rounded-3xl md:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-xs dark:shadow-none select-none"
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
                        {/* Smooth subtle horizontal gradient allowing full visual vibrancy while preserving text readability */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-r ${currentSlide.overlayGradient || "from-white/70 via-white/30 via-40% to-transparent/0 dark:from-slate-950/75 dark:via-slate-950/35 dark:via-40% dark:to-transparent/0"} pointer-events-none`}
                        />
                    </div>

                    {/* Staggered Content Overlay (Left-Aligned with generous space for visual asset on the right) */}
                    <div className="absolute inset-0 flex flex-col justify-center z-10 pointer-events-none">
                        <div className="w-full max-w-7xl mx-auto px-3.5 xs:px-4 sm:px-10 md:px-14 lg:px-16">
                            <motion.div
                                variants={textContainerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="max-w-[62%] xs:max-w-[60%] sm:max-w-lg md:max-w-xl lg:max-w-2xl text-left pointer-events-auto space-y-1 xs:space-y-1.5 sm:space-y-2.5"
                            >
                                {currentSlide.isWelcomeSlide ? (
                                    /* 1. WELCOME SLIDE CONTENT (Desktop/Web only) */
                                    <>
                                        {/* Sun Icon + Good Morning Greeting */}
                                        <motion.div variants={itemSlideIn} className="flex items-center gap-1.5 xs:gap-2">
                                            <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-full bg-amber-400/20 dark:bg-amber-950/50 border border-amber-400/30 dark:border-amber-700/50 flex items-center justify-center shrink-0">
                                                <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400" />
                                            </div>
                                            <span className="text-[11px] xs:text-xs sm:text-base font-bold text-slate-800 dark:text-amber-200 tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-none">
                                                {currentSlide.badgeText}
                                            </span>
                                        </motion.div>

                                        {/* "Welcome to" */}
                                        <motion.p
                                            variants={itemSlideIn}
                                            className="text-xs xs:text-sm sm:text-xl font-medium text-slate-700 dark:text-slate-300 leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] dark:drop-shadow-none"
                                        >
                                            {currentSlide.eyebrow}
                                        </motion.p>

                                        {/* "Natural Milk Dairy" in grand serif typography */}
                                        <motion.h1
                                            variants={itemSlideIn}
                                            className="font-serif-display text-base xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#134E24] dark:text-[#4ADE80] leading-[1.08] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                                        >
                                            {currentSlide.mainHeading}
                                        </motion.h1>

                                        {/* Subtitle / Description (Visible on larger screens) */}
                                        <motion.p
                                            variants={itemSlideIn}
                                            className="hidden sm:block text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-lg line-clamp-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] dark:drop-shadow-none"
                                        >
                                            {currentSlide.description}
                                        </motion.p>

                                        {/* Feature Pills: Fresh & Natural • Hygienic & Safe • Daily Delivery */}
                                        <motion.div variants={textContainerVariants} className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-2.5 pt-0.5 sm:pt-1">
                                            {currentSlide.pills.map((pill, idx) => {
                                                const PillIcon = pill.icon;
                                                return (
                                                    <motion.div
                                                        key={`welcome-pill-${idx}`}
                                                        variants={pillPopIn}
                                                        className="inline-flex items-center gap-1 xs:gap-1.5 px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1 rounded-full bg-white/70 hover:bg-white/85 dark:bg-slate-900/60 border border-white/60 dark:border-slate-700/50 backdrop-blur-md text-slate-800 dark:text-slate-200 transition-colors"
                                                    >
                                                        <PillIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-[#134E24] dark:text-[#4ADE80] shrink-0" />
                                                        <span className="text-[8px] xs:text-[9.5px] sm:text-xs font-bold whitespace-nowrap">
                                                            {pill.label}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                        </motion.div>

                                        {/* Call to Action Button */}
                                        <motion.div variants={ctaEntry} className="pt-0.5 sm:pt-1.5">
                                            <Link
                                                to={currentSlide.ctaLink}
                                                className="inline-flex items-center gap-1.5 xs:gap-2 px-3.5 py-1.5 xs:px-4.5 xs:py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#134E24] hover:bg-[#0E3B1B] text-white font-bold text-[10px] xs:text-xs sm:text-sm md:text-base shadow-[0_2px_8px_rgba(19,78,36,0.25)] hover:shadow-[0_4px_14px_rgba(19,78,36,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                                            >
                                                <span>{currentSlide.ctaText}</span>
                                                <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                            </Link>
                                        </motion.div>
                                    </>
                                ) : (
                                    /* 2. PRODUCT & DELIVERY SLIDES (Web & Mobile) */
                                    <>
                                        {/* Main Campaign Headline in Serif Font (e.g. "Farm Fresh Milk", "Pure & Healthy", "From Our Farm") */}
                                        <motion.h2
                                            variants={itemSlideIn}
                                            className="font-serif-display text-sm xs:text-lg sm:text-2xl md:text-3xl lg:text-[40px] font-bold tracking-tight text-[#134E24] dark:text-[#4ADE80] leading-[1.1] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                                        >
                                            {currentSlide.mainHeading}
                                        </motion.h2>

                                        {/* Secondary Headline (e.g. "Every Day at 7 AM", "Dairy Products", "To Your Home") */}
                                        {currentSlide.subHeading && (
                                            <motion.h3
                                                variants={itemSlideIn}
                                                className="text-xs xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                                            >
                                                {currentSlide.subHeading}
                                            </motion.h3>
                                        )}

                                        {/* Subtitle / Value Proposition */}
                                        <motion.p
                                            variants={itemSlideIn}
                                            className="text-[10px] xs:text-[11px] sm:text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-md line-clamp-1 xs:line-clamp-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] dark:drop-shadow-none"
                                        >
                                            {currentSlide.mobileSubtitle || currentSlide.description}
                                        </motion.p>

                                        {/* Feature Value Pills */}
                                        <motion.div variants={textContainerVariants} className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-2.5 pt-0.5 sm:pt-1">
                                            {currentSlide.pills.map((pill, idx) => {
                                                const PillIcon = pill.icon;
                                                return (
                                                    <motion.div
                                                        key={`prod-pill-${idx}`}
                                                        variants={pillPopIn}
                                                        className="inline-flex items-center gap-1 xs:gap-1.5 px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1 rounded-full bg-white/70 hover:bg-white/85 dark:bg-slate-900/60 border border-white/60 dark:border-slate-700/50 backdrop-blur-md text-slate-800 dark:text-slate-200 transition-colors"
                                                    >
                                                        <PillIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-[#134E24] dark:text-[#4ADE80] shrink-0" />
                                                        <span className="text-[8px] xs:text-[9.5px] sm:text-xs font-bold whitespace-nowrap">
                                                            {pill.label}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                        </motion.div>

                                        {/* Call to Action Button */}
                                        <motion.div variants={ctaEntry} className="pt-0.5 sm:pt-1.5">
                                            <Link
                                                to={currentSlide.ctaLink}
                                                className="inline-flex items-center gap-1.5 xs:gap-2 px-3.5 py-1.5 xs:px-4.5 xs:py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#134E24] hover:bg-[#0E3B1B] text-white font-bold text-[10px] xs:text-xs sm:text-sm md:text-base shadow-[0_2px_8px_rgba(19,78,36,0.25)] hover:shadow-[0_4px_14px_rgba(19,78,36,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                                            >
                                                <span>{currentSlide.ctaText}</span>
                                                <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                            </Link>
                                        </motion.div>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Desktop Navigation Chevrons: Visible on hover */}
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

            {/* Pagination Indicators (4 dots on web, 3 dots on mobile) */}
            <div className="absolute bottom-2 xs:bottom-2.5 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                {activeSlides.map((_, i) => (
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
                                ? "w-5 xs:w-6 sm:w-8 h-1.5 sm:h-2.5 bg-[#134E24] ring-1.5 sm:ring-2 ring-white shadow-md"
                                : "w-1.5 xs:w-2 sm:w-2.5 h-1.5 xs:h-2 sm:h-2.5 bg-white/75 hover:bg-white shadow-2xs"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
