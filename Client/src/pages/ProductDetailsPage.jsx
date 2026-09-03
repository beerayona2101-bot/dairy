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

import { products as fallbackProducts } from "../data/products";

export default function ProductDetailsPage() {

    const { productId } = useParams();
    const { theme } = useContext(ThemeContext);
    const { products, productLoading } = useContext(ProductContext);

    const [page, setPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        if (!productId) return;

        const allAvailable = Array.isArray(products) && products.length > 0 ? products : fallbackProducts;
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
                    className="mt-4 px-4 py-2 bg-[#1E88E5] text-white rounded hover:bg-[#1E88E5] transition"
                >
                    Go to Products
                </Link>
            </div>
        );
    }

    return (
        <>
            <section className="px-4 md:px-6 pt-4 md:pt-24 pb-6 md:pb-10 md:max-w-6xl mx-auto">
                {/* Breadcrumbs Navigation Track */}
                <div className="flex items-center text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 mb-5 pt-1 md:pt-0 px-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Link to="/home" className="hover:text-[#1E88E5] dark:hover:text-[#42A5F5] transition-colors">
                            Home
                        </Link>
                        <span className="text-gray-400 dark:text-gray-600 font-normal">/</span>
                        
                        <Link to="/products" className="hover:text-[#1E88E5] dark:hover:text-[#42A5F5] transition-colors">
                            Products
                        </Link>
                        <span className="text-gray-400 dark:text-gray-600 font-normal">/</span>
                        
                        {(selectedProduct?.category || selectedProduct?.type) && (
                            <>
                                <Link
                                    to={`/products/${slugify(selectedProduct?.category || selectedProduct?.type)}`}
                                    className="hover:text-[#1E88E5] dark:hover:text-[#42A5F5] transition-colors"
                                >
                                    {selectedProduct?.category || selectedProduct?.type}
                                </Link>
                                <span className="text-gray-400 dark:text-gray-600 font-normal">/</span>
                            </>
                        )}
                        
                        <span className="text-[#1E88E5] dark:text-[#42A5F5] font-extrabold truncate max-w-[220px] sm:max-w-none">
                            {selectedProduct?.name || unslugify(productId)}
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <ProductDetails
                        productId={selectedProduct?._id || ""}
                    />
                </div>
            </section>

            <section className="px-4 md:px-6 pb-6 md:pb-10 md:max-w-6xl mx-auto">
                <h2 className="text-xl font-black text-[#2D3748] dark:text-white border-t border-gray-200/60 dark:border-gray-800 pb-3 pt-6 mb-4">
                    Related Products
                </h2>

                {relatedProducts?.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                            {currentItems.map((product, idx) => (
                                <motion.div
                                    key={product?._id || idx}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.02, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                    className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-[16px] border border-white/90 dark:border-gray-700/80 transition-all duration-200 rounded-[20px] shadow-sm overflow-hidden hover:shadow-md hover:scale-102 flex flex-col justify-between"
                                >
                                    <Link to={`/product-details/${slugify(product?.name)}`} className="w-full block h-36 sm:h-40 overflow-hidden bg-gray-100 dark:bg-gray-700/50">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product?.name}
                                            className="w-full h-full object-cover hover:scale-108 transition-transform duration-300 ease-out"
                                        />
                                    </Link>

                                    <div className="p-3.5">
                                        <Link
                                            to={`/product-details/${slugify(product?.name)}`}
                                            className="text-xs sm:text-sm font-extrabold text-[#2D3748] dark:text-white truncate hover:text-[#6C5CE7] line-clamp-1 transition-colors"
                                        >
                                            {product?.name}
                                        </Link>

                                        <p className="text-[11px] text-[#718096] dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                                            {product?.description || ""}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
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
                                            borderColor: theme === 'dark' ? '#555' : '#ccc',
                                        },
                                        '& .Mui-selected': {
                                            backgroundColor: '#1E88E5',
                                            color: '#ffffff',
                                            borderColor: '#1E88E5',
                                            '&:hover': {
                                                backgroundColor: '#1E88E5',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            No related products found in this category ({selectedProduct?.category || selectedProduct?.type || "Category"}).
                        </p>
                    </div>
                )}
            </section>
        </>
    )
}
