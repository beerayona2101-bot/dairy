import { useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import { ProductContext } from "../../context/ProductProvider";
import { products } from "../../data/products";
import { slugify } from "../../utils/slugify";
import { getCardBackgroundImage } from "../../utils/helper";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeWelcomeHero() {
    const { pageContent } = useContext(PageContentContext);
    const { products: liveProducts } = useContext(ProductContext);

    // Build category slides array representing all available categories
    const categorySlides = useMemo(() => {
        const cardMap = new Map();

        // 1. Gather from static products catalog
        products.forEach((p) => {
            const title = p.title || p.name;
            if (title) {
                cardMap.set(title.toLowerCase().trim(), {
                    title,
                    image: getCardBackgroundImage(p, title),
                    link: `/products/${slugify(title)}`
                });
            }
        });

        // 2. Gather from live products context
        if (Array.isArray(liveProducts)) {
            liveProducts.forEach((p) => {
                const title = p.category || p.type || p.title || p.name;
                if (title && typeof title === "string") {
                    const clean = title.trim();
                    const key = clean.toLowerCase();
                    if (!cardMap.has(key)) {
                        cardMap.set(key, {
                            title: clean.charAt(0).toUpperCase() + clean.slice(1),
                            image: getCardBackgroundImage(p, clean),
                            link: `/products/${slugify(clean)}`
                        });
                    }
                }
            });
        }

        // 3. Gather from admin pageContent config
        if (Array.isArray(pageContent?.homeCategoryCards)) {
            pageContent.homeCategoryCards.forEach((c) => {
                const title = c?.title || c?.name;
                if (title) {
                    cardMap.set(title.toLowerCase().trim(), {
                        title,
                        image: getCardBackgroundImage(c, title),
                        link: `/products/${slugify(title)}`
                    });
                }
            });
        }

        return Array.from(cardMap.values());
    }, [pageContent, liveProducts]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef(null);

    const handleNext = useCallback(() => {
        if (categorySlides.length === 0) return;
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % categorySlides.length);
    }, [categorySlides.length]);

    const handlePrev = useCallback(() => {
        if (categorySlides.length === 0) return;
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + categorySlides.length) % categorySlides.length);
    }, [categorySlides.length]);

    // Autoplay cycling every 4 seconds, paused when hovering
    useEffect(() => {
        if (isHovered || categorySlides.length <= 1) return;
        const timer = setInterval(() => {
            handleNext();
        }, 4000);
        return () => clearInterval(timer);
    }, [isHovered, handleNext, categorySlides.length]);

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

    if (categorySlides.length === 0) return null;

    const currentSlide = categorySlides[currentIndex] || categorySlides[0];

    const slideVariants = {
        enter: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "100%" : "-100%",
        }),
        center: {
            opacity: 1,
            x: 0,
            transition: {
                x: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
                opacity: { duration: 0.4 },
            },
        },
        exit: (dir) => ({
            opacity: 0,
            x: dir > 0 ? "-100%" : "100%",
            transition: {
                x: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
                opacity: { duration: 0.4 },
            },
        }),
    };

    return (
        <section
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="group relative w-full h-[260px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-gray-200/80 dark:border-gray-800/80 shadow-xl select-none"
        >
            {/* Animated Category Slide */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={`cat-slide-${currentIndex}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full z-[1]"
                >
                    {/* Direct link to Category Products Page */}
                    <Link
                        to={currentSlide.link}
                        className="relative w-full h-full block cursor-pointer group/slide overflow-hidden"
                    >
                        {/* Full Width & Height Category Background Image */}
                        <img
                            src={currentSlide.image}
                            alt={currentSlide.title}
                            className="w-full h-full object-cover object-center group-hover/slide:scale-105 transition-transform duration-700 block"
                        />

                        {/* Bottom Gradient Shadow for Contrast */}
                        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

                        {/* Category Name in Bottom Center */}
                        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                                {currentSlide.title}
                            </h2>
                        </div>
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Slide Navigation Arrows */}
            {categorySlides.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer"
                        aria-label="Previous Category"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer"
                        aria-label="Next Category"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    {/* Bottom Indicator Dots */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                        {categorySlides.map((_, i) => (
                            <button
                                key={`dot-${i}`}
                                onClick={() => {
                                    setDirection(i > currentIndex ? 1 : -1);
                                    setCurrentIndex(i);
                                }}
                                className={`rounded-full transition-all duration-300 cursor-pointer ${
                                    i === currentIndex
                                        ? "w-6 h-1.5 bg-white shadow-sm"
                                        : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                                }`}
                                aria-label={`Go to category ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
