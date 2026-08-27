import { useContext, lazy, Suspense, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeProvider";
import { faqs, products } from "../data/products";
import ProductCard from "../components/LandingComponents/ProductCard";
import { features } from "../data/productGoodness ";
import { UserAuthContext } from "../context/AuthProvider";
import { PageContentContext } from "../context/PageContentProvider";
import company from "../data/company.json";
import MadhurLoader from "../components/MadhurLoader";
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

    const [pageLoading, setPageLoading] = useState(true);
    const [shuffledCategories, setShuffledCategories] = useState([]);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

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

    if (pageLoading) {
        return <MadhurLoader message="Fresh Dairy Goods Loading..." />;
    }

    return (
        <>
            {/* Interactive 3D Product Showcase Card Section */}
            <ProductShowcase3D />

            {/* Discover Our Delicious Dairy Range Carousel Section */}
            <section className="px-3 py-6 sm:px-6 md:py-10 max-w-7xl mx-auto">
                <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-6 text-[#2D3748] dark:text-white tracking-tight leading-tight"
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

            {/* SECTION 2: MIDDLE - Our Product Categories */}
            <section className="py-10 md:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-[#6C5CE7]/10 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-[#6C5CE7]/20">
                        🥛 Farm Fresh Selections
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight">
                        Our Product Categories
                    </h2>
                    <p className="text-sm sm:text-base text-[#718096] dark:text-gray-300 font-medium">
                        Explore our wide range of 100% pure, farm-fresh A2 dairy products delivered daily to your doorstep.
                    </p>
                </div>

                <div className="space-y-10 max-w-7xl mx-auto">
                    {shuffledCategories.map((product, index) => (
                        <motion.div
                            key={`shuffled-cat-${index}-${product.title || product.name}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.05 * index }}
                        >
                            <ProductCard
                                title={product.title || product.name}
                                description={product.description}
                                image={product.image}
                                features={product?.features}
                                isReversed={index % 2 === 0}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center pt-6">
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
            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                <div className="flex flex-col items-center text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 mb-2">
                        GOT QUESTIONS? WE'VE GOT ANSWERS
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
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
