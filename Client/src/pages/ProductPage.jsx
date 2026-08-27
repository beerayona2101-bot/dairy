import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import { Menu, MenuItem } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { searchProducts, sortProducts } from "../utils/filterData";
import ProductList from "../components/ProductComponents/ProductList";
import ProductVarietyCart from "../components/ProductComponents/ProductVarietyCard";
import OfferingProductCard from "../components/HomeComponents/OfferingProductCard";
import { slugify } from "../utils/slugify";
import { unslugify } from "../utils/unslugify";

import { ProductContext } from "../context/ProductProvider";
import { PageContentContext } from "../context/PageContentProvider";
import MadhurLoader from "../components/MadhurLoader";
import { getProductImage } from "../utils/helper";
import { products as baseCategories } from "../data/products";

export default function ProductPage() {

    const { productId } = useParams();
    const { filter, setFilter, products, productLoading } = useContext(ProductContext);
    const { pageContent } = useContext(PageContentContext);

    const [query, setQuery] = useState(productId || "");
    const [debouncedQuery] = useDebounce(query, 300);
    const [anchorEl, setAnchorEl] = useState(null);

    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        // Wait until browser has fully loaded (including images, fonts, etc.)
        const handleWindowLoad = () => {
            setPageLoading(false);
        };

        // If already loaded (e.g., fast refresh), skip
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

        // 1. Check base categories in products data
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

        // 2. Check admin pageContent homeCategoryCards / landingShowcaseCards
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

        // 3. Check products from ProductContext
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
            <div className={`w-full pt-20 sm:pt-24 pb-8 px-3 lg:px-8 flex flex-col md:flex-row md:gap-6 ${productId ? 'max-w-7xl mx-auto' : ''}`}>

                {/* Left Sidebar Category Filter - Hidden when viewing a specific category page */}
                {!productId && (
                    <div className="sticky top-[85px] z-20 hidden md:block w-64 p-4 h-[calc(100vh-100px)] bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 flex-shrink-0 transition-colors duration-300">
                        <ProductList />
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 space-y-5">

                    {/* Breadcrumbs Navigation Track - Shown on category pages */}
                    {productId && (
                        <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 px-1 py-0.5">
                            <div className="flex items-center gap-1.5">
                                <Link to="/home" className="hover:text-[#6C5CE7] hover:underline">Home</Link>
                                <span>/</span>
                                <Link to="/products" className="hover:text-[#6C5CE7] hover:underline">Products</Link>
                                {categoryInfo && (
                                    <>
                                        <span>/</span>
                                        <span className="font-extrabold text-[#6C5CE7] dark:text-purple-300">{categoryInfo.title}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CATEGORY HERO BANNER CARD WITH "THIS IMAGE" */}
                    {categoryInfo ? (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-full h-[220px] sm:h-[290px] md:h-[340px] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-lg border border-white/40 dark:border-gray-700/60 group bg-gray-900"
                        >
                            {/* Back Arrow for Category view (Mobile only) */}
                            <Link
                                to="/products"
                                title="Back to All Products"
                                className="md:hidden absolute top-4 left-4 z-20 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/60 active:scale-95 border border-white/30 rounded-full text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
                            >
                                <ArrowBackIcon sx={{ fontSize: "1.25rem" }} />
                            </Link>

                            <img
                                src={categoryInfo.image}
                                alt={categoryInfo.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent flex flex-col justify-end p-6 sm:p-8 lg:p-10 text-white space-y-2">
                                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-md text-white">
                                    {categoryInfo.title}
                                </h1>
                                <p className="text-xs sm:text-sm md:text-base text-gray-200 font-semibold max-w-xl line-clamp-2 drop-shadow-sm">
                                    {categoryInfo.description}
                                </p>
                                <div className="pt-1 flex items-center gap-3">
                                    <span className="text-xs font-black bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/30 text-white">
                                        {sortedFilteredProducts?.length || 0} Products Available
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="relative w-full rounded-[20px] overflow-hidden shadow-md bg-gradient-to-r from-[#0F2742] via-[#1E88E5] to-[#1565C0] px-4 sm:px-6 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 text-white">
                            {/* Back to Home Arrow Button (Mobile only) */}
                            <Link
                                to="/home"
                                title="Back to Home"
                                className="md:hidden flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 active:scale-95 border border-white/30 rounded-full text-white backdrop-blur-md transition-all cursor-pointer shadow-sm"
                            >
                                <ArrowBackIcon sx={{ fontSize: "1.25rem" }} />
                            </Link>

                            <div className="flex flex-col justify-center space-y-0.5 overflow-hidden">
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
                    <div className="space-y-4">
                        {!productId ? (
                            /* MAIN PRODUCTS PAGE VIEW (!productId): Show ALL Category Images Grid */
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-white dark:bg-gray-800/90 rounded-xl px-4 min-h-[56px] shadow-xs border border-gray-200/80 dark:border-gray-700/80 transition-colors duration-300">
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#2D3748] dark:text-white flex items-center gap-2 tracking-tight leading-tight">
                                        <span>Our Dairy Categories</span>
                                        <span className="text-xs bg-[#6C5CE7]/10 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                                            {allCategoryCards?.length || 0}
                                        </span>
                                    </h2>
                                </div>

                                {productLoading ? (
                                    <MadhurLoader />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
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
                            /* SPECIFIC CATEGORY PAGE VIEW (productId): Show Related Products Grid */
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white dark:bg-gray-800/90 rounded-xl px-4 min-h-[56px] shadow-xs border border-gray-200/80 dark:border-gray-700/80 transition-colors duration-300">
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#2D3748] dark:text-white flex items-center gap-2 tracking-tight leading-tight">
                                        <span>Explore {activeCategoryTitle} Products</span>
                                        <span className="text-xs bg-[#6C5CE7]/10 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                                            {sortedFilteredProducts?.length || 0}
                                        </span>
                                    </h2>

                                    {/* Sort / Filter dropdown button on top right */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => setAnchorEl(e.currentTarget)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors cursor-pointer text-gray-800 dark:text-white"
                                        >
                                            <FilterListIcon sx={{ fontSize: "1.1rem" }} />
                                            <span>{filter === "Sort By" ? "Sort / Filter" : filter}</span>
                                            <KeyboardArrowDownIcon sx={{ fontSize: "1.1rem" }} />
                                        </button>

                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={() => setAnchorEl(null)}
                                            className="mt-1"
                                        >
                                            {[
                                                "Clear",
                                                "Price: Low to High",
                                                "Price: High to Low",
                                                "Quantity: Low to High",
                                                "Quantity: High to Low",
                                                "Sold: Low to High",
                                                "Sold: High to Low",
                                            ].map((option) => (
                                                <MenuItem
                                                    key={option}
                                                    onClick={() => {
                                                        setFilter(option === "Clear" ? "Sort By" : option);
                                                        setAnchorEl(null);
                                                    }}
                                                    className="text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </div>
                                </div>

                                {productLoading ? (
                                    <MadhurLoader />
                                ) : (
                                    <section className="w-full">
                                        {(sortedFilteredProducts?.length ?? 0) === 0 ? (
                                            <div className="py-20 text-center text-gray-500 dark:text-gray-300 font-medium text-lg bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                No products found in this category.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 sm:gap-6 pb-6">
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
