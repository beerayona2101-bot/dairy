import { lazy, Suspense, useContext, useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "../assets/heroImage.png";
import { faqs, products } from "../data/products";
import { UserAuthContext } from "../context/AuthProvider";
import { PageContentContext } from "../context/PageContentProvider";
import OfferingProductCard from "../components/HomeComponents/OfferingProductCard";
import ProductCard from "../components/LandingComponents/ProductCard";
import company from "../data/company.json";
import { getProductImage } from "../utils/helper";
import ProductShowcase3D from "../components/HomeComponents/ProductShowcase3D";
import { DairyPromiseCardsSection } from "../components/HomeComponents/MilkHealthBenefitsSection";
import HomeWelcomeHero from "../components/HomeComponents/HomeWelcomeHero";

import AnimatedHeading from "../components/Common/AnimatedHeading";
import DairyShowcaseBanner from "../components/Common/DairyShowcaseBanner";

import ProductCategoriesSection from "../components/HomeComponents/ProductCategoriesSection";
const Marquee = lazy(() => import("react-fast-marquee"));
const DairyProductsCarousel = lazy(() => import("../components/HomeComponents/DairyProductsCarousel"));
const QuestionAnswer = lazy(() => import("../components/LandingComponents/QuestionAnswer"));

export default function HomePage() {

    const { authUser } = useContext(UserAuthContext);
    const { pageContent } = useContext(PageContentContext);
    const [visibleCount, setVisibleCount] = useState(() => (typeof window !== "undefined" && window.innerWidth < 640 ? 8 : 9));
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [shuffledCategories, setShuffledCategories] = useState([]);

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
        let ticking = false;
        let lastCatProgress = -1;
        const handleCatScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (categoriesSectionRef.current) {
                        const rect = categoriesSectionRef.current.getBoundingClientRect();
                        const windowHeight = window.innerHeight;
                        // Only compute scroll progress when section is visible in viewport
                        if (rect.bottom > 0 && rect.top < windowHeight) {
                            const totalScrollable = rect.height - windowHeight;
                            if (totalScrollable > 0) {
                                const scrolled = -rect.top;
                                const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
                                const roundedProgress = Math.round(rawProgress * 100) / 100; // Step by 1%
                                if (Math.abs(roundedProgress - lastCatProgress) >= 0.01) {
                                    lastCatProgress = roundedProgress;
                                    setCatScrollProgress(roundedProgress);
                                }
                            }
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleCatScroll, { passive: true });
        handleCatScroll();
        return () => window.removeEventListener("scroll", handleCatScroll);
    }, [shuffledCategories.length]);

    useEffect(() => {
        let ticking = false;
        let lastGoodnessProgress = -1;
        const handleGoodnessScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (goodnessSectionRef.current) {
                        const rect = goodnessSectionRef.current.getBoundingClientRect();
                        const windowHeight = window.innerHeight;
                        if (rect.bottom > 0 && rect.top < windowHeight) {
                            const totalScrollable = rect.height - windowHeight;
                            if (totalScrollable > 0) {
                                const scrolled = -rect.top;
                                const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
                                const roundedProgress = Math.round(rawProgress * 100) / 100;
                                if (Math.abs(roundedProgress - lastGoodnessProgress) >= 0.01) {
                                    lastGoodnessProgress = roundedProgress;
                                    setGoodnessScrollProgress(roundedProgress);
                                }
                            }
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleGoodnessScroll, { passive: true });
        handleGoodnessScroll();
        return () => window.removeEventListener("scroll", handleGoodnessScroll);
    }, [visibleCount]);

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 640;
            setVisibleCount((prev) => {
                if (isMobile && prev === 9) return 8;
                if (!isMobile && prev === 8) return 9;
                return prev;
            });
        };
        window.addEventListener("resize", handleResize, { passive: true });
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleViewMore = () => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
        setVisibleCount((prev) => prev + (isMobile ? 8 : 9));
    };

    const visibleCards = displayHomeCategoryCards.slice(0, visibleCount);



    return (
        <>
            {/* 1. Personalized Home Welcome Hero Banner */}
            <HomeWelcomeHero />

            {/* 2. Interactive 3D Product Showcase Hero Section */}
            <ProductShowcase3D />

            {/* 3. Discover Our Delicious Dairy Range Carousel Section (Full-Width Edge-to-Edge) */}
            <section className="w-full py-8 md:py-12 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center mb-6 sm:mb-8">
                    <AnimatedHeading
                        blackText="Discover Our"
                        violetText="Delicious"
                        suffixText="Dairy Range"
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight justify-center"
                    />
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
            <ProductCategoriesSection displayCategories={displayCategories} />

            {/* 5. Our Goodness Grid Section (Mobile Sticky Stacking Cards Transition & Desktop Grid) */}
            <section ref={goodnessSectionRef} className="py-10 sm:py-16 px-3 sm:px-6 lg:px-10 max-w-7xl mx-auto">
                <div className="text-center mb-8 sm:mb-12">
                    <AnimatedHeading
                        blackText="Our"
                        violetText="Goodness"
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight justify-center"
                    />
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
                            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 py-3 rounded-full shadow-md font-bold text-sm transition-all duration-300 cursor-pointer hover:scale-105 periodic-glass-shine btn-reflection"
                        >
                            <span className="relative z-10">View More</span>
                        </button>
                    ) : (
                        <Link
                            to="/products"
                            className="bg-[#213448] hover:bg-[#162331] text-white px-8 py-3 rounded-full shadow-md font-bold text-sm transition-all duration-300 cursor-pointer hover:scale-105 periodic-glass-shine btn-reflection"
                        >
                            <span className="relative z-10">Explore All Products</span>
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
                    <AnimatedHeading
                        blackText="Frequently Asked"
                        violetText="Questions"
                        className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight justify-center"
                    />
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

            {/* 8. Madhu Dairy Wide Range of Products Banner */}
            <DairyShowcaseBanner />
        </>
    );
}

