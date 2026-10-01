import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { PageContentContext } from "../../context/PageContentProvider";
import company from "../../data/company.json";
import homeHeroBg from "../../assets/hero_carousel_slide_1.png";
import bannerSlide2 from "../../assets/hero_carousel_slide_2.png";
import bannerSlide3 from "../../assets/hero_carousel_slide_3.png";

const defaultSlides = [
    {
        image: homeHeroBg,
        title: "Welcome to MADHU Dairy & Daily Needs",
        subtitle: "Experience 100% unadulterated farm-fresh milk, ghee, paneer, and sweets sourced directly from ethical farms.",
        buttonText: "Explore Products",
        buttonLink: "/products",
    },
    {
        image: bannerSlide2,
        title: "100% Pure, Organic & Farm-Fresh A2 Milk",
        subtitle: "Delivered fresh to your doorstep every morning with zero preservatives and pristine hygiene.",
        buttonText: "Order Fresh Milk",
        buttonLink: "/products",
    },
    {
        image: bannerSlide3,
        title: "Traditional Ghee, Artisanal Paneer & Sweets",
        subtitle: "Crafted with pure whole milk and traditional recipes for authentic nutrition, rich aroma and taste.",
        buttonText: "Shop Dairy Products",
        buttonLink: "/products",
    },
];

export default function HomeWelcomeHero() {
    const { authUser, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);
    const { pageContent } = useContext(PageContentContext);

    const loggedInName = authUser?.firstName || authUser?.name || authAdmin?.name || null;

    // Use admin-configured carousel slides (ensuring 3 slides) or fall back to defaultSlides
    const configuredSlides = Array.isArray(pageContent?.heroCarouselSlides) && pageContent.heroCarouselSlides.length > 0
        ? pageContent.heroCarouselSlides
        : [];

    const slides = [0, 1, 2].map((idx) => {
        const custom = configuredSlides[idx];
        const fallback = defaultSlides[idx] || defaultSlides[0];
        return {
            image: (custom?.image && custom.image.trim()) ? custom.image : fallback.image,
            title: (custom?.title && custom.title.trim()) ? custom.title : fallback.title,
            subtitle: (custom?.subtitle && custom.subtitle.trim()) ? custom.subtitle : fallback.subtitle,
            buttonText: (custom?.buttonText && custom.buttonText.trim()) ? custom.buttonText : fallback.buttonText,
            buttonLink: (custom?.buttonLink && custom.buttonLink.trim()) ? custom.buttonLink : fallback.buttonLink,
        };
    });

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

    // Autoplay cycling every 5.5s, paused when hovering
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
        if (diffX > 40) {
            handleNext();
        } else if (diffX < -40) {
            handlePrev();
        }
        touchStartX.current = null;
    };

    const currentSlide = slides[currentIndex] || slides[0];

    const slideVariants = {
        enter: (dir) => ({
            opacity: 0,
            x: dir > 0 ? 60 : -60,
            scale: 1.01,
        }),
        center: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                opacity: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
                x: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
                scale: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
            },
        },
        exit: (dir) => ({
            opacity: 0,
            x: dir > 0 ? -60 : 60,
            scale: 0.99,
            transition: {
                opacity: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
                x: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
            },
        }),
    };

    const textVariants = {
        enter: (dir) => ({
            opacity: 0,
            y: dir > 0 ? 10 : -10,
        }),
        center: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
        exit: (dir) => ({
            opacity: 0,
            y: dir > 0 ? -10 : 10,
            transition: { duration: 0.35, ease: "easeIn" },
        }),
    };

    return (
        <section
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-[56vw] min-h-[220px] sm:h-auto sm:min-h-[380px] md:h-[calc(100vh-56px)] md:min-h-[calc(100vh-56px)] overflow-hidden bg-white select-none"
        >
            {/* Base underlay — prevents flash on transition */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <img
                    src={currentSlide.image}
                    alt="Hero Slide Underlay"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* Animated Slide Layer */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={`hero-bg-${currentIndex}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full z-[1]"
                >
                    <img
                        src={currentSlide.image}
                        alt={`Slide ${currentIndex + 1}`}
                        className="w-full h-full object-cover object-center pointer-events-none"
                    />
                </motion.div>
            </AnimatePresence>

            {/* MOBILE ONLY: Thin slide indicator dots — no text overlay */}
            <div className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                            i === currentIndex
                                ? "w-5 h-1.5 bg-[#6C5CE7]"
                                : "w-1.5 h-1.5 bg-gray-400/50"
                        }`}
                    />
                ))}
            </div>

            {/* DESKTOP ONLY: Glassmorphism text panel + CTA */}
            <div className="hidden md:flex absolute inset-0 z-10 items-center">
                <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
                    {/* ── Frosted violet glass card ── */}
                    <div
                        className="max-w-lg rounded-2xl p-8 lg:p-10"
                        style={{
                            background: "rgba(108, 92, 231, 0.18)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.28)",
                            boxShadow: "0 8px 40px rgba(108, 92, 231, 0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
                        }}
                    >
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={`hero-text-${currentIndex}`}
                                custom={direction}
                                variants={textVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="space-y-5"
                            >
                                {/* Headline */}
                                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
                                    {loggedInName ? (
                                        <div className="space-y-1">
                                            <span className="block text-white/80 text-xl font-bold">Welcome Back,</span>
                                            <span className="inline-block text-4xl lg:text-5xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-lime-300">
                                                {loggedInName}!
                                            </span>
                                            <span className="block text-xl font-extrabold text-white/90">
                                                {currentSlide.title || "Ready for Fresh Dairy?"}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="block font-[900] text-white leading-tight">
                                            {currentSlide.title.includes("MADHU") ? (
                                                <>
                                                    {currentSlide.title.split("MADHU")[0]}
                                                    <span className="text-[#a78bfa]">MADHU</span>
                                                    {currentSlide.title.split("MADHU")[1]}
                                                </>
                                            ) : currentSlide.title}
                                        </span>
                                    )}
                                </h1>

                                {/* Subtitle */}
                                <p className="text-sm md:text-[15px] text-white/80 font-medium leading-relaxed">
                                    {loggedInName
                                        ? "Your daily dose of 100% unadulterated farm-fresh A2 milk, ghee, paneer, and sweets is ready for doorstep delivery."
                                        : currentSlide.subtitle}
                                </p>

                                {/* CTAs */}
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <Link
                                        to={currentSlide.buttonLink || "/products"}
                                        className="inline-flex items-center gap-2 bg-[#6C5CE7] hover:bg-[#5a4bd4] text-white font-bold text-xs tracking-widest uppercase px-7 py-3 rounded-xl shadow-[0_4px_20px_rgba(108,92,231,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"
                                    >
                                        <span>{loggedInName ? "Order Now" : (currentSlide.buttonText || "Explore Products")}</span>
                                        <span>→</span>
                                    </Link>
                                    {!loggedInName && (
                                        <button
                                            onClick={() => setOpenLoginDialog(true)}
                                            className="inline-flex items-center bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                                        >
                                            Login Account
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide dots inside the glass panel */}
                        <div className="flex items-center gap-1.5 mt-6">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                                        i === currentIndex
                                            ? "w-6 h-1.5 bg-white"
                                            : "w-1.5 h-1.5 bg-white/40"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

