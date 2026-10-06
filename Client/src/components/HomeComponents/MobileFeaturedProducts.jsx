import { useContext } from "react";
import { Link } from "react-router-dom";
import { ProductContext } from "../../context/ProductProvider";
import ProductVarietyCard from "../ProductComponents/ProductVarietyCard";

export default function MobileFeaturedProducts() {
    const { products } = useContext(ProductContext);
    const featuredProducts = (products || []).slice(0, 8);
    if (featuredProducts.length === 0) return null;

    return (
        <section className="md:hidden w-full bg-white dark:bg-slate-900 pt-5 pb-3">
            {/* Header */}
            <div className="px-4 mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Featured Products</h2>
                    <p className="text-[10px] text-gray-400">Farm-fresh favourites</p>
                </div>
                <Link to="/products" className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                    View All →
                </Link>
            </div>

            {/* Horizontal Scroll */}
            <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
                {featuredProducts.map((product, idx) => (
                    <div key={`mfp-${product?._id || idx}`} className="shrink-0 w-48 flex flex-col">
                        <ProductVarietyCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
}
