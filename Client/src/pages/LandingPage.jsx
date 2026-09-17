import { useContext, lazy, Suspense, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeProvider";
import { faqs, products } from "../data/products";
import ProductCard from "../components/LandingComponents/ProductCard";
import { features } from "../data/productGoodness ";
import { UserAuthContext } from "../context/AuthProvider";
import { PageContentContext } from "../context/PageContentProvider";
import company from "../data/company.json";
import MadhuLoader from "../components/MadhuLoader";
import { MilkHealthBenefitsHero, DairyPromiseCardsSection } from "../components/HomeComponents/MilkHealthBenefitsSection";
import ProductShowcase3D from "../components/HomeComponents/ProductShowcase3D";

const Marquee = lazy(() => import("react-fast-marquee"));
const DairyProductsCarousel = lazy(() => import("../components/HomeComponents/DairyProductsCarousel"));
const QuestionAnswer = lazy(() => import("../components/LandingComponents/QuestionAnswer"));

export default function LandingPage() {
    const { pageContent } = useContext(PageContentContext);

    const displayCategories = (pageContent?.landingShowcaseCards && pageContent.landingShowcaseCards.length > 0)
        ? pageContent.landingShowcaseCards
        : ((pageContent?.landingCategories && pageContent.landingCategories.length > 0)
            ? pageContent.landingCategories
            : products);

    const displayFaqs = (pageContent?.faqs && pageContent.faqs.length > 0)
        ? pageContent.faqs
        : faqs;

    const [shuffledCategories, setShuffledCategories] = useState([]);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);


    const categoriesSectionRef = useRef(null);
    const [catScrollProgress, setCatScrollProgress] = useState(0);

    useEffect(() => {
        if (displayCategories && displayCategories.length > 0) {
            const arrayToShuffle = [...displayCategories];
            for (let i = arrayToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arrayToShuffle[i], arrayToShuffle[j]] = [arrayToShuffle[j], arrayToShuffle[i]];
            }
            // Show exactly 4 randomly shuffled cards per page visit / refresh
            setShuffledCategories(arrayToShuffle.slice(0, 4));
        }
    }, [displayCategories]);

    useEffect(() => {
        let ticking = false;
        const handleCatScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (categoriesSectionRef.current) {
                        const rect = categoriesSectionRef.current.getBoundingClientRect();
                        const windowHeight = window.innerHeight;
                        const totalScrollable = rect.height - windowHeight;
                        if (totalScrollable > 0) {
                            const scrolled = -rect.top;
                            const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
                            setCatScrollProgress(progress);
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


    return (
        <>
            {/* Interactive 3D Product Showcase Card Section */}
            <ProductShowcase3D />

            {/* Discover Our Delicious Dairy Range Carousel Section */}
            <section className="px-4 py-8 sm:px-8 md:py-10 max-w-7xl mx-auto my-8 glass-panel rounded-[36px] bg-white/60 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/80 dark:border-white/15 shadow-xl">
                <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-6 text-slate-900 dark:text-white tracking-tight leading-tight drop-shadow-xs"
                >
                    Discover Our Delicious Dairy Range
                </h2>

                <Suspense fallback={<div className="text-center py-5 text-gray-400">Loading carousel...</div>}>
                    <Marquee speed={75} gradient={false} pauseOnHover={true}>
                        <DairyProductsCarousel half="first" />
                    </Marquee>
                </Suspense>

                <Suspense fallback={<div className="text-center py-5 text-gray-400">Loading carousel...</div>}>
                    <Marquee speed={65} gradient={false} direction="right" className="mt-6" pauseOnHover={true}>
                        <DairyProductsCarousel half={"second"} />
                    </Marquee>
                </Suspense>
            </section>

            {/* SECTION 2: MIDDLE - Our Product Categories STICKY STACKING CARDS DECK */}
            <section
                ref={categoriesSectionRef}
                className="relative w-full min-h-[240vh] sm:min-h-[280vh] py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-300 max-w-7xl mx-auto"
            >
                {/* Clean Centralized Heading */}
                <div className="text-center space-y-3 max-w-3xl mx-auto px-4 pt-4 pb-8">
                    <div className="inline-flex items-center gap-2 bg-[#6C5CE7]/10 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#6C5CE7]/20">
                        🥛 Farm Fresh Selections
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Our Product Categories
                    </h2>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-gray-200 font-semibold max-w-2xl mx-auto">
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

            {/* SECTION 3: ABOVE BOTTOM PAGE - Our Promise of Dairy Excellence Cards */}
            <DairyPromiseCardsSection />

            {/* SECTION 4: BOTTOM PAGE - Frequently Asked Questions */}
            <section className="max-w-5xl mx-auto px-4 sm:px-8 py-10 my-8 glass-panel rounded-[36px] bg-white/60 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/80 dark:border-white/15 shadow-xl">
                <div className="flex flex-col items-center text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 mb-2">
                        GOT QUESTIONS? WE'VE GOT ANSWERS
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <div className="w-12 h-1 bg-[#1E88E5] rounded-full mt-3"></div>
                </div>

                <div className="space-y-3">
                    <Suspense fallback={<div className="text-center text-gray-600 dark:text-gray-300 py-6">Loading FAQs...</div>}>
                        {
                            displayFaqs.map((faq, index) => (
                                <QuestionAnswer
                                    key={faq._id || faq.question || index}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={openFaqIndex === index}
                                    onToggle={() => setOpenFaqIndex((prev) => (prev === index ? null : index))}
                                />
                            ))
                        }
                    </Suspense>
                </div>
            </section>
        </>
    );
}
