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
import { Tooltip } from "@mui/material";
import Rating from '@mui/material/Rating';
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CartProvider";
import { productLike } from "../../services/productServices";
import { getDiscountedPrice, getProductImage } from "../../utils/helper";
import { formatNumberWithCommas } from "../../utils/format";
import { addToWishlist, removeProductFromWishList } from "../../services/userProfileService";
import { ProductContext } from "../../context/ProductProvider";
import { slugify } from "../../utils/slugify";
import { useSnackbar } from "notistack";
import { getGuestWishlist, toggleGuestWishlist } from "../../utils/guestWishlist";

import { products as fallbackProducts } from "../../data/products";

export default function ProductDetails({ productId: propProductId }) {
    const params = useParams();
    const productId = propProductId || params?.productId;
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { authUser, setAuthUser, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
    const activeUser = authUser || authAdmin;
    const setCurUser = authUser ? setAuthUser : setAuthAdmin;
    
    const { cartItems, addToCart, updateCartItem, removeFromCart } = useContext(CartContext);
    const { products } = useContext(ProductContext);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [localQty, setLocalQty] = useState(0);
    const [selectedImage, setSelectedImage] = useState("");
    const [localLikes, setLocalLikes] = useState([]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [guestWishlist, setGuestWishlist] = useState(getGuestWishlist);

    useEffect(() => {
        const updateGuest = () => setGuestWishlist(getGuestWishlist());
        window.addEventListener("guestWishlistUpdated", updateGuest);
        return () => window.removeEventListener("guestWishlistUpdated", updateGuest);
    }, []);

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
        setLocalLikes(finalProduct?.likes || []);
        if (finalProduct) {
            const defaultImg = (Array.isArray(finalProduct.image) && finalProduct.image[0])
                ? finalProduct.image[0]
                : (typeof finalProduct.image === 'string' && finalProduct.image.trim() !== '' ? finalProduct.image : finalProduct.pngImage || getProductImage(finalProduct));
            setSelectedImage(defaultImg);
        }
        setLocalQty(0);
    }, [productId, products, activeUser?.wishlistedProducts, activeUser?._id, guestWishlist]);

    const minQty = Number(selectedProduct?.minQuantity) || 1;
    const targetId = selectedProduct?._id || productId;
    const existing = cartItems?.find(item => item?.productId === targetId || item?.productId === selectedProduct?._id);
    const inCartQty = existing ? Number(existing.quantity) : 0;
    const stock = selectedProduct?.stock || 0;
    const avgRating = 5;

    const priceNumber = Number(selectedProduct?.price) || 0;
    const discountPercent = Number(selectedProduct?.discount) || 0;
    const { discountedPrice, saved } = getDiscountedPrice(priceNumber, discountPercent);


    const handleAddProduct = () => {
        if (!targetId) return;
        const qtyToAdd = existing ? minQty : (localQty > 0 ? localQty : minQty);

        if (stock > 0 && (inCartQty + qtyToAdd) > stock) {
            enqueueSnackbar("Stock not available!", { variant: "error" });
            return;
        }

        addToCart(targetId, qtyToAdd, discountedPrice);
        enqueueSnackbar(existing ? "Added more to cart!" : "Product added to cart!", { variant: "success" });
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

    const handleInputChange = (e) => {
        const value = Number(e.target.value);
        if (value < 0) {
            enqueueSnackbar("Quantity cannot be negative", { variant: "error" });
            return;
        }
        if (value > stock) {
            enqueueSnackbar("Exceeds available stock", { variant: "error" });
            return;
        }

        if (existing) {
            if (value === 0) {
                removeFromCart(targetId);
                enqueueSnackbar("Removed from cart", { variant: "info" });
            } else {
                updateCartItem(targetId, value);
            }
        } else {
            setLocalQty(value);
        }
    };

    const handleLikeProduct = async (prodId) => {
        if (!activeUser?._id) {
            enqueueSnackbar("Please log in to like products.", { variant: "error" });
            setOpenLoginDialog(true);
            return;
        }

        if (localLikes.includes(activeUser._id)) {
            enqueueSnackbar("You already liked this product.", { variant: "info" });
            return;
        }

        setLikeLoading(true);

        try {
            const { message, updatedLikes } = await productLike(prodId, activeUser._id);
            setLocalLikes(updatedLikes);
            enqueueSnackbar(message || "You liked the product!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Failed to like product.", { variant: "error" });
        } finally {
            setLikeLoading(false);
        }
    }

    const handleBuyNow = () => {
        if (!existing) {
            handleAddProduct();
        }
        navigate('/cart');
    }

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
    if (allProductImages.length === 0 && selectedProduct) {
        allProductImages.push(getProductImage(selectedProduct));
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col md:flex-row gap-6 md:gap-8 justify-center my-0 md:my-6 max-w-7xl mx-auto px-0 md:px-4"
            >
                <div className="flex flex-col items-center flex-1 max-w-none w-full">
                    {/* Image Viewer Container */}
                    <div className="relative w-full h-[360px] sm:h-[420px] md:h-[450px] min-h-[300px] bg-white dark:bg-gray-800 rounded-none md:rounded-3xl border-none md:border border-gray-200/80 dark:border-gray-700/80 shadow-none md:shadow-md overflow-hidden p-0 md:p-4 flex items-center justify-center transition-all">
                        {/* Floating Back Arrow Button (Mobile Responsive Only) */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="absolute top-4 left-4 z-30 rounded-full w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 text-gray-800 dark:text-white shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer md:hidden"
                            title="Go Back"
                        >
                            <i className="fa-solid fa-arrow-left text-base"></i>
                        </button>

                        {(!selectedImage || selectedImage === 'null') ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <EmojiFoodBeverageIcon className="text-gray-400 dark:text-gray-300 text-5xl" />
                                <span className="text-gray-500 dark:text-gray-300 text-sm font-medium">
                                    {selectedProduct?.name}
                                </span>
                            </div>
                        ) : (
                            <img
                                src={selectedImage}
                                alt={selectedProduct?.name || "Main product"}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover rounded-none md:rounded-2xl"
                            />
                        )}

                        {/* Floating Wishlist Heart Circle Button */}
                        <button
                            onClick={() => handleToggleWishlist(targetId)}
                            disabled={wishlistLoading}
                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            className={`absolute top-4 right-4 rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 border ${
                                isWishlisted
                                    ? "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-[#FF385C] shadow-rose-500/20"
                                    : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-white/80 dark:border-gray-700 text-gray-400 hover:text-[#FF385C] hover:bg-rose-50/60"
                            }`}
                        >
                            {wishlistLoading ? (
                                <div className="w-4 h-4 border-2 border-t-transparent border-[#FF385C] rounded-full animate-spin"></div>
                            ) : isWishlisted ? (
                                <FavoriteIcon className="text-[#FF385C] fill-current drop-shadow-[0_0_10px_rgba(255,56,92,0.75)] animate-pulse" sx={{ fontSize: "1.35rem" }} />
                            ) : (
                                <FavoriteBorderIcon className="text-gray-400 hover:text-[#FF385C] transition-colors" sx={{ fontSize: "1.35rem" }} />
                            )}
                        </button>
                    </div>
                </div>

                {allProductImages.length > 0 && (
                    <div className="flex justify-center items-center gap-3 flex-wrap mt-3 px-3 md:px-0">
                        {allProductImages.map((img, idx) => (
                            <button
                                key={`product-thumb-${idx}`}
                                type="button"
                                onClick={() => setSelectedImage(img)}
                                onMouseEnter={() => setSelectedImage(img)}
                                className={`w-14 h-14 md:w-18 md:h-18 border-2 rounded-xl p-1 overflow-hidden transition-all duration-200 cursor-pointer shadow-xs ${
                                    selectedImage === img
                                        ? "border-[#1E88E5] ring-2 ring-[#1E88E5]/30 scale-105 bg-blue-50/40 dark:bg-gray-800"
                                        : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 opacity-70 hover:opacity-100 hover:border-gray-400"
                                }`}
                                aria-label={`Select image ${idx + 1}`}
                            >
                                <img
                                    src={img}
                                    alt={`${selectedProduct?.name || 'Product'} thumbnail ${idx + 1}`}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 px-4 sm:px-6 md:px-0 mt-4 md:mt-0"
            >
                <h2 className="text-2xl font-bold mb-1">{selectedProduct?.name || "Not Defined"}</h2>

                <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <div className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                        <span>Quality: </span>
                        <span>{selectedProduct?.type || "Unknown"}</span>
                    </div>
                    <span className="border-e-2 border-gray-300 dark:border-gray-500 py-[5.2px]"></span>
                    <div className="text-yellow-500 font-semibold flex items-center gap-2">
                        <div className="dark:bg-white flex px-1 py-0.5 rounded">
                            <Rating sx={{ fontSize: "1rem" }} name="read-only" value={avgRating} readOnly />
                        </div>
                        <span>{avgRating}</span>
                        <span className="text-gray-500 dark:text-gray-300 text-sm">({selectedProduct?.reviews?.length || 0} reviews)</span>
                    </div>
                    <span className="border-e-2 border-gray-300 dark:border-gray-500 py-[5.2px]"></span>
                    <p className="text-gray-500 dark:text-gray-300 text-sm font-semibold">
                        Shelf Life: {selectedProduct?.shelfLife || "Not specified"}
                    </p>
                </div>

                {stock > 0 ? (
                    <div
                        className={`px-2 rounded text-[14px] inline-block mb-1
                            ${stock < selectedProduct?.thresholdVal
                                ? "bg-red-600/10 text-red-700 dark:text-red-500"
                                : "bg-green-600/10 text-green-800 dark:text-green-500"}
                        `}
                    >
                        {stock < selectedProduct?.thresholdVal ? "AVAILABILITY : ONLY " : "AVAILABILITY : "}{" "}
                        {stock} {(selectedProduct?.quantityUnit || "Unit").toUpperCase()} IN STOCK
                    </div>
                ) : (
                    <div className="text-red-600 font-semibold text-[14px] mb-1">
                        OUT OF STOCK
                    </div>
                )}


                <div className="text-gray-700 dark:text-gray-400 font-semibold text-sm mb-3">
                    Minimum Quantity: {minQty || 1} {selectedProduct?.quantityUnit || "Unit"}
                </div>

                <div className="border-t border-dashed border-gray-500/50 pt-2">
                    <h3 className="font-bold pb-1">Description: </h3>
                    <p className="whitespace-pre-line text-gray-500 dark:text-gray-200 text-sm line-clamp-15">{selectedProduct?.description || "No description available"}</p>
                </div>

                {selectedProduct?.nutrition && (
                    <div className="my-4">
                        <h3 className="font-semibold mb-1">Nutrition Facts:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 dark:text-gray-200">
                            {Object.entries(selectedProduct?.nutrition).map(([key, value]) => (
                                <li key={key} className="capitalize">
                                    <span className="font-medium">{key}:</span> {value}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <br />

                {existing && (
                    <div className="mb-2">
                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-md">
                            In Cart: {inCartQty} {selectedProduct?.quantityUnit || "Unit"}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-3">
                    <div className="mb-3">
                        {discountPercent > 0 ? (
                            <>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-2xl md:text-3xl font-bold text-[#1E88E5]">
                                        &#8377;{formatNumberWithCommas(discountedPrice)}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-300 text-base line-through">
                                        &#8377;{formatNumberWithCommas(priceNumber)}
                                    </span>
                                    <span className="bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center">
                                        {discountPercent}% OFF
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-300">
                                    You save &#8377;{formatNumberWithCommas(saved)}
                                </div>
                            </>
                        ) : (
                            <h1 className="text-2xl md:text-3xl font-bold text-[#1E88E5]">
                                &#8377;{formatNumberWithCommas(priceNumber)}
                            </h1>
                        )}
                    </div>


                </div>

                <div className="py-5 grid grid-cols-2 gap-3">
                    <button
                        onClick={handleBuyProductNow}
                        disabled={stock <= 0}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#43A047] hover:bg-[#2E7D32] text-white cursor-pointer disabled:opacity-50 font-bold transition shadow-md"
                    >
                        <span>Buy Now</span>
                    </button>
                    <button
                        onClick={handleAddProduct}
                        disabled={stock <= 0}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-white bg-[#1E88E5] hover:bg-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold transition shadow-md"
                    >
                        <ShoppingCartIcon sx={{ fontSize: "1.2rem" }} />
                        <span>{existing ? "+ Add More to Cart" : "Add to Cart"}</span>
                    </button>
                </div>

            </motion.div>
        </>
    );
};

ProductDetails.propTypes = {
    productId: PropTypes.string.isRequired,
};