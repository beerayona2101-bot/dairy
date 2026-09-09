import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { searchProducts, sortProducts } from "../utils/filterData";
import ProductList from "../components/ProductComponents/ProductList";
import ProductVarietyCart from "../components/ProductComponents/ProductVarietyCard";
import OfferingProductCard from "../components/HomeComponents/OfferingProductCard";
import { slugify } from "../utils/slugify";
import { unslugify } from "../utils/unslugify";

import { ProductContext } from "../context/ProductProvider";
import { PageContentContext } from "../context/PageContentProvider";
import { CartContext } from "../context/CartProvider";
import MadhurLoader from "../components/MadhurLoader";
import { getProductImage } from "../utils/helper";
import { products as baseCategories } from "../data/products";

export default function ProductPage() {

    const navigate = useNavigate();
    const { productId } = useParams();
    const { filter, setFilter, products, productLoading } = useContext(ProductContext);
    const { pageContent } = useContext(PageContentContext);
    const { cartItems } = useContext(CartContext);

    const [query, setQuery] = useState(productId || "");
    const [debouncedQuery] = useDebounce(query, 300);

    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const handleWindowLoad = () => {
            setPageLoading(false);
        };

        if (document.readyState === "complete") {
            handleWindowLoad();
        } else {
            window.addEventListener("load", handleWindowLoad);
        }

        return () => {
            window.removeEventListener("load", handleWindowLoad);
        };
    }, []);

    useEffect(() => {
        setQuery(productId);
    }, [productId]);

    const allCategoryCards = useMemo(() => {
        const cardMap = new Map();

        baseCategories.forEach((p) => {
            const title = p.title || p.name;
            if (title) {
                const key = title.toLowerCase().trim();
                cardMap.set(key, {
                    title,
                    image: p.image || getProductImage(p),
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
                        image: c.image || existing.image || getProductImage(c),
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
                        image: getProductImage(p),
                        description: p.description || `Pure and fresh A2 ${title} products delivered daily.`,
                    });
                }
            }
        });

        return Array.from(cardMap.values());
    }, [pageContent, products]);

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
                image: baseCat.image,
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
                image: adminCat.image || getProductImage(adminCat),
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
                image: getProductImage(matchedProduct),
                description: `Fresh, nutritious and 100% pure A2 ${matchedProduct.category} products delivered daily.`,
                features: matchedProduct.features || []
            };
        }

        return {
            title: unslugify(productId),
            image: "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969530/madhur_dairy_products/ftq2d0zfpaw96wiu0cvv.jpg",
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

    if (pageLoading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black">
                <MadhurLoader />
            </div>
        );
    }

    return (
        <>
            <div className={`w-full ${productId ? 'min-h-screen px-0 pb-12' : 'px-0 md:px-6 lg:px-8 pt-1.5 md:pt-5 pb-8 max-w-7xl mx-auto'} flex flex-col md:flex-row md:gap-6`}>

                {/* Left Sidebar Category Filter - Hidden when viewing a specific category page */}
                {!productId && (
                    <div className="sticky top-[75px] z-20 hidden md:block w-64 p-4 h-[calc(100vh-85px)] bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/80 dark:border-gray-700/80 flex-shrink-0 transition-colors duration-300">
                        <ProductList />
                    </div>
                )}

                {/* Main Content Area */}
                <div className={`flex-1 ${productId ? 'flex flex-col space-y-3' : 'space-y-4'} w-full`}>

                    {/* CATEGORY HERO BANNER CARD - RESPONSIVE BANNER HEIGHT WITH FLOATING GLASS CONTROLS */}
                    {categoryInfo ? (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full h-[100vh] min-h-screen overflow-hidden group bg-gray-900 m-0 p-0 border-0 shadow-none rounded-none flex-shrink-0"
                        >
                            {/* Floating Controls Overlay (Back button on top left ON THE IMAGE) */}
                            <div className="absolute top-4 sm:top-6 left-0 right-0 z-20 px-4 sm:px-8 lg:px-12 w-full flex justify-start items-center">
                                {/* Top Left: Glass Back Button */}
                                <Link
                                    to="/products"
                                    title="Back to All Categories"
                                    className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-black/40 hover:bg-black/60 active:scale-95 border border-white/30 rounded-xl text-white backdrop-blur-md transition-all cursor-pointer shadow-md text-xs sm:text-sm font-extrabold"
                                >
                                    <ArrowBackIcon sx={{ fontSize: "1.1rem" }} />
                                    <span>Back to Categories</span>
                                </Link>
                            </div>

                            {/* Main Full-Bleed Category Banner Image */}
                            <img
                                src={categoryInfo.image}
                                alt={categoryInfo.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
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
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 text-white/80 text-[11px] sm:text-xs font-bold animate-bounce pointer-events-none">
                                <span>Scroll for Products</span>
                                <KeyboardArrowDownIcon sx={{ fontSize: "1.2rem" }} />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="hidden md:flex relative w-full overflow-hidden bg-gradient-to-r from-[#0F2742] via-[#1E88E5] to-[#1565C0] px-4 sm:px-10 py-3.5 items-center gap-3 sm:gap-4 text-white m-0 border-0 rounded-none sm:rounded-2xl flex-shrink-0">
                            <div className="w-full flex flex-col justify-center space-y-0.5 overflow-hidden px-1 sm:px-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">🥛 Madhur Dairy Collection</span>
                                </div>
                                <h1 className="text-base sm:text-xl font-black leading-tight truncate">All Farm-Fresh Products</h1>
                                <p className="text-[11px] sm:text-xs text-blue-100 max-w-xl font-medium line-clamp-1">
                                    Explore our complete range of 100% pure A2 milk, ghee, paneer, curd, and daily sweets.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* MAIN PRODUCTS CONTENT SECTION */}
                    <div className={`w-full ${productId ? 'px-3 sm:px-6 lg:px-10 py-2 sm:py-3' : 'space-y-4 pt-1 md:pt-2 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'}`}>
                        {!productId ? (
                            /* MAIN PRODUCTS PAGE VIEW (!productId): Show ALL Category Images Grid */
                            <div className="space-y-3">
                                {/* Mobile Top Header Navigation Bar */}
                                <div className="md:hidden sticky top-1 z-30 w-full py-1.5 px-1 flex items-center justify-between transition-all duration-200">
                                    {/* Left: Back Button (Goes directly to /home) */}
                                    <Link
                                        to="/home"
                                        title="Go to Home Page"
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 active:scale-95 rounded-xl text-purple-700 dark:text-purple-300 transition-all text-xs font-black cursor-pointer border border-purple-200/60 dark:border-purple-800/60 shadow-xs"
                                    >
                                        <ArrowBackIcon sx={{ fontSize: "1.15rem" }} className="text-[#6C5CE7] dark:text-[#A78BFA]" />
                                        <span>Back</span>
                                    </Link>

                                    {/* Center: Title */}
                                    <div className="flex flex-col items-center justify-center">
                                        <h1 className="text-sm font-black tracking-tight text-gray-900 dark:text-white">
                                            Products Collection
                                        </h1>
                                    </div>

                                    {/* Right: Cart Shortcut Only (Home icon removed) */}
                                    <div className="flex items-center">
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
                                </div>

                                {productLoading ? (
                                    <MadhurLoader />
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-6 pt-1 md:pt-0">
                                        {allCategoryCards.map((cat, index) => (
                                            <OfferingProductCard
                                                key={`all-cat-${index}-${cat.title}`}
                                                title={cat.title}
                                                image={cat.image}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* SPECIFIC CATEGORY PAGE VIEW (productId): Scrolls naturally when many items are present */
                            <div className="w-full flex flex-col">
                                {/* Mobile Top Header Navigation Bar for Category View */}
                                <div className="md:hidden sticky top-1 z-30 w-full mb-2 py-1.5 px-1 flex items-center justify-between transition-all duration-200">
                                    {/* Left: Back Button (Goes back to /products) */}
                                    <Link
                                        to="/products"
                                        title="Back to Categories"
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 active:scale-95 rounded-xl text-purple-700 dark:text-purple-300 transition-all text-xs font-black cursor-pointer border border-purple-200/60 dark:border-purple-800/60 shadow-xs"
                                    >
                                        <ArrowBackIcon sx={{ fontSize: "1.15rem" }} className="text-[#6C5CE7] dark:text-[#A78BFA]" />
                                        <span>Back</span>
                                    </Link>

                                    {/* Center: Title */}
                                    <div className="flex flex-col items-center justify-center">
                                        <h1 className="text-sm font-black tracking-tight text-gray-900 dark:text-white capitalize">
                                            {activeCategoryTitle}
                                        </h1>
                                    </div>

                                    {/* Right: Cart Shortcut */}
                                    <div className="flex items-center">
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
                                </div>

                                {productLoading ? (
                                    <MadhurLoader />
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
        </>
    );
}
