import { lazy, Suspense, useContext, useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "../assets/heroImage.png";
import { faqs, products } from "../data/products";
import MadhurLoader from "../components/MadhurLoader";
import { UserAuthContext } from "../context/AuthProvider";
import { PageContentContext } from "../context/PageContentProvider";
import OfferingProductCard from "../components/HomeComponents/OfferingProductCard";
import ProductCard from "../components/LandingComponents/ProductCard";
import company from "../data/company.json";
import { getProductImage } from "../utils/helper";
import ProductShowcase3D from "../components/HomeComponents/ProductShowcase3D";
import { DairyPromiseCardsSection } from "../components/HomeComponents/MilkHealthBenefitsSection";
import HomeWelcomeHero from "../components/HomeComponents/HomeWelcomeHero";

const Marquee = lazy(() => import("react-fast-marquee"));
const DairyProductsCarousel = lazy(() => import("../components/HomeComponents/DairyProductsCarousel"));
const QuestionAnswer = lazy(() => import("../components/LandingComponents/QuestionAnswer"));

export default function HomePage() {

    const { authUser } = useContext(UserAuthContext);
    const { pageContent } = useContext(PageContentContext);
    const [visibleCount, setVisibleCount] = useState(9);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [shuffledCategories, setShuffledCategories] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    const displayHeroImage = pageContent?.heroBannerImage || heroImage;
    const displayCompanyName = pageContent?.companyName || company?.name;
    const displayTagline = pageContent?.companyTagline || company?.tagline;

    const displayFaqs = (pageContent?.faqs && pageContent.faqs.length > 0)
        ? pageContent.faqs
        : faqs;

    const displayCategories = (pageContent?.landingShowcaseCards && pageContent.landingShowcaseCards.length > 0)
        ? pageContent.landingShowcaseCards
        : ((pageContent?.landingCategories && pageContent.landingCategories.length > 0)
            ? pageContent.landingCategories
            : products);

    const displayHomeCategoryCards = useMemo(() => {
        const cardMap = new Map();

        // 1. Add all 16 base categories from products data
        products.forEach((p) => {
            const title = p.title || p.name;
            if (title) {
                const key = title.toLowerCase().trim();
                cardMap.set(key, {
                    title,
                    image: p.image || getProductImage(p),
                    description: p.description,
                    features: p.features,
                });
            }
        });

        // 2. Merge with admin homeCategoryCards
        if (Array.isArray(pageContent?.homeCategoryCards)) {
            pageContent.homeCategoryCards.forEach((c) => {
                const title = c?.title || c?.name;
                if (title) {
                    const key = title.toLowerCase().trim();
                    const existing = cardMap.get(key) || {};
                    cardMap.set(key, {
                        ...existing,
                        title,
                        image: c.image || existing.image || getProductImage(c),
                        description: c.description || existing.description,
                        features: c.features || existing.features,
                    });
                }
            });
        }

        // 3. Merge with admin landingShowcaseCards
        if (Array.isArray(pageContent?.landingShowcaseCards)) {
            pageContent.landingShowcaseCards.forEach((sc) => {
                if (sc?.title) {
                    const key = sc.title.toLowerCase().trim();
                    const existing = cardMap.get(key) || {};
                    cardMap.set(key, {
                        ...existing,
                        title: sc.title,
                        image: sc.image || existing.image || getProductImage(sc),
                        description: sc.description || existing.description,
                        features: sc.features || existing.features,
                    });
                }
            });
        }

        return Array.from(cardMap.values());
    }, [pageContent]);

    useEffect(() => {
        const handleWindowLoad = () => {
            setPageLoading(false);
        };

        if (document.readyState === "complete") {
            setPageLoading(false);
        } else {
            window.addEventListener("load", handleWindowLoad);
        }

        return () => {
            window.removeEventListener("load", handleWindowLoad);
        };
    }, []);

    const categoriesSectionRef = useRef(null);
    const [catScrollProgress, setCatScrollProgress] = useState(0);

    const goodnessSectionRef = useRef(null);
    const [goodnessScrollProgress, setGoodnessScrollProgress] = useState(0);

    useEffect(() => {
        if (displayCategories && displayCategories.length > 0) {
            const arrayToShuffle = [...displayCategories];
            for (let i = arrayToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arrayToShuffle[i], arrayToShuffle[j]] = [arrayToShuffle[j], arrayToShuffle[i]];
            }
            setShuffledCategories(arrayToShuffle.slice(0, 4));
        }
    }, [displayCategories]);

    useEffect(() => {
        const handleCatScroll = () => {
            if (!categoriesSectionRef.current) return;
            const rect = categoriesSectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const totalScrollable = rect.height - windowHeight;
            if (totalScrollable <= 0) return;

            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
            setCatScrollProgress(progress);
        };

        window.addEventListener("scroll", handleCatScroll, { passive: true });
        handleCatScroll();
        return () => window.removeEventListener("scroll", handleCatScroll);
    }, [shuffledCategories.length]);

    useEffect(() => {
        const handleGoodnessScroll = () => {
            if (!goodnessSectionRef.current) return;
            const rect = goodnessSectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const totalScrollable = rect.height - windowHeight;
            if (totalScrollable <= 0) return;

            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
            setGoodnessScrollProgress(progress);
        };

        window.addEventListener("scroll", handleGoodnessScroll, { passive: true });
        handleGoodnessScroll();
        return () => window.removeEventListener("scroll", handleGoodnessScroll);
    }, [visibleCount]);

    const handleViewMore = () => {
        setVisibleCount((prev) => prev + 9);
    };

    const visibleCards = displayHomeCategoryCards.slice(0, visibleCount);

    if (pageLoading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black">
                <MadhurLoader message="Fresh Dairy Goods Loading..." />
            </div>
        );
    }

    return (
        <>
            {/* 1. Personalized Home Welcome Hero Banner */}
            <HomeWelcomeHero />

            {/* 2. Interactive 3D Product Showcase Hero Section */}
            <ProductShowcase3D />

            {/* 3. Discover Our Delicious Dairy Range Carousel Section (Full-Width Edge-to-Edge) */}
            <section className="w-full py-8 md:py-12 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center mb-6 sm:mb-8">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight">
                        Discover Our <span className="text-[#6C5CE7] dark:text-[#A29BFE]">Delicious</span> Dairy Range
                    </h2>
                </div>

                <Suspense fallback={<div className="text-center py-5 text-gray-400">Loading carousel...</div>}>
                    <Marquee speed={75} gradient={false} pauseOnHover={true} className="w-full overflow-hidden">
                        <DairyProductsCarousel half="first" />
                    </Marquee>
                </Suspense>

                <Suspense fallback={<div className="text-center py-5 text-gray-400">Loading carousel...</div>}>
                    <Marquee speed={65} gradient={false} direction="right" className="mt-6 w-full overflow-hidden" pauseOnHover={true}>
                        <DairyProductsCarousel half={"second"} />
                    </Marquee>
                </Suspense>
            </section>

            {/* 4. Our Product Categories Section - STICKY STACKING CARDS DECK */}
            <section
                ref={categoriesSectionRef}
                className="relative w-full min-h-[240vh] sm:min-h-[280vh] py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-300 max-w-7xl mx-auto"
            >
                {/* Clean Centralized Heading (No card box wrapper, no border, no background, no dots/numbers) */}
                <div className="text-center space-y-3 max-w-3xl mx-auto px-4 pt-4 pb-8">
                    <div className="inline-flex items-center gap-2 bg-[#6C5CE7]/10 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#6C5CE7]/20">
                        🥛 Farm Fresh Selections
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight">
                        Our Product <span className="text-[#6C5CE7] dark:text-[#A29BFE]">Categories</span>
                    </h2>
                    <p className="text-sm sm:text-base text-[#718096] dark:text-gray-300 font-medium max-w-2xl mx-auto">
                        Explore our wide range of 100% pure, farm-fresh A2 dairy products delivered daily to your doorstep.
                    </p>
                </div>

                {/* Sticky Stacking Cards Deck Container */}
                <div className="max-w-6xl mx-auto relative w-full pt-1">
                    {shuffledCategories.map((product, index) => {
                        const totalCards = shuffledCategories.length || 4;
                        const cardStep = 1 / totalCards;
                        const cardNext = (index + 1) * cardStep;

                        let depth = 0;
                        if (catScrollProgress > cardNext) {
                            depth = Math.min(3, (catScrollProgress - cardNext) / cardStep);
                        }

                        const scale = Math.max(0.93, 1 - depth * 0.035);
                        const opacity = Math.max(0.78, 1 - depth * 0.08);
                        const brightness = Math.max(0.85, 1 - depth * 0.05);

                        // Sticky top offset below fixed navbar (~74px height)
                        const topOffsetDesktop = 96 + index * 12;

                        return (
                            <div
                                key={`shuffled-cat-${index}-${product.title || product.name}`}
                                style={{
                                    top: `${topOffsetDesktop}px`,
                                    zIndex: (index + 1) * 10,
                                }}
                                className="sticky transition-all duration-200 ease-out mb-8 sm:mb-12"
                            >
                                <motion.div
                                    style={{
                                        transform: `scale(${scale})`,
                                        opacity: opacity,
                                        filter: `brightness(${brightness})`,
                                    }}
                                    className="w-full transition-transform duration-300"
                                >
                                    <ProductCard
                                        title={product.title || product.name}
                                        description={product.description}
                                        image={product.image}
                                        features={product?.features}
                                        isReversed={index % 2 === 0}
                                        isStacked={true}
                                    />
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-8 pb-4">
                    <Link
                        to="/products"
                        className="flex items-center gap-3 px-8 py-3.5 rounded-full font-black text-sm sm:text-base bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white transition-all duration-300 shadow-[0_12px_25px_rgba(108,92,231,0.4)] hover:scale-105 border border-purple-300/30 cursor-pointer"
                    >
                        <span>Explore Full Product Range</span>
                        <span className="text-lg">→</span>
                    </Link>
                </div>
            </section>

            {/* 5. Our Goodness Grid Section (Mobile Sticky Stacking Cards Transition & Desktop Grid) */}
            <section ref={goodnessSectionRef} className="py-10 sm:py-16 px-3 sm:px-6 lg:px-10 max-w-7xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight">
                        Our <span className="text-[#6C5CE7] dark:text-[#A29BFE]">Goodness</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm md:text-base font-medium">
                        Comes in many forms — all pure, nutritious, and farm-fresh.
                    </p>
                </div>

                {/* 2-Column Mobile & Multi-Column Desktop Grid View */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8 max-w-6xl mx-auto">
                    {visibleCards.map((product, index) => (
                        <OfferingProductCard
                            key={`home-cat-${index}-${product?.title || product?.name}`}
                            title={product?.title || product?.name}
                            image={product?.image || getProductImage(product)}
                        />
                    ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {visibleCount < displayHomeCategoryCards.length ? (
                        <button
                            onClick={handleViewMore}
                            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 py-3 rounded-full shadow-md font-bold text-sm transition-all duration-300 cursor-pointer hover:scale-105"
                        >
                            View More
                        </button>
                    ) : (
                        <Link
                            to="/products"
                            className="bg-[#213448] hover:bg-[#162331] text-white px-8 py-3 rounded-full shadow-md font-bold text-sm transition-all duration-300 cursor-pointer hover:scale-105"
                        >
                            Explore All Products
                        </Link>
                    )}
                </div>
            </section>

            {/* 6. Our Promise of Dairy Excellence Cards */}
            <DairyPromiseCardsSection />

            {/* 7. Frequently Asked Questions */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                <div className="flex flex-col items-center text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 mb-2">
                        GOT QUESTIONS? WE'VE GOT ANSWERS
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Frequently Asked <span className="text-[#6C5CE7] dark:text-[#A29BFE]">Questions</span>
                    </h2>
                    <div className="w-12 h-1 bg-[#1E88E5] rounded-full mt-3"></div>
                </div>

                <div className="space-y-3">
                    <Suspense fallback={<div className="text-center text-gray-600 dark:text-gray-300 py-6">Loading FAQs...</div>}>
                        {displayFaqs.map((faq, index) => (
                            <QuestionAnswer
                                key={faq?._id || faq?.question || `faq-item-${index}`}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFaqIndex === index}
                                onToggle={() => setOpenFaqIndex((prev) => (prev === index ? null : index))}
                            />
                        ))}
                    </Suspense>
                </div>
            </section>
        </>
    );
}
