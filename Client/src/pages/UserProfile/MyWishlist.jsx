import React, { useContext, useEffect, useState } from "react";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CartProvider";
import { ProductContext } from "../../context/ProductProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import { getWishlistedProducts, removeProductFromWishList, clearUserWishlist } from "../../services/userProfileService";
import { Link, useNavigate } from "react-router-dom";
import { getDiscountedPrice, getProductImage } from "../../utils/helper";
import { slugify } from "../../utils/slugify";
import { useSnackbar } from "notistack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getGuestWishlist, toggleGuestWishlist, clearGuestWishlist, setGuestWishlist } from "../../utils/guestWishlist";
import DiscountBadge from "../../components/Common/DiscountBadge";

export default function MyWishlist() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, setAuthUser, authUserLoading } = useContext(UserAuthContext);
  const { authAdmin, setAuthAdmin, authAdminLoading } = useContext(AdminAuthContext);
  const activeUser = authUser || authAdmin;
  const setCurUser = authUser ? setAuthUser : setAuthAdmin;
  const { addToCart } = useContext(CartContext);
  const { products } = useContext(ProductContext);

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    if (authUserLoading || authAdminLoading) return;

    const fetchWishlist = async () => {
      try {
        if (activeUser?._id) {
          const res = await getWishlistedProducts(activeUser._id);
          const validItems = res?.wishlistedProducts || [];
          setWishlist(validItems);
          const cleanIds = validItems.map((item) => item._id || item);
          setCurUser((prev) => {
            if (!prev) return prev;
            return { ...prev, wishlistedProducts: cleanIds };
          });
        } else {
          const guestIds = getGuestWishlist().map(String);
          if (Array.isArray(products) && products.length > 0) {
            const matched = products.filter((p) => guestIds.includes(String(p._id || p.id)));
            setWishlist(matched);
          } else if (guestIds.length > 0) {
            // Keep existing state while products load
          } else {
            setWishlist([]);
          }
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();

    const handleGuestUpdate = () => {
      if (!activeUser?._id) {
        const guestIds = getGuestWishlist().map(String);
        if (Array.isArray(products) && products.length > 0) {
          const matched = products.filter((p) => guestIds.includes(String(p._id || p.id)));
          setWishlist(matched);
        } else if (guestIds.length === 0) {
          setWishlist([]);
        }
      }
    };

    window.addEventListener("guestWishlistUpdated", handleGuestUpdate);
    return () => window.removeEventListener("guestWishlistUpdated", handleGuestUpdate);
  }, [activeUser?._id, authUserLoading, authAdminLoading, authUser, authAdmin, setCurUser, products]);

  const handleRemove = async (productId) => {
    if (deleteLoading) return;

    if (!activeUser?._id) {
      toggleGuestWishlist(productId);
      setWishlist((prev) => prev.filter((item) => String(item._id || item.id) !== String(productId)));
      enqueueSnackbar("Removed from wishlist", { variant: "success" });
      return;
    }

    try {
      setDeleteLoading(productId);
      const data = await removeProductFromWishList(activeUser._id, productId);
      if (data?.success) {
        setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
        enqueueSnackbar("Removed from wishlist", { variant: "success" });
        setCurUser((prev) => {
          if (!prev) return prev;
          const newList = (prev?.wishlistedProducts || []).filter(
            (id) => (typeof id === "string" ? id !== productId : id?._id !== productId)
          );
          return { ...prev, wishlistedProducts: newList };
        });
      }
    } catch {
      enqueueSnackbar("Failed to remove from wishlist", { variant: "error" });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleClearAll = async () => {
    if (wishlist.length === 0) return;
    if (!window.confirm("Are you sure you want to clear your entire wishlist?")) return;

    if (!activeUser?._id) {
      clearGuestWishlist();
      setWishlist([]);
      enqueueSnackbar("Wishlist cleared!", { variant: "success" });
      return;
    }

    try {
      setClearLoading(true);
      const res = await clearUserWishlist(activeUser._id);
      if (res?.success) {
        setWishlist([]);
        setCurUser((prev) => {
          if (!prev) return prev;
          return { ...prev, wishlistedProducts: [] };
        });
        enqueueSnackbar("Wishlist cleared!", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to clear wishlist", { variant: "error" });
    } finally {
      setClearLoading(false);
    }
  };

  const handleMoveToCart = (e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const targetId = product?._id || product?.id || (typeof product === 'string' ? product : null);
    if (!targetId) {
      enqueueSnackbar("Invalid product details", { variant: "error" });
      return;
    }

    const price = Number(product?.price) || 0;
    const discount = Number(product?.discount) || 0;
    const { discountedPrice } = getDiscountedPrice(price, discount);
    const qty = Number(product?.minQuantity) || 1;

    try {
      setMovingId(targetId);

      // 1. Add item to cart state immediately
      addToCart(targetId, qty, discountedPrice);

      // 2. Optimistically update local wishlist UI
      setWishlist((prev) => prev.filter((item) => {
        const itemId = item?._id || item?.id || item;
        return String(itemId) !== String(targetId);
      }));

      // 3. Sync wishlist cleanup in background (non-blocking)
      if (!activeUser?._id) {
        toggleGuestWishlist(targetId);
      } else {
        removeProductFromWishList(activeUser._id, targetId).catch((apiErr) => {
          console.warn("API remove from wishlist error:", apiErr);
        });

        setCurUser((prev) => {
          if (!prev) return prev;
          const newList = (prev?.wishlistedProducts || []).filter(
            (id) => (typeof id === "string" ? String(id) !== String(targetId) : String(id?._id || id?.id) !== String(targetId))
          );
          return { ...prev, wishlistedProducts: newList };
        });
      }

      enqueueSnackbar(`${product?.name || "Product"} moved to cart!`, { variant: "success" });

      // 4. Always redirect immediately to /cart
      navigate("/cart");
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to move item to cart.", { variant: "error" });
    } finally {
      setMovingId(null);
    }
  };

  const handleMoveAllToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (wishlist.length === 0) return;

    try {
      setClearLoading(true);
      let count = 0;
      for (const item of wishlist) {
        const targetId = item?._id || item?.id || (typeof item === 'string' ? item : null);
        if (!targetId) continue;
        const price = Number(item?.price) || 0;
        const discount = Number(item?.discount) || 0;
        const { discountedPrice } = getDiscountedPrice(price, discount);
        const qty = Number(item?.minQuantity) || 1;
        addToCart(targetId, qty, discountedPrice);
        count++;
      }

      // Optimistically clear local wishlist
      setWishlist([]);

      // Sync background cleanup
      if (!activeUser?._id) {
        clearGuestWishlist();
      } else {
        clearUserWishlist(activeUser._id).catch((apiErr) => {
          console.warn("API clear user wishlist error:", apiErr);
        });

        setCurUser((prev) => {
          if (!prev) return prev;
          return { ...prev, wishlistedProducts: [] };
        });
      }

      enqueueSnackbar(`Moved ${count} item(s) to your cart!`, { variant: "success" });

      // Always redirect immediately to /cart
      navigate("/cart");
    } catch (error) {
      enqueueSnackbar(error?.message || "Error moving items to cart.", { variant: "error" });
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-28 md:pb-12 flex-1 flex flex-col">
      {/* ── Unified Page Header (Mobile & Desktop) ── */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#075C2A] to-[#054593] text-white flex items-center justify-center shadow-xs shrink-0">
            <FavoriteIcon sx={{ fontSize: "1.25rem" }} />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-2xl text-slate-900 dark:text-white leading-tight">
              My Wishlist
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleMoveAllToCart}
              disabled={clearLoading}
              className="bg-gradient-to-r from-[#075C2A] to-[#054593] hover:from-[#5b4bd6] hover:to-[#4a43df] text-white text-xs font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              <ShoppingCartIcon sx={{ fontSize: "0.95rem" }} />
              <span className="hidden sm:inline">Move All to Cart</span>
              <span className="sm:hidden">Move All</span>
            </button>

            <button
              onClick={handleClearAll}
              disabled={clearLoading}
              className="bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-bold py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl transition cursor-pointer border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-200 active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {clearLoading ? "..." : "Clear"}
            </button>
          </div>
        )}
      </div>

      {/* ── Page Content (Loader / Empty / Cards Grid) ── */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="py-12 flex justify-center">
            <BuffaloLoader variant="inline" text="Loading your wishlist..." />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-md mx-auto my-6 sm:my-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F5E9D0] to-emerald-50 dark:from-emerald-950/60 dark:to-slate-800 text-[#0756B5] dark:text-emerald-400 flex items-center justify-center mb-4 shadow-xs">
              <FavoriteIcon sx={{ fontSize: "2rem" }} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1">
              Your wishlist is empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs font-medium leading-relaxed">
              Explore our fresh farm dairy products and tap the heart icon to save your favorites!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#075C2A] to-[#0756B5] hover:from-[#054593] hover:to-[#063B22] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-[#075C2A]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowForwardIcon sx={{ fontSize: "1.1rem" }} />
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {wishlist.map((product) => {
              const targetId = product?._id || product?.id;
              const { discountedPrice } = getDiscountedPrice(product?.price, product?.discount);
              const isMoving = movingId === targetId;
              const isDeleting = deleteLoading === targetId;
              const inStock = (product?.stock ?? 1) > 0;

              return (
                <li
                  key={targetId}
                  className="w-full rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* ── ROW 1: Image & Text in ONE Row ── */}
                  <div className="p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4 flex-1">
                    {/* Left: Product Image Box */}
                    <Link
                      to={`/product-details/${slugify(product?.name || "")}`}
                      className="relative w-22 h-22 sm:w-26 sm:h-26 shrink-0 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center p-2 group cursor-pointer"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product?.name || "Product"}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/natural_cow_milk.png";
                        }}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <DiscountBadge
                        discount={product?.discount}
                        isFloating={true}
                        size="sm"
                        containerClassName="top-1.5 left-1.5"
                      />
                    </Link>

                    {/* Right: Product Text & Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate mb-0.5">
                        {product?.category || "Dairy"} &bull; {product?.quantityUnit || "1 Unit"}
                      </p>

                      <Link
                        to={`/product-details/${slugify(product?.name || "")}`}
                        className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#054593] dark:hover:text-[#3F9E18] transition-colors line-clamp-2 leading-snug"
                      >
                        {product?.name || "Unnamed Product"}
                      </Link>

                      {/* Pricing & Stock Status */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[#054593] dark:text-[#3F9E18] font-black text-base sm:text-lg">
                          &#8377;{discountedPrice}
                        </span>
                        {product?.discount > 0 && (
                          <span className="text-xs line-through text-slate-400 font-medium">
                            &#8377;{product?.price}
                          </span>
                        )}
                        <span
                          className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold ${
                            inStock
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60"
                          }`}
                        >
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── ROW 2: Move to Cart and Remove Buttons at the Bottom of the Card ── */}
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-2.5 flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                    <button
                      onClick={(e) => handleMoveToCart(e, product)}
                      disabled={isMoving || !inStock}
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#075C2A] to-[#054593] hover:from-[#5b4bd6] hover:to-[#4a43df] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isMoving ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      ) : (
                        <ShoppingCartIcon sx={{ fontSize: "1.05rem" }} />
                      )}
                      <span>Move to Cart</span>
                    </button>

                    <button
                      onClick={() => handleRemove(targetId)}
                      disabled={isDeleting}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs sm:text-sm font-bold border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-200 dark:hover:border-rose-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                      title="Remove from wishlist"
                    >
                      {isDeleting ? (
                        <div className="w-3.5 h-3.5 border-2 border-t-transparent border-rose-500 rounded-full animate-spin" />
                      ) : (
                        <DeleteOutlineIcon sx={{ fontSize: "1.05rem" }} />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
