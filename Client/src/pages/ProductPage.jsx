import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import { searchProducts, sortProducts } from "../utils/filterData";
import ProductList from "../components/ProductComponents/ProductList";
import ProductVarietyCart from "../components/ProductComponents/ProductVarietyCard";
import OfferingProductCard from "../components/HomeComponents/OfferingProductCard";
import { slugify } from "../utils/slugify";
import { unslugify } from "../utils/unslugify";

import { ProductContext } from "../context/ProductProvider";
import { PageContentContext } from "../context/PageContentProvider";
import { CartContext } from "../context/CartProvider";
import MadhuLoader from "../components/MadhuLoader";
import { getProductImage, getCardBackgroundImage } from "../utils/helper";
import { products as baseCategories } from "../data/products";
import BackButton from "../components/Common/BackButton";
import AnimatedHeading from "../components/Common/AnimatedHeading";

const getCategoryEmoji = (title = "") => {
    const t = (title || "").toLowerCase();
    if (t.includes("milk") && !t.includes("powder") && !t.includes("flavor")) return "🥛";
    if (t.includes("paneer")) return "🧀";
    if (t.includes("ghee")) return "🍯";
    if (t.includes("curd") || t.includes("dahi")) return "🥣";
    if (t.includes("butter")) return "🧈";
    if (t.includes("lassi")) return "🥤";
    if (t.includes("chaas") || t.includes("buttermilk")) return "🧊";
    if (t.includes("shrikhand")) return "🍨";
    if (t.includes("basundi")) return "🍮";
    if (t.includes("khoya") || t.includes("mawa")) return "🍪";
    if (t.includes("cheese")) return "🧀";
    if (t.includes("flavor")) return "🧃";
    if (t.includes("sweet") || t.includes("jamun") || t.includes("peda")) return "🍬";
    if (t.includes("powder")) return "📦";
    if (t.includes("cream")) return "🥛";
    if (t.includes("badham") || t.includes("badam")) return "🥜";
    return "🌿";
};

