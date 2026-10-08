import { useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedHeading from "../Common/AnimatedHeading";
import ProductVarietyCard from "../ProductComponents/ProductVarietyCard";

export default function FeaturedProductsSection({ products = [] }) {
    // Top 8 prominent featured products
    const displayedProducts = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) return [];
        return products.slice(0, 8);
    }, [products]);

    if (!products || products.length === 0) return null;

    return (
        <section id="featured-products" aria-label="Featured Products" className="w-full space-y-6">
            {/* Header with Title and "View All" */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1.5 text-left">
                    <AnimatedHeading
                        blackText="Featured"
                        violetText="Products"
                        align="left"
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight justify-start"
                        violetClassName="text-[#0756B5] dark:text-blue-400 font-black"
                    />

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                        Pure, organic &amp; nutrient-dense dairy delivered within hours of milking.
                    </p>
                </div>

                <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#0756B5] dark:text-blue-400 hover:text-[#054593] hover:underline self-start sm:self-auto shrink-0 group"
                >
                    <span>View All Products</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Products Grid: Responsive 2-col on mobile, 3-col on tablet, 4-col on desktop */}
            {displayedProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No products found in this category right now.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                    {displayedProducts.map((product, idx) => (
                        <div key={`featured-${product?._id || idx}`} className="h-full flex flex-col">
                            <ProductVarietyCard product={product} />
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Catalog CTA */}
            <div className="pt-2 text-center">
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-[#0756B5] dark:text-blue-400 border border-[#0756B5]/30 dark:border-blue-500/30 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <span>Explore Complete Dairy Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}

FeaturedProductsSection.propTypes = {
    products: PropTypes.array,
};
