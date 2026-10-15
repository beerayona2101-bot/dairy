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
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white">Featured</span>
                        <span className="text-[#0756B5] dark:text-blue-400">Products</span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Hand-picked farm favourites delivered daily</p>
                </div>
                <Link to="/products" className="text-xs text-[#0756B5] dark:text-blue-400 font-extrabold hover:underline">
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
