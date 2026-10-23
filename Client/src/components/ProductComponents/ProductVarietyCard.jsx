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
import BoltIcon from "@mui/icons-material/Bolt";
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import { Tooltip } from "@mui/material";

import { slugify } from "../../utils/slugify";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CartProvider";
import { getDiscountedPrice, getProductImage, splitProductName, formatRating } from "../../utils/helper";
import { formatNumberWithCommas } from "../../utils/format";
import { addToWishlist, removeProductFromWishList } from "../../services/userProfileService";
import { useSnackbar } from 'notistack';
import { getGuestWishlist, toggleGuestWishlist } from "../../utils/guestWishlist";
import DiscountBadge from "../Common/DiscountBadge";

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
    const rawName = props.name || productObj.name || productObj.title || "Unnamed Product";
    let formattedName = typeof rawName === "string" ? rawName.replace(/^Madhu(r)?\s+/i, "Natural ") : String(rawName || "Unnamed Product");
    if (!formattedName.toLowerCase().startsWith("natural")) {
        formattedName = `Natural ${formattedName}`;
    }
    const name = formattedName;
    const image = props.image || productObj.image;
    const price = props.price ?? productObj.price ?? 0;
    const discount = props.discount ?? productObj.discount ?? 0;
    const stock = props.stock ?? productObj.stock ?? 10;
    const minQty = Number(props.minQuantity ?? productObj.minQuantity ?? 1) || 1;
    const minQuantity = minQty;
    const type = props.type || productObj.type || productObj.category || "Unknown";
    const rating = props.rating ?? productObj.rating ?? 4.9;
    const quantityUnit = props.quantityUnit || productObj.quantityUnit || "unit";
    const { mainTitle, variantInfo } = splitProductName(name);
    const displayRating = formatRating(rating);

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
        : (Array.isArray(guestWishlist) ? guestWishlist.map(String).includes(String(id)) : false);

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

    const handleBuyNow = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (stock <= 0) {
            showSnackbar("Stock not available!", "error");
            return;
        }
        if (!existing) {
            const qtyToAdd = localQty > 0 ? localQty : minQty;
            if (qtyToAdd > stock) {
                showSnackbar("Stock not available!", "error");
                return;
            }
            addToCart(id, qtyToAdd, discountedPrice);
        }
        if (!activeUser) {
            try {
                sessionStorage.setItem("redirectAfterLogin", "/order-checkout");
            } catch (_) {}
        }
        navigate("/order-checkout");
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

    const handleCardPointerEnter = (event) => {
        if (event.pointerType !== "mouse") return;
        event.currentTarget.parentElement.style.zIndex = "1";
        event.currentTarget.style.transform = "scale(1.025)";
    };

    const handleCardPointerLeave = (event) => {
        event.currentTarget.parentElement.style.zIndex = "";
        event.currentTarget.style.transform = "scale(1)";
    };

    return (
        <motion.div
            className="relative h-full flex flex-col"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                onPointerEnter={handleCardPointerEnter}
                onPointerLeave={handleCardPointerLeave}
                style={{
                    transform: "scale(1)",
                    transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                    willChange: "transform",
                }}
                className={`relative rounded-[18px] sm:rounded-[24px] overflow-hidden bg-white/95 dark:bg-slate-800/90 backdrop-blur-lg border border-blue-100/80 dark:border-slate-700/80 p-0 shadow-sm hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between h-full ${props.className || ""}`}
            >
            {/* Square Product Image: Flush with top and side edges with 0 border/margin/padding */}
            <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700/60 p-0 m-0 border-0 rounded-none transition-colors duration-300 shrink-0">
                {(!finalImage || finalImage === "null") ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-0 m-0 border-0">
                        <EmojiFoodBeverageIcon className="text-[#075C2A] text-2xl sm:text-4xl" />
                        <Link to={`/product-details/${slugify(name)}`}>
                            <span className={`${props.titleColor || "text-black dark:text-white"} text-[11px] sm:text-xs font-semibold hover:underline`}>
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
                            className="w-full h-full object-cover block p-0 m-0 border-0"
                        />
                    </Link>
                )}

                {/* Floating Top-Left Discount Tag Badge */}
                {discountPercent > 0 && (
                    <DiscountBadge
                        discount={discountPercent}
                        isFloating={true}
                        size="md"
                    />
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

            {/* Bottom Content Container with balanced padding & responsive flex */}
            <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5 min-w-0">
                <div className="min-w-0">
                    {/* Top Pill Row: Upper-case category pill + Star rating */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 min-w-0 max-w-[68%]">
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0756B5] dark:text-blue-400 truncate">
                                {type && type !== "Unknown" ? type : "ORGANIC DAIRY"}
                            </span>
                        </span>

                        <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 border border-amber-500/20">
                            <StarIcon sx={{ fontSize: "0.75rem" }} className="text-amber-500" />
                            <span>{displayRating}</span>
                        </div>
                    </div>

                    {/* Title: 2-Line clean font with black product name and distinct smaller variant tag */}
                    <div className="mb-1 min-h-[38px] sm:min-h-[42px] flex items-start min-w-0">
                        <Link
                            to={`/product-details/${slugify(name)}`}
                            className="text-xs sm:text-[13px] font-extrabold leading-snug line-clamp-2 hover:opacity-90 transition-opacity block min-w-0 text-black dark:text-white"
                            title={name}
                        >
                            <span className={props.titleColor || "text-black dark:text-white"}>
                                {mainTitle}
                            </span>
                            {variantInfo && (
                                <span className="text-[10px] sm:text-[11px] font-semibold text-black/75 dark:text-slate-400 ml-1">
                                    {variantInfo}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 min-w-0">
                        {stock === 0 ? (
                            <span className="text-red-500 font-extrabold">Out of Stock</span>
                        ) : (
                            <span className="truncate">
                                Available: <strong className="text-[#075C2A] dark:text-emerald-400 font-extrabold">{stock} {quantityUnit}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Section: Tier 1 Price Row + Tier 2 Action Buttons Row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2 min-w-0 mt-auto">
                    {/* Price Row: Discounted price + Strike price */}
                    <div className="flex items-baseline justify-between gap-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                            <span className={`text-sm sm:text-base font-black leading-none whitespace-nowrap ${props.priceColor || "text-[#0756B5] dark:text-blue-400"}`}>
                                &#8377;{formatNumberWithCommas(discountedPrice)}
                            </span>
                            {discountPercent > 0 && (
                                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through font-semibold leading-none whitespace-nowrap">
                                    &#8377;{formatNumberWithCommas(priceNumber)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons Row: 2-column balanced grid that NEVER overflows */}
                    <div className="grid grid-cols-2 gap-1.5 w-full items-center">
                        <button
                            onClick={handleBuyNow}
                            disabled={stock <= 0}
                            className="w-full flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl bg-gradient-to-r from-[#075C2A] to-[#063B22] hover:brightness-110 active:scale-95 text-white text-[11px] sm:text-xs font-black shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 min-w-0"
                            title="Buy Now - Direct Checkout"
                        >
                            <BoltIcon sx={{ fontSize: "0.85rem" }} className="shrink-0" />
                            <span className="truncate">Buy</span>
                        </button>

                        {existing ? (
                            <div className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-700/80 p-0.5 rounded-xl border border-gray-200 dark:border-gray-600 min-w-0">
                                <Tooltip title="Decrease quantity" arrow placement="top">
                                    <button
                                        onClick={handleDecrementCart}
                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 text-red-500 font-bold shadow-xs hover:scale-105 active:scale-95 cursor-pointer transition shrink-0"
                                    >
                                        <RemoveIcon sx={{ fontSize: "0.75rem" }} />
                                    </button>
                                </Tooltip>
                                <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white px-1 text-center truncate">
                                    {inCartQty}
                                </span>
                                <Tooltip title={inCartQty >= stock ? "No more stock" : "Increase quantity"} arrow placement="top">
                                    <button
                                        onClick={handleIncrementCart}
                                        disabled={inCartQty >= stock}
                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center bg-[#0756B5] text-white font-bold shadow-xs hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer transition shrink-0"
                                    >
                                        <AddIcon sx={{ fontSize: "0.75rem" }} />
                                    </button>
                                </Tooltip>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddInitialToCart}
                                disabled={stock <= 0}
                                className="w-full flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl bg-gradient-to-r from-[#0756B5] to-[#054593] hover:from-[#054593] hover:to-[#033470] text-white text-[11px] sm:text-xs font-black shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 min-w-0"
                                title="Add to Cart"
                            >
                                <ShoppingCartIcon sx={{ fontSize: "0.85rem" }} className="shrink-0" />
                                <span className="truncate">Add</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </motion.div>
    );
}

ProductVarietyCard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    image: PropTypes.any,
    discount: PropTypes.number,
    minQuantity: PropTypes.number,
    rating: PropTypes.number,
    stock: PropTypes.number,
    price: PropTypes.number,
    likes: PropTypes.arrayOf(PropTypes.string),
    quantityUnit: PropTypes.string,
    type: PropTypes.string,
    product: PropTypes.object,
    className: PropTypes.string,
};
