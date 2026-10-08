import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { faqs, products } from "../data/products";
import { PageContentContext } from "../context/PageContentProvider";
import { ProductContext } from "../context/ProductProvider";
import { slugify } from "../utils/slugify";
import { getCardBackgroundImage } from "../utils/helper";
import HomeWelcomeHero from "../components/HomeComponents/HomeWelcomeHero";
import MobileWelcomeBanner from "../components/HomeComponents/MobileWelcomeBanner";
import ProductVarietyCard from "../components/ProductComponents/ProductVarietyCard";

// ── FAQ Item ─────────────────────────────────────────────
function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 dark:border-gray-800">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 px-0 text-left cursor-pointer transition-colors"
            >
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 pr-4 leading-snug">{question}</span>
                <span className="text-[#0756B5] dark:text-[#35A8E8] text-xl font-bold shrink-0">{open ? "−" : "+"}</span>
            </button>
            {open && (
                <div className="pb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────
export default function HomePage() {
    const { pageContent } = useContext(PageContentContext);
    const { products: liveProducts } = useContext(ProductContext);
    const [visibleCount, setVisibleCount] = useState(8);
    const [selectedCategory, setSelectedCategory] = useState("All");

    // ── Data ──
    const displayFaqs = (pageContent?.faqs?.length > 0) ? pageContent.faqs : faqs;


    // Visual Category Cards Grid
    const categoryGrid = useMemo(() => {
        const cardMap = new Map();
        products.forEach((p) => {
            const title = p.title || p.name;
            if (title) cardMap.set(title.toLowerCase().trim(), {
                title, image: getCardBackgroundImage(p, title),
            });
        });
        if (Array.isArray(pageContent?.homeCategoryCards)) {
            pageContent.homeCategoryCards.forEach((c) => {
                const title = c?.title || c?.name;
                if (title) cardMap.set(title.toLowerCase().trim(), {
                    title, image: getCardBackgroundImage(c, title),
                });
            });
        }
        return Array.from(cardMap.values());
    }, [pageContent]);

    const featuredProducts = useMemo(() => {
        return (liveProducts || []).slice(0, 8);
    }, [liveProducts]);

    // Available Category Filter Tabs
    const availableCategoryTabs = useMemo(() => {
        const set = new Set(["All"]);
        (liveProducts || []).forEach((p) => {
            const c = p?.category || p?.type;
            if (c && typeof c === "string" && c.trim()) {
                const clean = c.trim();
                set.add(clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase());
            }
        });
        return Array.from(set);
    }, [liveProducts]);

    // Filtered Products for "Our Products"
    const filteredProducts = useMemo(() => {
        const list = Array.isArray(liveProducts) && liveProducts.length > 0 ? liveProducts : [];
        if (selectedCategory === "All") return list;
        const sel = selectedCategory.toLowerCase();
        return list.filter((p) => {
            const cat = (p?.category || "").toLowerCase();
            const type = (p?.type || "").toLowerCase();
            const name = (p?.name || p?.title || "").toLowerCase();
            return cat.includes(sel) || type.includes(sel) || name.includes(sel);
        });
    }, [liveProducts, selectedCategory]);

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">

            {/* ── WELCOME BANNER (In between Nav and Home Carousel) ── */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1">
                <MobileWelcomeBanner />
            </div>

            {/* ── HERO BANNER / HOME CAROUSEL ─────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-1">
                <HomeWelcomeHero />
            </div>

            {/* ── PAGE BODY ────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">

                {/* ① FEATURED PRODUCTS */}

                {/* ② FEATURED PRODUCTS */}
                {featuredProducts.length > 0 && (
                    <section className="pt-2 pb-2">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-[#0756B5] dark:text-emerald-400">Featured Products</h2>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Hand-picked farm favourites delivered daily</p>
                            </div>
                            <Link to="/products" className="text-xs sm:text-sm text-[#075C2A] dark:text-blue-400 font-bold hover:underline">
                                View All →
                            </Link>
                        </div>
                        {/* Mobile: horizontal scroll | Desktop: 4-col grid */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-visible pb-2 pt-1">
                            {featuredProducts.map((product, idx) => (
                                <div
                                    key={`fp-${product?._id || idx}`}
                                    className="shrink-0 w-48 sm:w-auto h-full flex flex-col"
                                >
                                    <ProductVarietyCard product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ③ OUR PRODUCTS (With Category Filter & Full Cart/Wishlist Buttons) */}
                <section className="pt-2 pb-2">
                    <div className="mb-4">
                        <h2 className="text-base sm:text-lg font-black text-[#0756B5] dark:text-emerald-400">Our Products</h2>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Pure, organic & farm-fresh with instant cart access</p>
                    </div>

                    {/* Product Cards Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                            No products found in this category.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {filteredProducts.slice(0, visibleCount).map((product, index) => (
                                <ProductVarietyCard
                                    key={`catalog-p-${product?._id || index}`}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More / Explore All */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {visibleCount < filteredProducts.length ? (
                            <button
                                onClick={() => setVisibleCount((p) => p + 8)}
                                className="bg-[#075C2A] hover:bg-[#054593] text-white text-xs sm:text-sm font-bold px-7 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                            >
                                Load More Products ({filteredProducts.length - visibleCount} more)
                            </button>
                        ) : null}
                        <Link
                            to="/products"
                            className="border border-[#075C2A] text-[#075C2A] dark:text-blue-400 hover:bg-[#075C2A]/10 text-xs sm:text-sm font-bold px-7 py-2.5 rounded-full transition-all hover:scale-105"
                        >
                            Explore All in Catalog →
                        </Link>
                    </div>
                </section>

                {/* ④ EXPLORE CATEGORIES (Visual Cards Grid) */}
                <section className="pt-2 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-[#0756B5] dark:text-emerald-400">Explore Goodness</h2>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">Browse by dairy family</p>
                        </div>
                        <Link to="/products" className="text-xs sm:text-sm text-[#075C2A] dark:text-blue-400 font-bold hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {categoryGrid.slice(0, 8).map((cat, index) => (
                            <Link
                                key={`cat-grid-${index}`}
                                to={`/products/${slugify(cat?.title || cat?.name || "")}`}
                                className="block rounded-xl overflow-hidden border border-[#D5A62A]/30 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-[#0756B5] dark:hover:border-emerald-500 hover:shadow-[0_4px_20px_rgba(7,92,42,0.18)] transition-all duration-200 group"
                            >
                                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-[#F5E9D0]/50 via-emerald-50/30 to-[#FFFDF7] dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                                    <img
                                        src={cat.image}
                                        alt={cat?.title || cat?.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Gradient overlay at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <p className="text-xs sm:text-sm font-bold text-white drop-shadow truncate">
                                            {cat?.title || cat?.name}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ⑤ FAQ */}
                <section className="pt-2 pb-4">
                    <h2 className="text-base sm:text-lg font-black text-[#0756B5] dark:text-emerald-400 mb-1">Frequently Asked Questions</h2>
                    <p className="text-xs text-gray-400 mb-4">Everything you need to know about our farm-fresh products.</p>
                    <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-slate-800 shadow-xs">
                        {displayFaqs.slice(0, 8).map((faq, i) => (
                            <FaqItem key={i} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
