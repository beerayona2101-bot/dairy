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
import FloatingCart from "../components/Common/FloatingCart";

export default function ProductPage() {

    const navigate = useNavigate();
    const { productId } = useParams();
    const { filter, setFilter, products, productLoading } = useContext(ProductContext);
    const { pageContent } = useContext(PageContentContext);
    const { cartItems } = useContext(CartContext);

    const productsSectionRef = useRef(null);

    const [query, setQuery] = useState(productId || "");
    const [debouncedQuery] = useDebounce(query, 300);

    // Mobile filter & search state
    const [mobileSearchQuery, setMobileSearchQuery] = useState("");
    const [mobileCategoryTag, setMobileCategoryTag] = useState("All");
    const [mobileSortOrder, setMobileSortOrder] = useState("default");
    const [showMobileFilterMenu, setShowMobileFilterMenu] = useState(false);

    // Web filter & search state
    const [webSearchQuery, setWebSearchQuery] = useState("");
    const [webCategoryTag, setWebCategoryTag] = useState("All");
    const [webSortOrder, setWebSortOrder] = useState("default");
    const [showWebSortMenu, setShowWebSortMenu] = useState(false);

    const categoryTags = ["All", "Milk", "Paneer", "Ghee", "Curd", "Butter", "Cheese", "Lassi", "Chaas", "Sweets", "Khoya"];

    useEffect(() => {
        setQuery(productId);
    }, [productId]);

    // Auto-scroll down to products section after 2 seconds of entering category page
    useEffect(() => {
        if (!productId) return;

        // Ensure page starts at top upon navigating into category view
        window.scrollTo({ top: 0, behavior: "instant" });

        const timer = setTimeout(() => {
            // Only auto-scroll if user hasn't already manually scrolled deep into the page
            if (window.scrollY < window.innerHeight * 0.4) {
                if (productsSectionRef.current) {
                    productsSectionRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                } else {
                    window.scrollTo({
                        top: window.innerHeight,
                        behavior: "smooth",
                    });
                }
            }
        }, 2000);

        return () => clearTimeout(timer);
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

        if (mobileCategoryTag !== "All") {
            const tagClean = mobileCategoryTag.toLowerCase().trim();
            result = result.filter(c => {
                const title = (c.title || "").toLowerCase();
                return title.includes(tagClean);
            });
        }

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
    }, [allCategoryCards, mobileCategoryTag, mobileSearchQuery, mobileSortOrder]);

    const filteredWebCategoryCards = useMemo(() => {
        let result = [...allCategoryCards];

        if (webCategoryTag !== "All") {
            const tagClean = webCategoryTag.toLowerCase().trim();
            result = result.filter(c => {
                const title = (c.title || "").toLowerCase();
                return title.includes(tagClean);
            });
        }

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
    }, [allCategoryCards, webCategoryTag, webSearchQuery, webSortOrder]);

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

    const activeCategoryTitle = useMemo(() => {
        if (!productId) return "All Products";
        return categoryInfo?.title || unslugify(productId);
    }, [productId, categoryInfo]);

    const filteredProducts = useMemo(() => {
        return searchProducts(products ?? [], debouncedQuery);
    }, [products, debouncedQuery]);

    const sortedFilteredProducts = useMemo(() => {
        const sorted = sortProducts(filteredProducts ?? [], filter);
        if (!debouncedQuery) return sorted;
        
        const cleanQ = debouncedQuery.replace(/-/g, " ").toLowerCase().trim();
        return [...sorted].sort((a, b) => {
            const aName = (a?.name || "").toLowerCase();
            const bName = (b?.name || "").toLowerCase();
            const aSlug = slugify(a?.name || "");
            const bSlug = slugify(b?.name || "");
            const aCategory = (a?.category || "").toLowerCase();
            const bCategory = (b?.category || "").toLowerCase();

            const aExact = aSlug === debouncedQuery || aName === cleanQ;
            const bExact = bSlug === debouncedQuery || bName === cleanQ;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            const aPartial = aName.includes(cleanQ) || aCategory.includes(cleanQ);
            const bPartial = bName.includes(cleanQ) || bCategory.includes(cleanQ);
            if (aPartial && !bPartial) return -1;
            if (!aPartial && bPartial) return 1;

            return 0;
        });
    }, [filteredProducts, filter, debouncedQuery]);


    return (
        <>
            <div className={`w-full ${productId ? 'min-h-screen px-0 pb-12' : 'px-0 md:px-6 lg:px-8 pt-1.5 md:pt-5 pb-8 max-w-7xl mx-auto'} flex flex-col`}>

                {/* Main Content Area */}
                <div className={`flex-1 ${productId ? 'flex flex-col space-y-0' : 'space-y-4'} w-full`}>

                    {/* CATEGORY HERO BANNER CARD - RESPONSIVE BANNER HEIGHT WITH FLOATING GLASS CONTROLS */}
                    {categoryInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full h-[100vh] min-h-screen overflow-hidden group bg-gray-900 m-0 p-0 border-0 shadow-none rounded-none flex-shrink-0"
                        >
                            {/* Floating Controls Overlay (Back button on top left ON THE IMAGE) */}
                            <div className="absolute top-4 sm:top-6 left-0 right-0 z-20 px-4 sm:px-8 lg:px-12 w-full flex justify-start items-center">
                                {/* Top Left: Glass Back Button (visible on both mobile and web) */}
                                <BackButton fallbackPath="/products" hideOnWeb={false} variant="glass" label="Back to Categories" title="Back to All Categories" />
                            </div>

                            {/* Main Full-Bleed Category Banner Image with Continuous Zoom In & Out Animation */}
                            <img
                                src={categoryInfo.image}
                                alt={categoryInfo.title}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getCardBackgroundImage(categoryInfo?.title);
                                }}
                                className="w-full h-full object-cover animate-banner-zoom pointer-events-none"
                            />

                            {/* Banner Bottom Text Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-16 text-white space-y-2 pointer-events-none">
                                <div className="w-full px-2 sm:px-4 lg:px-6 space-y-2 pointer-events-auto pb-6 sm:pb-10">
                                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-lg text-white">
                                        {categoryInfo.title}
                                    </h1>
                                    <p className="text-xs sm:text-base md:text-lg text-gray-200 font-semibold max-w-2xl drop-shadow-md">
                                        {categoryInfo.description}
                                    </p>
                                </div>
                            </div>

                            {/* Bouncing Scroll Down Indicator */}
                            <button
                                onClick={() => {
                                    if (productsSectionRef.current) {
                                        productsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                                    } else {
                                        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
                                    }
                                }}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 text-white/80 hover:text-white text-[11px] sm:text-xs font-bold animate-bounce pointer-events-auto cursor-pointer bg-transparent border-0 outline-none"
                                title="Scroll for Products"
                            >
                                <span>Scroll for Products</span>
                                <KeyboardArrowDownIcon sx={{ fontSize: "1.2rem" }} />
                            </button>
                        </motion.div>
                    )}

                    {/* MAIN PRODUCTS CONTENT SECTION */}
                    <div className={`w-full ${productId ? 'px-3 sm:px-6 lg:px-10 py-2 sm:py-3' : 'space-y-4 pt-1 md:pt-2 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'}`}>
                        {!productId ? (
                            /* MAIN PRODUCTS PAGE VIEW (!productId): Show ALL Category Images Grid */
                            <div className="space-y-4">

                                {/* WEB DISPLAY: Light Heading Card, Desktop Search Bar & Filter Options, Category Cards Grid */}
                                <div className="hidden md:flex flex-col space-y-4">
                                    {/* Web Light Heading Banner Card */}
                                    <div className="relative w-full overflow-hidden bg-gradient-to-r from-purple-50 via-indigo-50/80 to-blue-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 px-6 sm:px-8 py-5 flex items-center justify-between gap-4 text-slate-900 dark:text-white m-0 border border-purple-100/90 dark:border-slate-700/80 rounded-2xl shadow-xs flex-shrink-0">
                                        <div className="w-full flex flex-col justify-center items-start text-left space-y-1.5 overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 dark:text-purple-300 bg-purple-100/90 dark:bg-purple-900/40 px-3 py-1 rounded-full border border-purple-200/80 dark:border-purple-800/60 shadow-2xs">
                                                    🥛 Madhu Dairy Collection
                                                </span>
                                            </div>
                                            <AnimatedHeading
                                                blackText="All Farm-Fresh"
                                                violetText="Products"
                                                as="h1"
                                                align="left"
                                                className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-slate-900 dark:text-white justify-start text-left tracking-tight"
                                                violetClassName="text-purple-600 dark:text-purple-400"
                                            />
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-2xl line-clamp-1 text-left">
                                                Explore our complete range of 100% pure A2 milk, ghee, paneer, curd, and daily sweets.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Web Search Bar, Category Filter Pills & Sort Options */}
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/90 dark:border-slate-700/80 shadow-xs">
                                        {/* Search Input Bar */}
                                        <div className="relative flex-1 w-full flex items-center bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-3.5 py-2.5 transition-all focus-within:border-purple-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-purple-500/20">
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

                                        {/* Category Filter Pills */}
                                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 custom-scrollbar shrink-0">
                                            {categoryTags.map((tag) => (
                                                <button
                                                    key={`web-tag-${tag}`}
                                                    onClick={() => setWebCategoryTag(tag)}
                                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                                                        webCategoryTag === tag
                                                            ? "bg-purple-600 text-white border-purple-600 shadow-xs scale-105"
                                                            : "bg-gray-100/90 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700 hover:text-purple-600"
                                                    }`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Interactive Sort & Filter Option Dropdown */}
                                        <div className="relative shrink-0 w-full md:w-auto flex justify-end">
                                            <button
                                                onClick={() => setShowWebSortMenu(!showWebSortMenu)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs w-full md:w-auto ${
                                                    webSortOrder !== "default"
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-md"
                                                        : "bg-gray-100/90 dark:bg-slate-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-800"
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
                                                            className="fixed inset-0 z-30 bg-transparent cursor-pointer"
                                                        />

                                                        <motion.div
                                                            initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute right-0 top-full mt-2 z-40 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-xl p-2 space-y-1"
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
                                                                        ? "bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-bold"
                                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/80"
                                                                }`}
                                                            >
                                                                <span>Default Order</span>
                                                                {webSortOrder === "default" && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setWebSortOrder("name-asc");
                                                                    setShowWebSortMenu(false);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                                    webSortOrder === "name-asc"
                                                                        ? "bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-bold"
                                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/80"
                                                                }`}
                                                            >
                                                                <span>Name Ascending (A &rarr; Z)</span>
                                                                {webSortOrder === "name-asc" && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setWebSortOrder("name-desc");
                                                                    setShowWebSortMenu(false);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                                    webSortOrder === "name-desc"
                                                                        ? "bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-bold"
                                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/80"
                                                                }`}
                                                            >
                                                                <span>Name Descending (Z &rarr; A)</span>
                                                                {webSortOrder === "name-desc" && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Web Category Cards Grid */}
                                    {productLoading ? (
                                        <MadhuLoader />
                                    ) : filteredWebCategoryCards.length === 0 ? (
                                        <div className="py-12 text-center text-gray-500 dark:text-gray-300 font-semibold text-sm bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                            No categories found matching "{webSearchQuery || webCategoryTag}".
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 pt-1">
                                            {filteredWebCategoryCards.map((cat, index) => (
                                                <OfferingProductCard
                                                    key={`web-cat-${index}-${cat.title}`}
                                                    title={cat.title}
                                                    image={cat.image}
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
                                                <AnimatedHeading blackText="Products" violetText="Collection" as="h1" className="text-base font-black tracking-tight text-gray-900 dark:text-white" />
                                                <span className="text-[11px] font-bold text-[#6C5CE7] dark:text-purple-400">
                                                    {filteredMobileCategoryCards.length} Categories Available
                                                </span>
                                            </div>

                                            <Link
                                                to="/cart"
                                                title="View Cart"
                                                className="relative p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-[#6C5CE7] dark:hover:text-[#A78BFA] hover:bg-gray-100/80 dark:hover:bg-gray-800/80 active:scale-95 transition-all flex items-center justify-center"
                                            >
                                                <ShoppingCartIcon sx={{ fontSize: "1.35rem" }} />
                                                {cartItems?.length > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#6C5CE7] to-[#805AD5] text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                                                        {cartItems.length}
                                                    </span>
                                                )}
                                            </Link>
                                        </div>

                                        {/* Mobile Search Bar Row (Google Style Pill Search Bar) */}
                                        <div className="relative w-full flex items-center gap-2">
                                            <div className="relative flex-1 flex items-center bg-white dark:bg-slate-800 rounded-full border border-gray-200/90 dark:border-slate-700/80 px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md focus-within:shadow-md focus-within:border-[#6C5CE7] dark:focus-within:border-purple-400 transition-all duration-200">
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
                                                    showMobileFilterMenu || mobileSortOrder !== "default" || mobileCategoryTag !== "All"
                                                        ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-md scale-105"
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
                                                                <FilterListIcon className="text-[#6C5CE7] dark:text-purple-400" sx={{ fontSize: "1.2rem" }} />
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
                                                        {/* 1. Category Tag Selector */}
                                                        <div className="space-y-2.5">
                                                            <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                                                                Select Category
                                                            </label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {categoryTags.map((tag) => (
                                                                    <button
                                                                        key={tag}
                                                                        onClick={() => setMobileCategoryTag(tag)}
                                                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                                                            mobileCategoryTag === tag
                                                                                ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm scale-105"
                                                                                : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700"
                                                                        }`}
                                                                    >
                                                                        {tag}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* 2. Sort Order Options */}
                                                        <div className="space-y-2.5">
                                                            <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                                                                Sort Order
                                                            </label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <button
                                                                    onClick={() => setMobileSortOrder("default")}
                                                                    className={`px-3 py-2.5 rounded-xl text-xs font-black border text-center transition-all cursor-pointer ${
                                                                        mobileSortOrder === "default"
                                                                            ? "bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-purple-400 border-[#6C5CE7]"
                                                                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700"
                                                                    }`}
                                                                >
                                                                    Default
                                                                </button>
                                                                <button
                                                                    onClick={() => setMobileSortOrder("name-asc")}
                                                                    className={`px-3 py-2.5 rounded-xl text-xs font-black border text-center transition-all cursor-pointer ${
                                                                        mobileSortOrder === "name-asc"
                                                                            ? "bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-purple-400 border-[#6C5CE7]"
                                                                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700"
                                                                    }`}
                                                                >
                                                                    Name A &rarr; Z
                                                                </button>
                                                                <button
                                                                    onClick={() => setMobileSortOrder("name-desc")}
                                                                    className={`px-3 py-2.5 rounded-xl text-xs font-black border text-center transition-all cursor-pointer ${
                                                                        mobileSortOrder === "name-desc"
                                                                            ? "bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-purple-400 border-[#6C5CE7]"
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
                                                                setMobileCategoryTag("All");
                                                                setMobileSearchQuery("");
                                                            }}
                                                            className="px-4 py-3 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                                        >
                                                            Reset All
                                                        </button>
                                                        <button
                                                            onClick={() => setShowMobileFilterMenu(false)}
                                                            className="flex-1 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-xs font-black py-3 rounded-2xl shadow-lg transition-all text-center cursor-pointer"
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
                                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 pb-6 pt-2">
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
                        ) : (
                            /* SPECIFIC CATEGORY PAGE VIEW (productId): Scrolls naturally when many items are present */
                            <div ref={productsSectionRef} className="w-full flex flex-col scroll-mt-6">

                                {productLoading ? (
                                    <MadhuLoader />
                                ) : (
                                     <section className="w-full flex flex-col">
                                        {(sortedFilteredProducts?.length ?? 0) === 0 ? (
                                            <div className="py-12 text-center text-gray-500 dark:text-gray-300 font-medium text-base bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                No products found in this category.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 w-full items-stretch">
                                                {sortedFilteredProducts.map((product, index) => (
                                                    <ProductVarietyCart
                                                        key={product?._id ? String(product._id) : `prod-${index}`}
                                                        id={product?._id}
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
                                    </section>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Floating Cart Button (Right Side) */}
            <FloatingCart />
        </>
    );
}
