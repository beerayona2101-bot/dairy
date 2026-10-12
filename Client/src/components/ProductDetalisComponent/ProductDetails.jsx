import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import StarIcon from '@mui/icons-material/Star';
import { Tooltip } from "@mui/material";
import Rating from '@mui/material/Rating';
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CartProvider";
import { getDiscountedPrice, getProductImage, splitProductName, formatRating } from "../../utils/helper";
import { formatNumberWithCommas } from "../../utils/format";
import { addToWishlist, removeProductFromWishList } from "../../services/userProfileService";
import { ProductContext } from "../../context/ProductProvider";
import { slugify } from "../../utils/slugify";
import { useSnackbar } from "notistack";
import { getGuestWishlist, toggleGuestWishlist } from "../../utils/guestWishlist";
import BuffaloLoader from "../BuffaloLoader";
import DiscountBadge from "../Common/DiscountBadge";

import { fallbackProducts } from "../../data/fallbackProducts";

export default function ProductDetails({ productId: propProductId }) {
    const params = useParams();
    const productId = propProductId || params?.productId;
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { authUser, setAuthUser } = useContext(UserAuthContext);
    const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
    const activeUser = authUser || authAdmin;
    const setCurUser = authUser ? setAuthUser : setAuthAdmin;
    
    const { cartItems, addToCart, updateCartItem, removeFromCart } = useContext(CartContext);
    const { products } = useContext(ProductContext);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [localQty, setLocalQty] = useState(0);
    const [selectedImage, setSelectedImage] = useState("");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [guestWishlist, setGuestWishlist] = useState(getGuestWishlist);

    useEffect(() => {
        const updateGuest = () => setGuestWishlist(getGuestWishlist());
        window.addEventListener("guestWishlistUpdated", updateGuest);
        return () => window.removeEventListener("guestWishlistUpdated", updateGuest);
    }, []);

    useEffect(() => {
        const allAvailable = Array.isArray(products) && products.length > 0 ? products : fallbackProducts;

        if (!productId) {
            const fallbackProd = allAvailable[0] || null;
            setSelectedProduct(fallbackProd);
            if (fallbackProd) {
                const defaultImg = getProductImage(fallbackProd);
                setSelectedImage(defaultImg);
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

        const finalProduct = selected || allAvailable[0];
        setSelectedProduct(finalProduct);
        
        let wishlisted = false;
        const targetId = finalProduct?._id || productId;
        if (activeUser?._id) {
            wishlisted = Array.isArray(activeUser?.wishlistedProducts) && activeUser.wishlistedProducts.some(w => {
                if (!w) return false;
                const wId = typeof w === 'object' ? w._id || w.id : w;
                return String(wId) === String(finalProduct?._id) || String(wId) === String(productId);
            });
        } else {
            wishlisted = guestWishlist.map(String).includes(String(targetId));
        }

        setIsWishlisted(Boolean(wishlisted));
        if (finalProduct) {
            const defaultImg = getProductImage(finalProduct);
            setSelectedImage(defaultImg);
        }
        setLocalQty(0);
    }, [productId, products, activeUser?.wishlistedProducts, activeUser?._id, guestWishlist]);

    const minQty = Number(selectedProduct?.minQuantity) || 1;
    const targetId = selectedProduct?._id || selectedProduct?.id || productId;
    
    const existing = cartItems?.find(item => {
        if (!item) return false;
        const rawId = typeof item.productId === "object"
            ? (item.productId?._id || item.productId?.id)
            : item.productId;
        if (!rawId) return false;
        const itemPId = String(rawId).trim();
        const selId = selectedProduct?._id ? String(selectedProduct._id).trim() : null;
        const selNumericId = selectedProduct?.id ? String(selectedProduct.id).trim() : null;
        const paramId = productId ? String(productId).trim() : null;

        return (selId && itemPId === selId) || 
               (selNumericId && itemPId === selNumericId) || 
               (paramId && itemPId === paramId);
    });

    const inCartQty = existing ? Number(existing.quantity) : 0;
    const stock = selectedProduct?.stock || 0;
    const rawRating = selectedProduct?.rating !== undefined && selectedProduct?.rating !== null ? Number(selectedProduct.rating) : 4.9;
    const avgRating = isNaN(rawRating) ? 4.9 : rawRating;
    const displayRating = formatRating(avgRating);

    const productName = selectedProduct?.name || "Not Defined";
    const { mainTitle, variantInfo } = splitProductName(productName);

    const priceNumber = Number(selectedProduct?.price) || 0;
    const discountPercent = Number(selectedProduct?.discount) || 0;
    const { discountedPrice, saved } = getDiscountedPrice(priceNumber, discountPercent);

    const handleAddProduct = () => {
        if (!targetId) return;

        if (existing) {
            navigate("/cart");
            return;
        }

        const qtyToAdd = localQty > 0 ? localQty : minQty;

        if (stock > 0 && (inCartQty + qtyToAdd) > stock) {
            enqueueSnackbar("Stock not available!", { variant: "error" });
            return;
        }

        addToCart(targetId, qtyToAdd, discountedPrice);
        enqueueSnackbar("Product added to cart!", { variant: "success" });
    };

    const handleBuyProductNow = () => {
        if (!targetId) return;
        if (!existing) {
            const qtyToAdd = localQty > 0 ? localQty : minQty;
            if (stock > 0 && qtyToAdd > stock) {
                enqueueSnackbar("Stock not available!", { variant: "error" });
                return;
            }
            addToCart(targetId, qtyToAdd, discountedPrice);
        }
        navigate("/order-checkout");
    };

    const handleIncrementCart = () => {
        if (!targetId) return;
        if (inCartQty + minQty > stock) {
            enqueueSnackbar("No more stock available", { variant: "warning" });
            return;
        }
        updateCartItem(targetId, inCartQty + minQty);
    };

    const handleDecrementCart = () => {
        if (!targetId) return;
        const nextQty = Number((inCartQty - minQty).toFixed(3));
        if (nextQty <= 0) {
            removeFromCart(targetId);
            enqueueSnackbar("Removed from cart", { variant: "info" });
        } else {
            updateCartItem(targetId, nextQty);
        }
    };

    const handleToggleWishlist = async (prodId) => {
        if (!prodId) return;

        if (!activeUser?._id) {
            const { added } = toggleGuestWishlist(prodId);
            setIsWishlisted(added);
            enqueueSnackbar(added ? "Product added to wishlist!" : "Removed from wishlist!", { variant: added ? "success" : "info" });
            return;
        }

        if (wishlistLoading) return;

        const wasWishlisted = isWishlisted;
        setCurUser((prev) => {
            if (!prev) return prev;
            const currentList = Array.isArray(prev.wishlistedProducts) ? prev.wishlistedProducts : [];
            const newList = wasWishlisted
                ? currentList.filter(item => (typeof item === 'object' ? String(item._id) !== String(prodId) : String(item) !== String(prodId)))
                : [...currentList, prodId];
            return { ...prev, wishlistedProducts: newList };
        });

        try {
            setWishlistLoading(true);
            if (wasWishlisted) {
                const data = await removeProductFromWishList(activeUser._id, prodId);
                if (data?.success) {
                    enqueueSnackbar("Removed from wishlist!", { variant: "info" });
                }
            } else {
                const data = await addToWishlist(activeUser._id, prodId);
                if (data?.success) {
                    enqueueSnackbar("Product added to wishlist!", { variant: "success" });
                }
            }
        } catch (error) {
            setCurUser((prev) => {
                if (!prev) return prev;
                const currentList = Array.isArray(prev.wishlistedProducts) ? prev.wishlistedProducts : [];
                const revertedList = wasWishlisted
                    ? [...currentList, prodId]
                    : currentList.filter(item => (typeof item === 'object' ? String(item._id) !== String(prodId) : String(item) !== String(prodId)));
                return { ...prev, wishlistedProducts: revertedList };
            });
            enqueueSnackbar(error?.response?.data?.message || "Failed to update wishlist.", { variant: "error" });
        } finally {
            setWishlistLoading(false);
        }
    };

    const allProductImages = [];
    if (selectedProduct) {
        const addImg = (src) => {
            if (!src) return;
            if (Array.isArray(src)) {
                src.forEach(s => addImg(s));
                return;
            }
            if (typeof src === "string" && src.trim() !== "" && !allProductImages.includes(src)) {
                allProductImages.push(src);
            }
        };
        addImg(selectedProduct.image);
        addImg(selectedProduct.pngImage);
        addImg(selectedProduct.showcaseCutout);
    }

    if (!selectedProduct) {
        return (
            <div className="w-full py-16 flex flex-col items-center justify-center">
                <BuffaloLoader variant="inline" text="Loading product details..." />
            </div>
        );
    }

    if (allProductImages.length === 0) {
        allProductImages.push(getProductImage(selectedProduct));
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl sm:rounded-[28px] p-4 sm:p-6 lg:p-8 transition-all my-0"
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8 items-center">
                {/* Left Side: Product Gallery */}
                <div className="md:col-span-5 flex flex-col items-center">
                    {/* Main Image View */}
                    <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] lg:h-[400px] rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex items-center justify-center group shadow-xs">
                        {(!selectedImage || selectedImage === 'null') ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <EmojiFoodBeverageIcon className="text-slate-400 dark:text-slate-500 text-5xl" />
                                <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">
                                    {selectedProduct?.name}
                                </span>
                            </div>
                        ) : (
                            <img
                                src={selectedImage}
                                alt={selectedProduct?.name || "Main product"}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getProductImage(selectedProduct);
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out block m-0 border-0"
                            />
                        )}

                        {/* Floating Wishlist Heart Circle Button */}
                        <button
                            onClick={() => handleToggleWishlist(targetId)}
                            disabled={wishlistLoading}
                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            className={`absolute top-3 right-3 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 border ${
                                isWishlisted
                                    ? "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-[#FF385C] shadow-rose-500/20"
                                    : "bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/80 dark:border-slate-700 text-slate-400 hover:text-[#FF385C] hover:bg-rose-50/60"
                            }`}
                        >
                            {wishlistLoading ? (
                                <div className="w-4 h-4 border-2 border-t-transparent border-[#FF385C] rounded-full animate-spin"></div>
                            ) : isWishlisted ? (
                                <FavoriteIcon className="text-[#FF385C] fill-current drop-shadow-[0_0_10px_rgba(255,56,92,0.75)] animate-pulse" sx={{ fontSize: "1.25rem" }} />
                            ) : (
                                <FavoriteBorderIcon className="text-slate-400 hover:text-[#FF385C] transition-colors" sx={{ fontSize: "1.25rem" }} />
                            )}
                        </button>

                        {/* Rating: Only Number and Star at the Image Bottom Right Corner */}
                        <div className="absolute bottom-3 right-3 z-20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md flex items-center gap-1 leading-none select-none pointer-events-none">
                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                                {displayRating}
                            </span>
                            <StarIcon sx={{ fontSize: "0.95rem" }} className="text-amber-500 fill-amber-500" />
                        </div>
                    </div>

                    {/* Image Thumbnails Gallery */}
                    {allProductImages.length > 1 && (
                        <div className="flex justify-center items-center gap-2 flex-wrap mt-3 w-full">
                            {allProductImages.map((img, idx) => (
                                <button
                                    key={`product-thumb-${idx}`}
                                    type="button"
                                    onClick={() => setSelectedImage(img)}
                                    onMouseEnter={() => setSelectedImage(img)}
                                    className={`w-12 h-12 md:w-14 md:h-14 border rounded-xl p-1 overflow-hidden transition-all duration-200 cursor-pointer shadow-xs ${
                                        selectedImage === img
                                            ? "border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/20 scale-105 bg-white dark:bg-slate-800 shadow-sm"
                                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 opacity-70 hover:opacity-100 hover:border-slate-400"
                                    }`}
                                    aria-label={`Select image ${idx + 1}`}
                                >
                                    <img
                                        src={img}
                                        alt={`${selectedProduct?.name || 'Product'} thumbnail ${idx + 1}`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getProductImage(selectedProduct);
                                        }}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Product Details & Purchase Actions */}
                <div className="md:col-span-7 flex flex-col justify-between h-full space-y-3">
                    <div>
                        {/* Brand Hierarchy: Clean Neutral Tags */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-none">
                                Natural
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase leading-none bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                Milk Dairy
                            </span>
                            {(selectedProduct?.category || selectedProduct?.type) && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">
                                    <span>🥛</span>
                                    <span>{selectedProduct?.category || selectedProduct?.type}</span>
                                </span>
                            )}
                        </div>

                        {/* Title: Base product name in crisp slate/black, variant in subtle secondary slate */}
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug mb-2 text-slate-900 dark:text-white">
                            <span>{mainTitle}</span>
                            {variantInfo && (
                                <span className="text-sm sm:text-base lg:text-lg font-bold text-slate-500 dark:text-slate-400 ml-2 inline-block">
                                    {variantInfo}
                                </span>
                            )}
                        </h1>

                        {/* Quality & Shelf Life */}
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap text-xs">
                            <div className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Quality:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedProduct?.type || "Full Cream"}</span>
                            </div>

                            <div className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Shelf Life:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedProduct?.shelfLife || "7 Days"}</span>
                            </div>
                        </div>

                        {/* Availability Pill */}
                        <div className="mb-2.5 flex items-center gap-2.5 flex-wrap">
                            {stock > 0 ? (
                                <div
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1.5 border ${
                                        stock < (selectedProduct?.thresholdVal || 10)
                                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                            : "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${stock < (selectedProduct?.thresholdVal || 10) ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                                    <span>
                                        {stock < (selectedProduct?.thresholdVal || 10) ? `Only ${stock} left in stock` : `${stock} ${(selectedProduct?.quantityUnit || "Litre")} in stock`}
                                    </span>
                                </div>
                            ) : (
                                <div className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                    Out of stock
                                </div>
                            )}

                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Minimum Quantity: {minQty || 1} {selectedProduct?.quantityUnit || "Litre"}
                            </span>
                        </div>

                        {/* Description Box */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-2.5">
                            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider pb-1">Description:</h3>
                            <p className="whitespace-pre-line text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                {selectedProduct?.description || "No description available"}
                            </p>
                        </div>

                        {/* Nutrition Facts */}
                        {selectedProduct?.nutrition && typeof selectedProduct.nutrition === 'object' && !Array.isArray(selectedProduct.nutrition) && Object.keys(selectedProduct.nutrition).length > 0 && (
                            <div className="my-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                <h3 className="font-bold text-slate-900 dark:text-white text-[11px] mb-2 uppercase tracking-wider">Nutrition Facts</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    {Object.entries(selectedProduct.nutrition).map(([key, value]) => (
                                        <div key={key} className="capitalize flex items-center justify-between bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <span className="font-medium text-slate-500 dark:text-slate-400">{key}:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                        {/* In-cart status badge */}
                        {existing && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                    In Cart: {inCartQty} {selectedProduct?.quantityUnit || "Litre"}
                                </span>
                            </div>
                        )}

                        {/* Price section: Discount tag removed beside price, You saved placed at bottom of price */}
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    &#8377;{formatNumberWithCommas(discountedPrice)}
                                </span>
                                {discountPercent > 0 && (
                                    <span className="text-slate-400 dark:text-slate-500 text-sm sm:text-base line-through font-semibold">
                                        &#8377;{formatNumberWithCommas(priceNumber)}
                                    </span>
                                )}
                            </div>
                            {discountPercent > 0 && (
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    You save &#8377;{formatNumberWithCommas(saved)}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-1">
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                <button
                                    onClick={handleBuyProductNow}
                                    disabled={stock <= 0}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#075C2A] to-[#063B22] hover:from-[#064821] hover:to-[#042616] text-white cursor-pointer disabled:opacity-50 font-black transition shadow-lg shadow-[#075C2A]/20 hover:shadow-[#075C2A]/40 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base tracking-wide min-h-[46px]"
                                >
                                    <span>Buy Now</span>
                                </button>
                                {existing ? (
                                    <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-gradient-to-r from-[#0756B5] to-[#054593] text-white font-black shadow-lg shadow-[#0756B5]/25 transition-all text-sm min-h-[46px]">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDecrementCart();
                                            }}
                                            className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/35 active:scale-95 flex items-center justify-center text-white transition cursor-pointer font-black"
                                            title="Decrease quantity"
                                        >
                                            <RemoveIcon sx={{ fontSize: "1.1rem" }} />
                                        </button>

                                        <div
                                            onClick={() => navigate("/cart")}
                                            title="Click to view cart"
                                            className="flex-1 flex items-center justify-center cursor-pointer text-white font-black px-1 select-none"
                                        >
                                            <span className="text-base sm:text-lg font-black tracking-tight">{inCartQty}</span>
                                            <span className="text-[11px] font-bold text-white/80 ml-1">{selectedProduct?.quantityUnit || "Unit"}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleIncrementCart();
                                            }}
                                            disabled={inCartQty >= stock}
                                            className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/35 active:scale-95 flex items-center justify-center text-white transition cursor-pointer font-black disabled:opacity-40"
                                            title="Increase quantity"
                                        >
                                            <AddIcon sx={{ fontSize: "1.1rem" }} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddProduct}
                                        disabled={stock <= 0}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-[#0756B5] to-[#054593] hover:from-[#054593] hover:to-[#033470] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-black transition shadow-md hover:shadow-lg shadow-[#0756B5]/20 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base tracking-wide min-h-[46px] group"
                                    >
                                        <ShoppingCartIcon sx={{ fontSize: "1.2rem" }} />
                                        <span className="truncate">Add to Cart</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

ProductDetails.propTypes = {
    productId: PropTypes.string.isRequired,
};
