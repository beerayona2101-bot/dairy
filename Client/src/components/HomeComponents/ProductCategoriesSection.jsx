import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import ProductCard from "../LandingComponents/ProductCard";
import AnimatedHeading from "../Common/AnimatedHeading";
import { products } from "../../data/products";
import { getCardBackgroundImage } from "../../utils/helper";

function StackedCategoryCard({ index, totalCards, scrollYProgress, product }) {
    const rangeCount = Math.max(1, totalCards - 1);
    const step = 1 / rangeCount;

    // Range when THIS card moves UP from translateY(100%) -> translateY(0%) to cover previous card
    const startCover = (index - 1) * step;
    const endCover = index * step;

    // Range when NEXT card moves UP to cover THIS card
    const startUnder = index * step;
    const endUnder = (index + 1) * step;

    // 1. translateY transform:
    // Card 0 stays centered at 0px until next card covers it, then moves up -12px for depth.
    // Cards 1..N animate from 100vh (bottom of screen) -> 0px as user scrolls into their cover range.
    const y = useTransform(
        scrollYProgress,
        index === 0
            ? [0, startUnder, endUnder]
            : [Math.max(0, startCover - 0.001), startCover, endCover, Math.min(1, endUnder)],
        index === 0
            ? ["0px", "0px", "-12px"]
            : ["100vh", "100vh", "0px", "-12px"],
        { clamp: true }
    );

    // 2. Scale transform:
    // Card stays at scale 1.0 until the next card comes up over it, then scales down to 0.96 for depth
    const scale = useTransform(
        scrollYProgress,
        [startUnder, endUnder],
        [1, 0.96],
        { clamp: true }
    );

    // 3. Opacity transform:
    // Card 0 starts at opacity 1.0 and remains 1.0.
    // Card i (i > 0) starts at 0, quickly fades in to 1 as it moves up, and stays 1.0.
    const opacity = useTransform(
        scrollYProgress,
        index === 0
            ? [0, 1]
            : [Math.max(0, startCover), Math.min(1, startCover + step * 0.15)],
        index === 0
            ? [1, 1]
            : [0, 1],
        { clamp: true }
    );

    return (
        <motion.div
            style={{
                y,
                scale,
                opacity,
                zIndex: (index + 1) * 10,
            }}
            className="absolute inset-0 m-auto w-full max-w-6xl h-full flex items-center justify-center transform-gpu will-change-transform px-2 sm:px-4"
        >
            <div className="w-full">
                <ProductCard
                    title={product.title || product.name}
                    description={product.description}
                    image={getCardBackgroundImage(product, product.title || product.name)}
                    features={product?.features}
                    isReversed={index % 2 !== 0}
                    isStacked={true}
                />
            </div>
        </motion.div>
    );
}

export default function ProductCategoriesSection({ displayCategories }) {
    const sectionRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const categoriesList = displayCategories && displayCategories.length > 0 ? displayCategories : products;
    // Keep exact order, display up to 6 cards for optimal scroll deck performance matching reference design
    const cardsToDisplay = categoriesList.length > 6 ? categoriesList.slice(0, 6) : categoriesList;
    const totalCards = cardsToDisplay.length;

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const rangeCount = Math.max(1, totalCards - 1);
        const rawIdx = Math.round(latest * rangeCount);
        const clampedIdx = Math.min(totalCards - 1, Math.max(0, rawIdx));
        if (clampedIdx !== activeIndex) {
            setActiveIndex(clampedIdx);
        }
    });

    // Fast & smooth vertical scroll distance per card transition
    const sectionHeight = `${totalCards * 45}vh`;

    return (
        <section
            ref={sectionRef}
            style={{ height: sectionHeight }}
            className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
        >
            {/* STICKY CONTAINER: Pinned cleanly below navbar so card deck fits 100% viewport */}
            <div className="sticky top-[56px] sm:top-[64px] w-full flex flex-col items-center justify-start pt-1 sm:pt-2 pb-2">
                
                {/* 1. STICKY HEADING - Tight gap directly above cards */}
                <div className="text-center space-y-1 max-w-3xl mx-auto px-4 shrink-0 z-40 mb-2 sm:mb-3 md:mb-4">
                    <AnimatedHeading
                        blackText="Our Product"
                        violetText="Categories"
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2D3748] dark:text-white tracking-tight leading-tight justify-center"
                    />

                    <p className="text-xs sm:text-sm text-[#718096] dark:text-gray-300 font-medium max-w-xl mx-auto line-clamp-1">
                        Explore our wide range of 100% pure, farm-fresh A2 dairy products delivered daily.
                    </p>
                </div>

                {/* 2. OVERLAPPING CARDS STAGE - Perfect height for 100% viewport visibility */}
                <div className="relative w-full max-w-6xl mx-auto h-[380px] sm:h-[400px] md:h-[420px] lg:h-[440px] flex items-center justify-center">
                    {cardsToDisplay.map((product, index) => (
                        <StackedCategoryCard
                            key={`cat-card-${index}-${product.title || product.name}`}
                            index={index}
                            totalCards={totalCards}
                            scrollYProgress={scrollYProgress}
                            product={product}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
