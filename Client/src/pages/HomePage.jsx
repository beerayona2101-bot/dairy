import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { faqs, products } from "../data/products";
import { PageContentContext } from "../context/PageContentProvider";
import { ProductContext } from "../context/ProductProvider";
import { CartContext } from "../context/CartProvider";
import { getCardBackgroundImage, getProductImage, getDiscountedPrice } from "../utils/helper";
import { slugify } from "../utils/slugify";
import { formatNumberWithCommas } from "../utils/format";
import HomeWelcomeHero from "../components/HomeComponents/HomeWelcomeHero";
import { useSnackbar } from "notistack";

// ── Category emoji map ──────────────────────────────────
const CATEGORY_EMOJIS = {
    milk: "🥛", paneer: "🧀", ghee: "🫙", curd: "🍶",
    butter: "🧈", lassi: "🥤", chaas: "🥤", sweets: "🍮",
    khoya: "🍯", cream: "🍦", cheese: "🧀", powder: "🥛",
};
function getCategoryEmoji(title) {
    const lower = (title || "").toLowerCase();
    for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
        if (lower.includes(key)) return emoji;
    }
    return "🥛";
}

// ── FAQ Item ─────────────────────────────────────────────
function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 px-0 text-left cursor-pointer"
            >
                <span className="text-sm font-semibold text-gray-800 pr-4 leading-snug">{question}</span>
                <span className="text-gray-400 text-xl shrink-0">{open ? "−" : "+"}</span>
            </button>
            {open && (
                <div className="pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────
export default function HomePage() {
    const { enqueueSnackbar } = useSnackbar();
    const { pageContent } = useContext(PageContentContext);
    const { products: liveProducts } = useContext(ProductContext);
    const { addToCart } = useContext(CartContext);
    const [addedIds, setAddedIds] = useState(new Set());
    const [visibleCount, setVisibleCount] = useState(8);

    // ── Data ──
    const displayFaqs = (pageContent?.faqs?.length > 0) ? pageContent.faqs : faqs;

    const categories = useMemo(() => {
        const cardMap = new Map();
        products.forEach((p) => {
            const title = p.title || p.name;
            if (title) cardMap.set(title.toLowerCase().trim(), { title });
        });
        if (Array.isArray(pageContent?.homeCategoryCards)) {
            pageContent.homeCategoryCards.forEach((c) => {
                const title = c?.title || c?.name;
                if (title) cardMap.set(title.toLowerCase().trim(), { title });
            });
        }
        return Array.from(cardMap.values()).slice(0, 12);
    }, [pageContent]);

    const productGrid = useMemo(() => {
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

    const featuredProducts = (liveProducts || []).slice(0, 8);

    // ── Cart ──
    const handleAddToCart = (product) => {
        if (!product?._id) return;
        const rawPrice = Number(product.price) || 0;
        const rawDiscount = Number(product.discount) || 0;
        const { discountedPrice } = getDiscountedPrice(rawPrice, rawDiscount);
        const finalPrice = discountedPrice > 0 ? discountedPrice : rawPrice;
        addToCart(product._id, 1, finalPrice);
        enqueueSnackbar(`${product.name || "Product"} added!`, { variant: "success" });
        setAddedIds((prev) => new Set([...prev, String(product._id)]));
        setTimeout(() => {
            setAddedIds((prev) => { const n = new Set(prev); n.delete(String(product._id)); return n; });
        }, 1800);
    };

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* ── HERO BANNER ─────────────────────────────── */}
            <HomeWelcomeHero />

            {/* ── PAGE BODY ────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">

                {/* ① SHOP BY CATEGORY */}
                <section className="pt-2 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-violet-700">Shop by Category</h2>
                        <Link to="/products" className="text-sm text-violet-500 font-semibold">
                            See All →
                        </Link>
                    </div>
                    {/* Mobile: horizontal scroll | Desktop: wrap grid */}
                    <div className="flex gap-5 overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible">
                        {categories.map((cat, idx) => (
                            <Link
                                key={`cat-${idx}`}
                                to={`/products/${slugify(cat.title)}`}
                                className="shrink-0 flex flex-col items-center gap-2"
                            >
                                <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center border border-violet-100 hover:border-violet-400 hover:bg-violet-100 transition-colors">
                                    <span className="text-2xl">{getCategoryEmoji(cat.title)}</span>
                                </div>
                                <span className="text-[11px] text-violet-700 font-semibold text-center w-16 truncate">
                                    {cat.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ② FEATURED PRODUCTS */}
                {featuredProducts.length > 0 && (
                    <section className="pt-2 pb-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-violet-700">Featured Products</h2>
                            <Link to="/products" className="text-sm text-violet-500 font-semibold">
                                View All →
                            </Link>
                        </div>
                        {/* Mobile: horizontal scroll | Desktop: 4-col grid */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 sm:overflow-visible">
                            {featuredProducts.map((product, idx) => {
                                const rawPrice = Number(product?.price) || 0;
                                const rawDiscount = Number(product?.discount) || 0;
                                const { discountedPrice } = getDiscountedPrice(rawPrice, rawDiscount);
                                const finalPrice = discountedPrice > 0 ? discountedPrice : rawPrice;
                                const isAdded = addedIds.has(String(product._id));

                                return (
                                    <div
                                        key={`fp-${idx}`}
                                        className="shrink-0 w-44 sm:w-auto rounded-xl border border-violet-100 bg-white overflow-hidden flex flex-col hover:border-violet-300 hover:shadow-[0_4px_20px_rgba(108,92,231,0.18)] transition-all duration-200"
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product?.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Violet gradient overlay at bottom */}
                                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-violet-900/20 to-transparent pointer-events-none" />
                                            {rawDiscount > 0 && (
                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                    -{rawDiscount}%
                                                </span>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="p-3 flex flex-col gap-2 flex-1">
                                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                                                {product?.name}
                                            </p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm font-bold text-gray-900">
                                                    ₹{formatNumberWithCommas(finalPrice)}
                                                </span>
                                                {rawDiscount > 0 && (
                                                    <span className="text-[10px] text-gray-400 line-through">
                                                        ₹{formatNumberWithCommas(rawPrice)}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer mt-auto ${
                                                    isAdded ? "bg-green-500 text-white" : "bg-violet-600 text-white hover:bg-violet-700"
                                                }`}
                                            >
                                                {isAdded ? "✓ Added" : "+ Add to Cart"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ③ OUR PRODUCTS GRID */}
                <section className="pt-2 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-violet-700">Our Products</h2>
                        <Link to="/products" className="text-sm text-violet-500 font-semibold">
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {productGrid.slice(0, visibleCount).map((product, index) => (
                            <Link
                                key={`pg-${index}`}
                                to={`/products/${slugify(product?.title || product?.name || "")}`}
                                className="block rounded-xl overflow-hidden border border-violet-100 bg-white hover:border-violet-300 hover:shadow-[0_4px_20px_rgba(108,92,231,0.18)] transition-all duration-200"
                            >
                                <div className="relative h-48 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden">
                                    <img
                                        src={getCardBackgroundImage(product, product?.title || product?.name)}
                                        alt={product?.title || product?.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Violet gradient overlay at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-violet-900/20 to-transparent pointer-events-none" />
                                </div>
                                <div className="px-3 py-2.5">
                                    <p className="text-xs font-bold text-violet-700 truncate">
                                        {product?.title || product?.name}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Load More / Explore All */}
                    <div className="mt-5 flex justify-center">
                        {visibleCount < productGrid.length ? (
                            <button
                                onClick={() => setVisibleCount((p) => p + 8)}
                                className="border border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white text-sm font-bold px-8 py-2.5 rounded-full transition-colors cursor-pointer"
                            >
                                Load More
                            </button>
                        ) : (
                            <Link
                                to="/products"
                                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-8 py-2.5 rounded-full transition-colors"
                            >
                                Explore All Products
                            </Link>
                        )}
                    </div>
                </section>

                {/* ④ FAQ */}
                <section className="pt-2 pb-4">
                    <h2 className="text-base font-bold text-violet-700 mb-1">Frequently Asked Questions</h2>
                    <p className="text-xs text-gray-400 mb-4">Everything you need to know about our products.</p>
                    <div>
                        {displayFaqs.slice(0, 8).map((faq, i) => (
                            <FaqItem key={i} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </section>

            </div>

            {/* Bottom spacing for mobile nav bar */}
            <div className="h-24 lg:h-10" />
        </div>
    );
}
