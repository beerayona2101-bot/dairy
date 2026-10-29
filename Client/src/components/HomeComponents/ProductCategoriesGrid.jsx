import { useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedHeading from "../Common/AnimatedHeading";
import { slugify } from "../../utils/slugify";
import { getCardBackgroundImage } from "../../utils/helper";
import { products as baseCategories } from "../../data/products";

const DEFAULT_CATEGORY_DESCRIPTIONS = {
    "milk": "Pure cow & buffalo milk, rich in natural calcium and vitamins.",
    "paneer": "Soft malai paneer crafted daily with fresh whole milk.",
    "ghee": "Golden clarified butter prepared by slow bilona simmering.",
    "curd": "Thick, silky probiotic set curd for daily gut wellness.",
    "butter": "Farm-churned yellow & white butter, rich and savory.",
    "lassi": "Cooling refreshing churned yogurt beverage in classic flavors.",
    "chaas": "Spiced masala buttermilk infused with roasted cumin and mint.",
    "dairy sweets": "Festive gulab jamun, rasgulla & peda made from pure khoya.",
    "shrikhand": "Strained yogurt delicacy infused with kesar and cardamom.",
    "basundi": "Slow-cooked thickened milk dessert garnished with pistachios.",
    "cheese": "Artisanal mozzarella and aged cheddar crafted from pure milk.",
    "cream": "Fresh double dairy cream for gourmet desserts and cooking.",
};

export default function ProductCategoriesGrid({ pageContent, liveProducts }) {
    const exploreData = pageContent?.exploreCategoriesSection || {};

    // Generate list of showcase categories configured by Admin
    const categories = useMemo(() => {
        // Source active showcase categories: prefer homeCategoryCards, fallback to landingShowcaseCards
        const showcaseSource = Array.isArray(pageContent?.homeCategoryCards)
            ? pageContent.homeCategoryCards
            : (Array.isArray(pageContent?.landingShowcaseCards) ? pageContent.landingShowcaseCards : null);

        // When showcaseSource is defined (even if empty):
        // Only categories with Showcase option ON will appear here.
        // If a category was toggled OFF, it is removed from this array and will NOT appear.
        if (Array.isArray(showcaseSource)) {
            return showcaseSource.map((c) => {
                const title = c?.title || c?.name || "Category";
                const key = title.toLowerCase().trim();
                return {
                    title,
                    image: c.image || getCardBackgroundImage(c, title),
                    description: c.description || DEFAULT_CATEGORY_DESCRIPTIONS[key] || "100% farm-fresh dairy excellence.",
                    link: c.link || `/products/${slugify(title)}`,
                };
            });
        }

        // Safe initial state while pageContent loads
        return [];
    }, [pageContent]);

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section id="categories" aria-label="Product Categories" className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1.5 text-left">
                    <AnimatedHeading
                        blackText={exploreData.titleBlack || "Explore Our"}
                        violetText={exploreData.titleHighlight || "Categories"}
                        align="left"
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-start"
                        violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                    />

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {exploreData.subtitle || "Browse our farm-fresh lineup crafted for taste, health, and purity."}
                    </p>
                </div>

                <Link
                    to={exploreData.viewAllLink || "/products"}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#0756B5] dark:text-blue-400 hover:text-[#054593] hover:underline self-start sm:self-auto shrink-0 group"
                >
                    <span>{exploreData.viewAllText || "View All Categories"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Categories Visual Cards Grid: 2-col on mobile, 3-col on tablet, 4-col on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
                {categories.map((cat, idx) => (
                    <motion.div
                        key={`cat-card-${cat.title}`}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="h-full"
                    >
                        <Link
                            to={`/products/${slugify(cat.title)}`}
                            className="group block rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_35px_-8px_rgba(7,86,181,0.22)] dark:hover:shadow-[0_20px_35px_-8px_rgba(0,0,0,0.6)] hover:border-[#0756B5] dark:hover:border-blue-400 hover:scale-[1.03] hover:-translate-y-2 transform-gpu transition-all duration-200 ease-out cursor-pointer h-full flex flex-col relative z-0 hover:z-20 will-change-transform"
                        >
                            {/* Card Image without inner zoom */}
                            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                                {/* Category Title Tag floating at the bottom of the photo */}
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                                    <h3 className="text-base sm:text-lg font-black tracking-tight drop-shadow-md">
                                        {cat.title}
                                    </h3>
                                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#0756B5] group-hover:scale-110 transition-all duration-200 shrink-0">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Minimal Supporting Description */}
                            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-2">
                                    {cat.description}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

ProductCategoriesGrid.propTypes = {
    pageContent: PropTypes.object,
    liveProducts: PropTypes.array,
};
