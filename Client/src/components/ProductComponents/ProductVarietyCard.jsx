import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import { Tooltip } from "@mui/material";

import { slugify } from "../../utils/slugify";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CartProvider";
import { getDiscountedPrice, getProductImage } from "../../utils/helper";
import { formatNumberWithCommas } from "../../utils/format";
import { addToWishlist, removeProductFromWishList } from "../../services/userProfileService";
import { useSnackbar } from 'notistack';
import { getGuestWishlist, toggleGuestWishlist } from "../../utils/guestWishlist";

export default function ProductVarietyCard(props) {
    const productObj = props.product || props || {};
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { authUser, setAuthUser, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
    const activeUser = authUser || authAdmin;
    const setCurUser = authUser ? setAuthUser : setAuthAdmin;
    const { cartItems, addToCart, updateCartItem, removeFromCart } = useContext(CartContext);

    const [localQty, setLocalQty] = useState(0);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const [guestWishlist, setGuestWishlist] = useState(getGuestWishlist);

    useEffect(() => {
        const updateGuest = () => setGuestWishlist(getGuestWishlist());
        window.addEventListener("guestWishlistUpdated", updateGuest);
        return () => window.removeEventListener("guestWishlistUpdated", updateGuest);
    }, []);

    const id = props.id || props._id || productObj._id || productObj.id;
    const name = props.name || productObj.name || productObj.title || "Unnamed Product";
    const image = props.image || productObj.image;
    const price = props.price ?? productObj.price ?? 0;
    const discount = props.discount ?? productObj.discount ?? 0;
    const stock = props.stock ?? productObj.stock ?? 10;
    const minQty = Number(props.minQuantity ?? productObj.minQuantity ?? 1) || 1;
    const minQuantity = minQty;
    const type = props.type || productObj.type || "Unknown";
    const rating = props.rating ?? productObj.rating ?? 4.9;
    const quantityUnit = props.quantityUnit || productObj.quantityUnit || "unit";

    const finalImage = getProductImage({ name, image });
    const existing = cartItems?.find(item => {
        if (!item) return false;
        const rawId = typeof item.productId === "object"
            ? (item.productId?._id || item.productId?.id)
            : item.productId;
        if (!rawId) return false;
        return String(rawId).trim() === String(id).trim();
    });
    const inCartQty = existing ? Number(existing.quantity) : 0;

    const priceNumber = Number(price);
    const discountPercent = Number(discount) || 0;
    const { discountedPrice } = getDiscountedPrice(priceNumber, discountPercent);
    const isWishlisted = activeUser?._id
        ? (Array.isArray(activeUser?.wishlistedProducts) && activeUser.wishlistedProducts.some(w => {
            if (!w) return false;
            const wId = typeof w === 'object' ? w._id || w.id : w;
            return String(wId) === String(id);
        }))
        : guestWishlist.map(String).includes(String(id));

    const showSnackbar = (message, variant = "info") => {
        enqueueSnackbar(message, { variant });
    };

    const handleAddInitialToCart = () => {
        const qtyToAdd = localQty > 0 ? localQty : minQty;
        if (stock > 0 && qtyToAdd > stock) {
            showSnackbar("Stock not available!", "error");
            return;
        }
        addToCart(id, qtyToAdd, discountedPrice);
        showSnackbar("Product added to cart!", "success");
    };

    const handleIncrementCart = () => {
        if (inCartQty + minQty > stock) {
            showSnackbar("No more stock available", "warning");
            return;
        }
        updateCartItem(id, inCartQty + minQty);
    };

    const handleDecrementCart = () => {
        const nextQty = Number((inCartQty - minQty).toFixed(3));
        if (nextQty <= 0) {
            removeFromCart(id);
            showSnackbar("Removed from cart", "info");
        } else {
            updateCartItem(id, nextQty);
        }
    };

    const handleInputChange = (e) => {
        const value = Number(e.target.value);
        if (value < 0) {
            showSnackbar("Quantity cannot be negative", "error");
            return;
        }
        if (value > stock) {
            showSnackbar("Exceeds available stock", "error");
            return;
        }

        if (existing) {
            if (value === 0) {
                removeFromCart(id);
                showSnackbar("Removed from cart", "info");
            } else {
                updateCartItem(id, value);
            }
        } else {
            setLocalQty(value);
        }
    };

    const handleToggleWishlist = async (productId) => {
        if (!productId) return;

        if (!activeUser?._id) {
            const { added } = toggleGuestWishlist(productId);
            showSnackbar(added ? "Product added to wishlist!" : "Removed from wishlist!", added ? "success" : "info");
            return;
        }

        if (wishlistLoading) return;

        const wasWishlisted = isWishlisted;
        // Instant Optimistic Update
        setCurUser((prev) => {
            if (!prev) return prev;
            const currentList = Array.isArray(prev.wishlistedProducts) ? prev.wishlistedProducts : [];
            const newList = wasWishlisted
                ? currentList.filter(item => (typeof item === 'object' ? String(item._id) !== String(productId) : String(item) !== String(productId)))
                : [...currentList, productId];
            return { ...prev, wishlistedProducts: newList };
        });

        try {
            setWishlistLoading(true);
            if (wasWishlisted) {
                const data = await removeProductFromWishList(activeUser._id, productId);
                if (data?.success) {
                    showSnackbar("Removed from wishlist!", "info");
                }
            } else {
                const data = await addToWishlist(activeUser._id, productId);
                if (data?.success) {
                    showSnackbar("Product added to wishlist!", "success");
                }
            }
        } catch (error) {
            // Revert on error
            setCurUser((prev) => {
                if (!prev) return prev;
                const currentList = Array.isArray(prev.wishlistedProducts) ? prev.wishlistedProducts : [];
                const revertedList = wasWishlisted
                    ? [...currentList, productId]
                    : currentList.filter(item => (typeof item === 'object' ? String(item._id) !== String(productId) : String(item) !== String(productId)));
                return { ...prev, wishlistedProducts: revertedList };
            });
            showSnackbar(error?.response?.data?.message || "Failed to update wishlist.", "error");
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <motion.div
            className="relative rounded-[16px] sm:rounded-[20px] overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 p-0 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Square Product Image: Flush with top and side edges with 0 border/margin/padding */}
            <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700/60 p-0 m-0 border-0 rounded-none transition-colors duration-300">
                {(!finalImage || finalImage === "null") ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-0 m-0 border-0">
                        <EmojiFoodBeverageIcon className="text-[#6C5CE7] text-2xl sm:text-4xl" />
                        <Link to={`/product-details/${slugify(name)}`}>
                            <span className="text-gray-500 dark:text-gray-300 text-[11px] sm:text-xs font-medium hover:text-[#6C5CE7]">
                                {name}
                            </span>
                        </Link>
                    </div>
                ) : (
                    <Link to={`/product-details/${slugify(name)}`} className="w-full h-full block p-0 m-0 border-0">
                        <img
                            src={finalImage}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getProductImage({ name });
                            }}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 block p-0 m-0 border-0"
                        />
                    </Link>
                )}

                {/* Floating Top-Right Wishlist Heart Circle Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleWishlist(id);
                    }}
                    disabled={wishlistLoading}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 border ${
                        isWishlisted
                            ? "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-[#FF385C] shadow-rose-500/20"
                            : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-white/80 dark:border-gray-700 text-gray-400 hover:text-[#FF385C] hover:bg-rose-50/60"
                    }`}
                >
                    {wishlistLoading ? (
                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-t-transparent border-[#FF385C] rounded-full animate-spin"></div>
                    ) : isWishlisted ? (
                        <FavoriteIcon className="text-[#FF385C] fill-current drop-shadow-[0_0_8px_rgba(255,56,92,0.75)] animate-pulse" sx={{ fontSize: { xs: "0.85rem", sm: "1.1rem" } }} />
                    ) : (
                        <FavoriteBorderIcon className="text-gray-400 hover:text-[#FF385C] transition-colors" sx={{ fontSize: { xs: "0.85rem", sm: "1.1rem" } }} />
                    )}
                </button>
            </div>

            {/* Bottom Content Container with compact spacing & internal padding */}
            <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5">
                <div>
                    {/* Category Badge: Upper-case bold category pill text */}
                    <div className="mb-1">
                        <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#6C5CE7] bg-[#6C5CE7]/10 dark:bg-[#6C5CE7]/20 px-2 py-0.5 rounded-full">
                            {type && type !== "Unknown" ? type : "ORGANIC DAIRY"}
                        </span>
                    </div>

                    {/* Title & Rating: Bold title link + star rating */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                        <Link
                            to={`/product-details/${slugify(name)}`}
                            className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white hover:text-[#6C5CE7] line-clamp-1 transition-colors leading-tight"
                        >
                            {name}
                        </Link>

                        <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                            <StarIcon sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }} className="text-amber-400" />
                            <span>{rating || "4.9"}</span>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Stock & Savings Info */}
                    <div className="flex items-center justify-between text-xs sm:text-xs mb-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                        {stock === 0 ? (
                            <span className="text-red-500 font-extrabold">Out of Stock</span>
                        ) : (
                            <span>Available: <strong className="text-slate-900 dark:text-white font-extrabold">{stock} {quantityUnit}</strong></span>
                        )}

                        {discountPercent > 0 && (
                            <span className="bg-[#FEF9C3] text-[#854D0E] font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full border border-[#FDE047]">
                                {discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* Footer Row: Bold price + Pill button [ Add ] */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-gray-200/90 dark:border-gray-700/60">
                        <div className="flex flex-col">
                            {discountPercent > 0 ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm sm:text-base font-black text-[#6C5CE7]">
                                        &#8377;{formatNumberWithCommas(discountedPrice)}
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold">
                                        &#8377;{formatNumberWithCommas(priceNumber)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                                    &#8377;{formatNumberWithCommas(priceNumber)}
                                </span>
                            )}
                        </div>

                        {existing ? (
                            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700/80 p-0.5 rounded-full border border-gray-200 dark:border-gray-600">
                                <Tooltip title="Decrease quantity" arrow placement="top">
                                    <button
                                        onClick={handleDecrementCart}
                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 text-red-500 font-bold shadow-xs hover:scale-105 cursor-pointer transition"
                                    >
                                        <RemoveIcon sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }} />
                                    </button>
                                </Tooltip>
                                <span className="w-4 sm:w-5 text-center text-xs sm:text-xs font-black text-slate-900 dark:text-white">
                                    {inCartQty}
                                </span>
                                <Tooltip title={inCartQty >= stock ? "No more stock" : "Increase quantity"} arrow placement="top">
                                    <button
                                        onClick={handleIncrementCart}
                                        disabled={inCartQty >= stock}
                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-[#6C5CE7] text-white font-bold shadow-xs hover:scale-105 disabled:opacity-50 cursor-pointer transition"
                                    >
                                        <AddIcon sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }} />
                                    </button>
                                </Tooltip>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddInitialToCart}
                                disabled={stock <= 0}
                                className="flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#4C1D95] hover:from-[#5b21b6] hover:to-[#3b0764] text-white text-xs sm:text-xs font-black shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <ShoppingCartIcon sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }} />
                                <span>Add</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

ProductVarietyCard.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    discount: PropTypes.number.isRequired,
    minQuantity: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
    stock: PropTypes.number,
    price: PropTypes.number.isRequired,
    likes: PropTypes.arrayOf(PropTypes.string),
    quantityUnit: PropTypes.string.isRequired,
    type: PropTypes.string,
};
