import { useContext, useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

import { Pagination } from "@mui/material";
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ThemeContext } from "../context/ThemeProvider";

import { ProductContext } from '../context/ProductProvider';
import ProductDetails from "../components/ProductDetalisComponent/ProductDetails";
import BuffaloLoader from "../components/BuffaloLoader";

import { slugify, unslugify } from "../utils/slugify";
import { recommendProducts } from "../utils/filterData";
import { getProductImage } from "../utils/helper";
import { formatNumberWithCommas } from "../utils/format";

import { fallbackProducts } from "../data/fallbackProducts";
import AnimatedHeading from "../components/Common/AnimatedHeading";
import BackButton from "../components/Common/BackButton";
import FloatingCart from "../components/Common/FloatingCart";

export default function ProductDetailsPage() {

    const { productId } = useParams();
    const { theme } = useContext(ThemeContext);
    const { products, productLoading } = useContext(ProductContext);

    const [page, setPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [productId]);

    useEffect(() => {
        const allAvailable = Array.isArray(products) && products.length > 0 ? products : fallbackProducts;

        if (!productId) {
            const fallbackProd = allAvailable[0] || null;
            setSelectedProduct(fallbackProd);
            if (fallbackProd) {
                const currRelated = recommendProducts(allAvailable, fallbackProd._id || fallbackProd.id);
                setRelatedProducts(currRelated);
            }
            return;
        }

        const searchSlug = slugify(productId).replace(/[^a-z0-9]/g, "");
        const searchClean = (productId || "").toLowerCase().replace(/[^a-z0-9]/g, "");

        const selected = allAvailable.find((p) => {
            const pId = String(p._id || p.id || "").toLowerCase();
            const pName = String(p.name || p.title || "").toLowerCase();
            const pSlug = slugify(pName).replace(/[^a-z0-9]/g, "");
            const pClean = pName.replace(/[^a-z0-9]/g, "");

            return pId === searchClean || pSlug === searchSlug || pClean === searchClean || searchClean.includes(pClean) || pClean.includes(searchClean);
        });

        const targetProduct = selected || allAvailable[0];
        setSelectedProduct(targetProduct);

        if (targetProduct) {
            const currRelatedProducts = recommendProducts(allAvailable, targetProduct._id || targetProduct.id || productId);
            setRelatedProducts(currRelatedProducts);
        }
    }, [productId, products]);

    const totalPages = Math.ceil(relatedProducts.length / 10);
    const startIndex = (page - 1) * 10;
    const currentItems = relatedProducts.slice(startIndex, startIndex + 10);

    const handlePageChange = (_, value) => {
        setPage(value);
    };

    if (productLoading) {
        return <BuffaloLoader variant="inline" text="Loading product details..." />;
    }

    if (!selectedProduct) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-white text-lg mb-3">
                    {products.length === 0
                        ? "No products available in the store."
                        : `${unslugify(productId)} Product not found.`}
                </p>
                <Link
                    to="/products"
                    className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#075C2A] to-[#0756B5] hover:from-[#054593] hover:to-[#063B22] text-white rounded-full font-bold shadow-md shadow-[#075C2A]/25 transition inline-block"
                >
                    Go to Products
                </Link>
            </div>
        );
    }

    return (
        <>
            <section className="px-0 sm:px-6 pt-1 sm:pt-3 pb-4 max-w-7xl mx-auto">
                {/* Desktop Web Navigation Bar with Back Arrow Button */}
                <div className="hidden md:flex items-center justify-between px-1 mb-3">
                    <div className="flex items-center gap-2.5">
                        <BackButton
                            fallbackPath="/products"
                            hideOnWeb={false}
                            variant="pill"
                            label="Back to Products"
                            title="Back to Products"
                        />
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">/</span>
                        <span className="text-xs font-extrabold text-[#0756B5] dark:text-emerald-400 capitalize">
                            {selectedProduct?.category || "Dairy"}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">/</span>
                        <span className="text-xs font-black text-gray-800 dark:text-white truncate max-w-xs">
                            {selectedProduct?.name}
                        </span>
                    </div>
                </div>

                <div className="w-full">
                    <ProductDetails
                        productId={selectedProduct?._id || ""}
                    />
                </div>
            </section>

            <section className="px-4 md:px-6 pb-6 md:pb-10 md:max-w-6xl mx-auto">
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-800 pb-3 pt-6 mb-4">
                    <div>
                        <AnimatedHeading
                            blackText="Related"
                            violetText="Products"
                            className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white"
                            violetClassName="text-[#0756B5] dark:text-emerald-400"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Handpicked dairy essentials from the same category</p>
                    </div>
                    <Link to="/products" className="text-xs sm:text-sm font-bold text-[#075C2A] dark:text-blue-400 hover:underline">
                        View All →
                    </Link>
                </div>

                {relatedProducts?.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full">
                            {currentItems.map((product, idx) => {
                                const prodPrice = Number(product?.price) || 0;
                                const prodDiscount = Number(product?.discount) || 0;
                                const discounted = prodDiscount > 0 ? prodPrice - (prodPrice * prodDiscount) / 100 : prodPrice;

                                return (
                                    <motion.div
                                        key={product?._id || idx}
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.02, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-800 hover:border-[#0756B5] dark:hover:border-emerald-500 transition-all duration-200 rounded-2xl shadow-xs hover:shadow-[0_8px_25px_rgba(7,92,42,0.18)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden group"
                                    >
                                        <Link to={`/product-details/${slugify(product?.name)}`} className="w-full block h-36 sm:h-44 overflow-hidden bg-gradient-to-br from-[#F5E9D0]/40 via-emerald-50/20 to-[#FFFDF7] dark:from-slate-800 dark:to-slate-900 relative">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product?.name}
                                                className="w-full h-full object-contain p-2.5 group-hover:scale-108 transition-transform duration-300 ease-out"
                                            />
                                            {prodDiscount > 0 && (
                                                <span className="absolute top-2 right-2 bg-[#075C2A] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                                                    {prodDiscount}% OFF
                                                </span>
                                            )}
                                        </Link>

                                        <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                                            <div>
                                                <Link
                                                    to={`/product-details/${slugify(product?.name)}`}
                                                    className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate group-hover:text-[#0756B5] dark:group-hover:text-emerald-400 line-clamp-1 transition-colors block"
                                                >
                                                    {product?.name}
                                                </Link>

                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">
                                                    {product?.description || ""}
                                                </p>
                                            </div>

                                            <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-sm sm:text-base font-black text-[#075C2A] dark:text-blue-400">
                                                        &#8377;{formatNumberWithCommas(discounted)}
                                                    </span>
                                                    {prodDiscount > 0 && (
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 line-through">
                                                            &#8377;{formatNumberWithCommas(prodPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                                                    {product?.quantityUnit || "1 Litre"}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    variant="outlined"
                                    shape="rounded"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            color: theme === 'dark' ? '#ffffff' : '#000000',
                                            borderColor: theme === 'dark' ? '#555' : '#e2e8f0',
                                        },
                                        '& .Mui-selected': {
                                            backgroundColor: '#075C2A',
                                            color: '#ffffff',
                                            borderColor: '#075C2A',
                                            fontWeight: 800,
                                            '&:hover': {
                                                backgroundColor: '#5844D8',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-[#F5E9D0]/50 dark:bg-slate-800/40 p-6 rounded-2xl border border-[#D5A62A] dark:border-slate-700/60 text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            No related products found in this category ({selectedProduct?.category || selectedProduct?.type || "Category"}).
                        </p>
                    </div>
                )}
            </section>

            {/* Floating Cart Button (Right Side) */}
            <FloatingCart />
        </>
    )
}
