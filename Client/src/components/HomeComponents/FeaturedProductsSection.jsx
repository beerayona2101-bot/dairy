import { useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedHeading from "../Common/AnimatedHeading";
import ProductVarietyCard from "../ProductComponents/ProductVarietyCard";
import { fallbackProducts } from "../../data/fallbackProducts";
import { PageContentContext } from "../../context/PageContentProvider";

export default function FeaturedProductsSection({ products = [] }) {
    const { pageContent } = useContext(PageContentContext);
    const sectionData = pageContent?.featuredProductsSection || {};

    // Curate a balanced, diverse selection of 12 top farm dairy products
    const featuredList = useMemo(() => {
        const source = Array.isArray(products) && products.length > 0 ? products : fallbackProducts;

        // Pick diverse favorites across categories (Milk, Paneer, Ghee, Curd, Butter, Lassi, etc.)
        const categoriesOrder = [
            "Milk", "Paneer", "Ghee", "Curd", "Butter", "Lassi",
            "Chaas", "Shrikhand", "Basundi", "Khoya", "Cheese", "Dairy Sweets"
        ];

        const selected = [];
        const usedIds = new Set();

        // 1. Pick prominent item from each key dairy category
        for (const cat of categoriesOrder) {
            const item = source.find(p =>
                !usedIds.has(String(p._id)) &&
                p.category?.toLowerCase() === cat.toLowerCase()
            );
            if (item) {
                selected.push(item);
                usedIds.add(String(item._id));
            }
        }

        // 2. Fill remaining items up to 12 from source catalog
        for (const item of source) {
            if (selected.length >= 12) break;
            if (!usedIds.has(String(item._id))) {
                selected.push(item);
                usedIds.add(String(item._id));
            }
        }

        return selected;
    }, [products]);

    if (!featuredList || featuredList.length === 0) return null;

    return (
        <section id="featured-products" aria-label="Featured Products" className="w-full space-y-3.5 sm:space-y-6">
            {/* Header with Title and "View All" */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4">
                <div className="space-y-0.5 sm:space-y-1.5 text-left">
                    <AnimatedHeading
                        blackText={sectionData.titleBlack || "Featured"}
                        violetText={sectionData.titleHighlight || "Products"}
                        align="left"
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-start"
                        violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                    />

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {sectionData.subtitle || "Pure, organic & nutrient-dense dairy delivered within hours of milking."}
                    </p>
                </div>

                <Link
                    to={sectionData.viewAllLink || "/products"}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#0756B5] dark:text-blue-400 hover:text-[#054593] hover:underline self-start sm:self-auto shrink-0 group"
                >
                    <span>{sectionData.viewAllText || "View All Products"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Products Grid: 8 cards on mobile response (2 cols x 4 rows), 12 cards on web response (4 cols x 3 rows / 3 cols x 4 rows) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {featuredList.slice(0, 12).map((product, idx) => {
                    // First 8 items visible on mobile & web; items 9-12 (idx >= 8) visible on web response (md+)
                    const isExtraWebCard = idx >= 8;
                    return (
                        <div
                            key={`featured-${product?._id || idx}`}
                            className={`${isExtraWebCard ? "hidden md:flex" : "flex"} flex-col h-full`}
                        >
                            <ProductVarietyCard
                                product={product}
                                titleColor="text-black dark:text-white"
                                priceColor="text-[#0756B5] dark:text-blue-400"
                            />
                        </div>
                    );
                })}
            </div>

            {/* Bottom Catalog CTA */}
            <div className="pt-2 text-center">
                <Link
                    to={sectionData.bottomCtaLink || "/products"}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-[#0756B5] dark:text-blue-400 border border-[#0756B5]/30 dark:border-blue-500/30 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <span>{sectionData.bottomCtaText || "Explore Complete Dairy Catalog"}</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}

FeaturedProductsSection.propTypes = {
    products: PropTypes.array,
};