export default function ProductPage() {

    const navigate = useNavigate();
    const { productId } = useParams();
    const { filter, setFilter, products, productLoading } = useContext(ProductContext);
    const { pageContent } = useContext(PageContentContext);
    const { cartItems } = useContext(CartContext);

    const [query, setQuery] = useState(productId || "");
    const [debouncedQuery] = useDebounce(query, 300);

    // Mobile filter & search state (for !productId all-categories catalog)
    const [mobileSearchQuery, setMobileSearchQuery] = useState("");
    const [mobileSortOrder, setMobileSortOrder] = useState("default");
    const [showMobileFilterMenu, setShowMobileFilterMenu] = useState(false);

    // Web filter & search state (for !productId all-categories catalog)
    const [webSearchQuery, setWebSearchQuery] = useState("");
    const [webSortOrder, setWebSortOrder] = useState("default");
    const [showWebSortMenu, setShowWebSortMenu] = useState(false);

    useEffect(() => {
        setQuery(productId);
    }, [productId]);

    // Scroll to top immediately when category changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [productId]);

    const allCategoryCards = useMemo(() => {
        const cardMap = new Map();

        baseCategories.forEach((p) => {
            const title = p.title || p.name;
            if (title) {
                const key = title.toLowerCase().trim();
                cardMap.set(key, {
                    title,
                    image: getCardBackgroundImage(p, title),
                    description: p.description,
                });
            }
        });

        if (Array.isArray(pageContent?.homeCategoryCards)) {
            pageContent.homeCategoryCards.forEach((c) => {
                const title = c?.title || c?.name;
                if (title) {
                    const key = title.toLowerCase().trim();
                    const existing = cardMap.get(key) || {};
                    cardMap.set(key, {
                        ...existing,
                        title,
                        image: getCardBackgroundImage(c, title),
                        description: c.description || existing.description,
                    });
                }
            });
        }

        (products ?? []).forEach((p) => {
            if (p?.category) {
                const title = String(p.category).trim();
                const key = title.toLowerCase().trim();
                if (!cardMap.has(key)) {
                    cardMap.set(key, {
                        title,
                        image: getCardBackgroundImage(p, title),
                        description: p.description || `Pure and fresh A2 ${title} products delivered daily.`,
                    });
                }
            }
        });

        return Array.from(cardMap.values());
    }, [pageContent, products]);

    const filteredMobileCategoryCards = useMemo(() => {
        let result = [...allCategoryCards];

        if (mobileSearchQuery.trim()) {
            const q = mobileSearchQuery.toLowerCase().trim();
            result = result.filter(c => {
                const title = (c.title || "").toLowerCase();
                const desc = (c.description || "").toLowerCase();
                return title.includes(q) || desc.includes(q);
            });
        }

        if (mobileSortOrder === "name-asc") {
            result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (mobileSortOrder === "name-desc") {
            result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        }

        return result;
    }, [allCategoryCards, mobileSearchQuery, mobileSortOrder]);

    const filteredWebCategoryCards = useMemo(() => {
        let result = [...allCategoryCards];

        if (webSearchQuery.trim()) {
            const q = webSearchQuery.toLowerCase().trim();
            result = result.filter(c => {
                const title = (c.title || "").toLowerCase();
                const desc = (c.description || "").toLowerCase();
                return title.includes(q) || desc.includes(q);
            });
        }

        if (webSortOrder === "name-asc") {
            result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (webSortOrder === "name-desc") {
            result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        }

        return result;
    }, [allCategoryCards, webSearchQuery, webSortOrder]);

    const categoryInfo = useMemo(() => {
        if (!productId) return null;
        const searchSlug = slugify(productId);
        const cleanId = productId.toLowerCase().trim();

        const baseCat = baseCategories.find((c) => {
            const title = c.title || c.name || "";
            return slugify(title) === searchSlug || title.toLowerCase() === cleanId;
        });
        if (baseCat) {
            return {
                title: baseCat.title || baseCat.name,
                image: getCardBackgroundImage(baseCat, baseCat.title || baseCat.name),
                description: baseCat.description || `Pure, unadulterated farm-fresh ${baseCat.title} products delivered daily to your doorstep.`,
                features: baseCat.features || []
            };
        }

        const adminCards = [
            ...(pageContent?.homeCategoryCards || []),
            ...(pageContent?.landingShowcaseCards || [])
        ];
        const adminCat = adminCards.find((c) => {
            const title = c?.title || c?.name || "";
            return slugify(title) === searchSlug || title.toLowerCase() === cleanId;
        });
        if (adminCat) {
            return {
                title: adminCat.title || adminCat.name,
                image: getCardBackgroundImage(adminCat, adminCat.title || adminCat.name),
                description: adminCat.description || `Pure, unadulterated farm-fresh ${adminCat.title} products delivered daily to your doorstep.`,
                features: adminCat.features || []
            };
        }

        const matchedProduct = (products ?? []).find((p) => {
            if (!p?.category) return false;
            const cat = String(p.category).trim();
            return slugify(cat) === searchSlug || cat.toLowerCase() === cleanId;
        });
        if (matchedProduct) {
            return {
                title: matchedProduct.category,
                image: getCardBackgroundImage(matchedProduct, matchedProduct.category),
                description: `Fresh, nutritious and 100% pure A2 ${matchedProduct.category} products delivered daily.`,
                features: matchedProduct.features || []
            };
        }

        return {
            title: unslugify(productId),
            image: getCardBackgroundImage(unslugify(productId), unslugify(productId)),
            description: `Pure, unadulterated farm-fresh ${unslugify(productId)} products delivered daily to your doorstep.`,
            features: []
        };
    }, [productId, pageContent, products]);

    // Base products belonging to this category (when productId is present)
    const categoryBaseProducts = useMemo(() => {
        if (!productId) return [];
        return searchProducts(products ?? [], productId);
    }, [products, productId]);

    const finalCategoryProducts = categoryBaseProducts;

    // SPECIFIC CATEGORY PAGE VIEW (when productId is present): Redesigned World-Class Experience
    if (productId) {
        const emoji = getCategoryEmoji(categoryInfo?.title);

        return (
            <div className="w-full min-h-screen max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-5 flex flex-col space-y-4 sm:space-y-6">

                {/* 1. TOP BREADCRUMBS & ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <button
                            onClick={() => navigate("/products")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all font-bold text-xs cursor-pointer"
                            title="Back to All Categories"
                        >
                            <ArrowBackIcon sx={{ fontSize: "1rem" }} />
                            <span>All Categories</span>
                        </button>
                        <span className="text-slate-300 dark:text-slate-600 font-bold">/</span>
                        <span className="font-black text-[#0756B5] dark:text-emerald-400 capitalize">
                            {categoryInfo?.title || unslugify(productId)}
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            100% Farm-Fresh A2 Dairy
                        </span>
                    </div>
                </div>

                {/* 2. COMPACT CATEGORY HERO HEADER CARD */}
                {categoryInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="relative w-full bg-gradient-to-br from-white via-emerald-50/25 to-blue-50/30 dark:from-slate-850 dark:via-slate-850 dark:to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 border border-slate-200/90 dark:border-slate-700/80 shadow-xs overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                    >
                        {/* Ambient Glows */}
                        <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-400/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                        {/* Left Info Column */}
                        <div className="flex-1 space-y-3 z-10">

                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-sm sm:text-base font-black tracking-tight text-[#075C2A] dark:text-emerald-400 uppercase leading-none">
                                        NATURAL
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#0756B5] dark:text-blue-400 tracking-wider uppercase leading-none bg-[#0756B5]/10 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-[#0756B5]/20">
                                        Milk Dairy
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {categoryInfo.title}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed mt-1.5">
                                    {categoryInfo.description}
                                </p>
                            </div>

                            {/* Trust highlights */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-750">
                                    🌿 No Preservatives
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-750">
                                    ❄️ Chilled at 4°C
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-750">
                                    ⚡ Same-Day Delivery
                                </span>
                            </div>
                        </div>

                        {/* Right Preview Image Frame */}
                        <div className="relative shrink-0 z-10 self-center md:self-auto">
                            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-36 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-slate-700 ring-1 ring-slate-200/80 dark:ring-slate-700 group bg-white dark:bg-slate-800">
                                <img
                                    src={categoryInfo.image}
                                    alt={categoryInfo.title}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = getCardBackgroundImage(categoryInfo?.title);
                                    }}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-[10px] font-black shadow-xs">
                                        {categoryBaseProducts.length} {categoryBaseProducts.length === 1 ? "Item" : "Items"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 3. PRODUCTS GRID */}
                <div className="w-full">
                    {/* Available Varieties Section Heading */}
                    <div className="flex items-center justify-between pb-3 px-0.5">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                Available Varieties
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#075C2A]/10 text-[#075C2A] dark:text-emerald-400 border border-[#075C2A]/20">
                                {finalCategoryProducts.length} {finalCategoryProducts.length === 1 ? "Product" : "Products"}
                            </span>
                        </div>
                    </div>

                    {productLoading ? (
                        <MadhuLoader />
                    ) : finalCategoryProducts.length === 0 ? (
                        <div className="py-14 px-6 text-center bg-white dark:bg-slate-850 rounded-3xl border border-dashed border-slate-200 dark:border-slate-750 shadow-2xs flex flex-col items-center justify-center space-y-3">
                            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <ShoppingCartIcon sx={{ fontSize: "1.75rem" }} className="text-emerald-600 dark:text-emerald-400 opacity-60" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                {`No products currently available in ${categoryInfo?.title || 'this category'}`}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                We are currently restocking fresh morning batches from the farm! Please browse our other farm-fresh dairy categories.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                                <button
                                    onClick={() => navigate("/products")}
                                    className="px-4 py-2 rounded-xl bg-[#075C2A] hover:bg-[#054593] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                    Browse All Categories
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 w-full items-stretch">
                            {finalCategoryProducts.map((product, index) => (
                                <ProductVarietyCart
                                    key={product?._id ? String(product._id) : `prod-${index}`}
                                    id={product?._id}
                                    product={product}
                                    image={getProductImage(product)}
                                    name={product?.name || "Unnamed Product"}
                                    discount={product?.discount || 0}
                                    likes={Array.isArray(product?.likes) ? product.likes : []}
                                    type={product?.type || "Unknown"}
                                    price={product?.price || 0}
                                    minQuantity={product?.minQuantity || 1}
                                    stock={product?.stock || 0}
                                    quantityUnit={product?.quantityUnit || "unit"}
                                    rating={product?.rating || 4.9}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // MAIN ALL CATEGORIES CATALOG VIEW (when !productId):
    return (
        <>
            <div className="w-full px-3 sm:px-6 lg:px-8 pt-1.5 md:pt-2 pb-3.5 max-w-7xl mx-auto flex flex-col">
                <div className="flex-1 w-full">
                    <div className="w-full">
                        <div>

                                {/* WEB DISPLAY: Light Heading Card, Desktop Search Bar & Filter Options, Category Cards Grid */}
                                <div className="hidden md:flex flex-col space-y-2.5">
                                    {/* Web Heading (Clean direct title without pill badge card) */}
                                    <div className="w-full flex flex-col justify-center items-start text-left px-0.5 space-y-0.5 flex-shrink-0">
                                        <AnimatedHeading
                                            blackText="All Farm-Fresh"
                                            violetText="Products"
                                            as="h1"
                                            align="left"
                                            className="text-xl sm:text-2xl lg:text-[28px] font-black leading-tight text-[#063B22] dark:text-white justify-start text-left tracking-tight"
                                            violetClassName="text-[#0756B5] dark:text-emerald-400"
                                        />
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-2xl line-clamp-1 text-left">
                                            Explore our complete range of 100% pure A2 milk, ghee, paneer, curd, and daily sweets.
                                        </p>
                                    </div>

                                    {/* Web Search Bar & Sort Filter Options (WITHOUT OUTER CARD CONTAINER) */}
                                    <div className="relative z-40 flex items-center justify-between gap-2.5 w-full my-1.5">
                                        {/* Search Input Bar */}
                                        <div className="relative flex-1 flex items-center bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-gray-200/90 dark:border-slate-700/80 px-4 py-2.5 shadow-2xs hover:shadow-xs focus-within:border-[#0756B5] dark:focus-within:border-[#38BDF8] focus-within:ring-2 focus-within:ring-[#0756B5]/20 transition-all">
                                            <SearchIcon sx={{ fontSize: "1.3rem" }} className="text-gray-400 dark:text-gray-400 mr-2.5 shrink-0" />
                                            <input
                                                type="text"
                                                value={webSearchQuery}
                                                onChange={(e) => setWebSearchQuery(e.target.value)}
                                                placeholder="Search categories (e.g. Milk, Ghee, Paneer)..."
                                                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 border-none outline-none focus:outline-none focus:ring-0 p-0 m-0"
                                            />
                                            {webSearchQuery && (
                                                <button
                                                    onClick={() => setWebSearchQuery("")}
                                                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-1 shrink-0 cursor-pointer"
                                                >
                                                    <ClearIcon sx={{ fontSize: "1.1rem" }} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Interactive Sort & Filter Option Dropdown */}
                                        <div className="relative shrink-0 flex justify-end">
                                            <button
                                                onClick={() => setShowWebSortMenu(!showWebSortMenu)}
                                                className={`px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
                                                    webSortOrder !== "default"
                                                        ? "bg-[#0756B5] text-white border-[#0756B5] shadow-md"
                                                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200/90 dark:border-slate-700/80 hover:bg-gray-50 dark:hover:bg-slate-700"
                                                }`}
                                                title="Filter & Sort Options"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <TuneIcon sx={{ fontSize: "1.15rem" }} />
                                                    <span>
                                                        {webSortOrder === "name-asc"
                                                            ? "Name A → Z"
                                                            : webSortOrder === "name-desc"
                                                            ? "Name Z → A"
                                                            : "Sort By"}
                                                    </span>
                                                </div>
                                                <KeyboardArrowDownIcon sx={{ fontSize: "1rem" }} className={`transition-transform duration-200 ${showWebSortMenu ? "rotate-180" : ""}`} />
                                            </button>

                                            {/* Dropdown Menu Popover */}
                                            <AnimatePresence>
                                                {showWebSortMenu && (
                                                    <>
                                                        {/* Backdrop */}
                                                        <div
                                                            onClick={() => setShowWebSortMenu(false)}
                                                            className="fixed inset-0 z-40 bg-transparent cursor-pointer"
                                                        />

                                                        <motion.div
                                                            initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xl p-2 space-y-1"
                                                        >
                                                            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                                                <span>Sort Options</span>
                                                                <FilterListIcon sx={{ fontSize: "0.95rem" }} />
                                                            </div>

                                                            <button
                                                                onClick={() => {
                                                                    setWebSortOrder("default");
                                                                    setShowWebSortMenu(false);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                                    webSortOrder === "default"
                                                                        ? "bg-[#0756B5]/10 dark:bg-slate-800 text-[#0756B5] dark:text-blue-400 font-bold"
                                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/80"
                                                                }`}
                                                            >
                                                                <span>Default Order</span>
                                                                {webSortOrder === "default" && <span className="w-2 h-2 rounded-full bg-[#0756B5]" />}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setWebSortOrder("name-asc");
                                                                    setShowWebSortMenu(false);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                                    webSortOrder === "name-asc"
                                                                        ? "bg-[#0756B5]/10 dark:bg-slate-800 text-[#0756B5] dark:text-blue-400 font-bold"
                                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/80"
                                                                }`}
                                                            >
                                                                <span>Name Ascending (A &rarr; Z)</span>
                                                                {webSortOrder === "name-asc" && <span className="w-2 h-2 rounded-full bg-[#0756B5]" />}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setWebSortOrder("name-desc");
                                                                    setShowWebSortMenu(false);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                                    webSortOrder === "name-desc"
                                                                        ? "bg-[#0756B5]/10 dark:bg-slate-800 text-[#0756B5] dark:text-blue-400 font-bold"
                                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/80"
                                                                }`}
                                                            >
                                                                <span>Name Descending (Z &rarr; A)</span>
                                                                {webSortOrder === "name-desc" && <span className="w-2 h-2 rounded-full bg-[#0756B5]" />}
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Web Category Cards Grid - 4 Columns fitting 100% viewport */}
                                    {productLoading ? (
                                        <MadhuLoader />
                                    ) : filteredWebCategoryCards.length === 0 ? (
                                        <div className="py-12 text-center text-gray-500 dark:text-gray-300 font-semibold text-sm bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                            No categories found matching "{webSearchQuery}".
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3.5 sm:gap-x-4 lg:gap-x-5 gap-y-6 sm:gap-y-7 lg:gap-y-8 pt-1.5 pb-8 sm:pb-12">
                                            {filteredWebCategoryCards.map((cat, index) => (
                                                <OfferingProductCard
                                                    key={`web-cat-${index}-${cat.title}`}
                                                    title={cat.title}
                                                    image={cat.image}
                                                    className="h-44 sm:h-56 md:h-[calc(100vh-216px)] md:min-h-[340px] md:max-h-[550px]"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* MOBILE DISPLAY: Header, Search Bar, Filter Sheet Modal & Category Grid */}
                                <div className="md:hidden space-y-3">
                                    {/* Mobile Header, Search Bar & Filter Options Bar (Full Width Edge-to-Edge) */}
                                    <div className="sticky top-0 z-30 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mx-3 sm:-mx-6 px-3.5 sm:px-6 py-2.5 space-y-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 shadow-xs transition-colors">
                                        {/* Top Navigation Row */}
                                        <div className="flex items-center justify-between px-0.5">
                                            <div className="flex flex-col items-start justify-center">
                                                <AnimatedHeading blackText="Products" violetText="Collection" as="h1" className="text-base font-black tracking-tight text-gray-900 dark:text-white" violetClassName="text-[#0756B5] dark:text-emerald-400" />
                                                <span className="text-[11px] font-bold text-[#0756B5] dark:text-emerald-400">
                                                    {filteredMobileCategoryCards.length} Categories Available
                                                </span>
                                            </div>

                                            <Link
                                                to="/cart"
                                                title="View Cart"
                                                className="relative p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-[#075C2A] dark:hover:text-blue-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 active:scale-95 transition-all flex items-center justify-center"
                                            >
                                                <ShoppingCartIcon sx={{ fontSize: "1.35rem" }} />
                                                {cartItems?.length > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 bg-[#075C2A] text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                                                        {cartItems.length}
                                                    </span>
                                                )}
                                            </Link>
                                        </div>

                                        {/* Mobile Search Bar Row (Google Style Pill Search Bar) */}
                                        <div className="relative w-full flex items-center gap-2 my-1">
                                            <div className="relative flex-1 flex items-center bg-white dark:bg-slate-800 rounded-full border border-gray-200/90 dark:border-slate-700/80 px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md focus-within:shadow-md focus-within:border-[#075C2A] dark:focus-within:border-blue-400 transition-all duration-200">
                                                <SearchIcon sx={{ fontSize: "1.25rem" }} className="text-gray-400 dark:text-gray-400 mr-2 shrink-0" />
                                                <input
                                                    type="text"
                                                    value={mobileSearchQuery}
                                                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                                                    placeholder="Search categories (e.g. Milk, Ghee, Paneer)..."
                                                    className="w-full bg-transparent text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 appearance-none shadow-none p-0 m-0 no-border-input"
                                                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                                                />
                                                {mobileSearchQuery && (
                                                    <button
                                                        onClick={() => setMobileSearchQuery("")}
                                                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-1 shrink-0"
                                                    >
                                                        <ClearIcon sx={{ fontSize: "1.05rem" }} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Filter Toggle Button (Google Pill Companion Button) */}
                                            <button
                                                onClick={() => setShowMobileFilterMenu(true)}
                                                className={`p-2.5 rounded-full border transition-all flex items-center justify-center shrink-0 shadow-sm ${
                                                    showMobileFilterMenu || mobileSortOrder !== "default"
                                                        ? "bg-[#075C2A] text-white border-[#075C2A] shadow-md scale-105"
                                                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200/90 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                                                }`}
                                                title="Filter and Sort"
                                            >
                                                <TuneIcon sx={{ fontSize: "1.15rem" }} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* MOBILE BOTTOM SHEET FILTER POPUP MODAL */}
                                    <AnimatePresence>
                                        {showMobileFilterMenu && (
                                            <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
                                                {/* Translucent Dark Backdrop Overlay */}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => setShowMobileFilterMenu(false)}
                                                    className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                                                />

                                                {/* Bottom Sheet Drawer Panel */}
                                                <motion.div
                                                    initial={{ y: "100%" }}
                                                    animate={{ y: 0 }}
                                                    exit={{ y: "100%" }}
                                                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                                                    className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-gray-200/80 dark:border-slate-800 shadow-2xl z-10 max-h-[82vh] flex flex-col overflow-hidden"
                                                >
                                                    {/* Header Handle Bar */}
                                                    <div className="pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing">
                                                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mb-2" />
                                                        <div className="w-full px-5 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <FilterListIcon className="text-[#0756B5] dark:text-emerald-400" sx={{ fontSize: "1.2rem" }} />
                                                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                                                    Filter & Sort Products
                                                                </h3>
                                                            </div>
                                                            <button
                                                                onClick={() => setShowMobileFilterMenu(false)}
                                                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                            >
                                                                <ClearIcon sx={{ fontSize: "1.1rem" }} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Scrollable Modal Content */}
                                                    <div className="p-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                                                        {/* Sort Order Options */}
                                                        <div className="space-y-2.5">
                                                            <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                                                                Sort Order
                                                            </label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <button
                                                                    onClick={() => setMobileSortOrder("default")}
                                                                    className={`px-3 py-2.5 rounded-xl text-xs font-black border text-center transition-all cursor-pointer ${
                                                                        mobileSortOrder === "default"
                                                                            ? "bg-[#075C2A]/15 text-[#075C2A] dark:text-blue-400 border-[#075C2A]"
                                                                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700"
                                                                    }`}
                                                                >
                                                                    Default
                                                                </button>
                                                                <button
                                                                    onClick={() => setMobileSortOrder("name-asc")}
                                                                    className={`px-3 py-2.5 rounded-xl text-xs font-black border text-center transition-all cursor-pointer ${
                                                                        mobileSortOrder === "name-asc"
                                                                            ? "bg-[#075C2A]/15 text-[#075C2A] dark:text-blue-400 border-[#075C2A]"
                                                                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700"
                                                                    }`}
                                                                >
                                                                    Name A &rarr; Z
                                                                </button>
                                                                <button
                                                                    onClick={() => setMobileSortOrder("name-desc")}
                                                                    className={`px-3 py-2.5 rounded-xl text-xs font-black border text-center transition-all cursor-pointer ${
                                                                        mobileSortOrder === "name-desc"
                                                                            ? "bg-[#075C2A]/15 text-[#075C2A] dark:text-blue-400 border-[#075C2A]"
                                                                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700"
                                                                    }`}
                                                                >
                                                                    Name Z &rarr; A
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Sheet Action Footer */}
                                                    <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80 flex items-center gap-3 shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                setMobileSortOrder("default");
                                                                setMobileSearchQuery("");
                                                            }}
                                                            className="px-4 py-3 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                                        >
                                                            Reset All
                                                        </button>
                                                        <button
                                                            onClick={() => setShowMobileFilterMenu(false)}
                                                            className="flex-1 bg-[#075C2A] hover:bg-[#054593] text-white text-xs font-black py-3 rounded-2xl shadow-lg transition-all text-center cursor-pointer"
                                                        >
                                                            Apply Filters ({filteredMobileCategoryCards.length})
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>

                                    {productLoading ? (
                                        <MadhuLoader />
                                    ) : filteredMobileCategoryCards.length === 0 ? (
                                        <div className="py-12 text-center text-gray-500 dark:text-gray-300 font-semibold text-sm bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                            No category cards found matching your search.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6 pb-8 pt-2">
                                            {filteredMobileCategoryCards.map((cat, index) => (
                                                <OfferingProductCard
                                                    key={`all-cat-${index}-${cat.title}`}
                                                    title={cat.title}
                                                    image={cat.image}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
}
