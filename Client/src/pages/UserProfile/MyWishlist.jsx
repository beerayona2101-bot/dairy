import React, { useContext, useEffect, useState } from "react";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CartProvider";
import { ProductContext } from "../../context/ProductProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import { getWishlistedProducts, removeProductFromWishList, clearUserWishlist } from "../../services/userProfileService";
import { Link } from "react-router-dom";
import { getDiscountedPrice, getProductImage } from "../../utils/helper";
import { slugify } from "../../utils/slugify";
import { useSnackbar } from "notistack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getGuestWishlist, toggleGuestWishlist, clearGuestWishlist } from "../../utils/guestWishlist";

export default function MyWishlist() {
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, setAuthUser } = useContext(UserAuthContext);
  const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
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
    const fetchWishlist = async () => {
      try {
        if (activeUser?._id) {
          const res = await getWishlistedProducts(activeUser._id);
          const validItems = res?.wishlistedProducts || [];
          setWishlist(validItems);
          const cleanIds = validItems.map((item) => item._id || item);
          setCurUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, wishlistedProducts: cleanIds };
            if (authUser) localStorage.setItem("User", JSON.stringify(updated));
            if (authAdmin) localStorage.setItem("Admin", JSON.stringify(updated));
            return updated;
          });
        } else {
          const guestIds = getGuestWishlist().map(String);
          if (Array.isArray(products) && products.length > 0) {
            const matched = products.filter((p) => guestIds.includes(String(p._id)));
            setWishlist(matched);
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
  }, [activeUser?._id, authUser, authAdmin, setCurUser, products]);

  const handleRemove = async (productId) => {
    if (deleteLoading) return;

    if (!activeUser?._id) {
      toggleGuestWishlist(productId);
      setWishlist((prev) => prev.filter((item) => String(item._id) !== String(productId)));
      enqueueSnackbar("Removed from wishlist", { variant: "success" });
      return;
    }

    try {
      setDeleteLoading(productId);
      const data = await removeProductFromWishList(activeUser._id, productId);
      if (data?.success) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        enqueueSnackbar("Removed from wishlist", { variant: "success" });
        setCurUser((prev) => {
          if (!prev) return prev;
          const newList = (prev?.wishlistedProducts || []).filter(
            (id) => (typeof id === "string" ? id !== productId : id?._id !== productId)
          );
          const updated = { ...prev, wishlistedProducts: newList };
          if (authUser) localStorage.setItem("User", JSON.stringify(updated));
          if (authAdmin) localStorage.setItem("Admin", JSON.stringify(updated));
          return updated;
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
          const updated = { ...prev, wishlistedProducts: [] };
          if (authUser) localStorage.setItem("User", JSON.stringify(updated));
          if (authAdmin) localStorage.setItem("Admin", JSON.stringify(updated));
          return updated;
        });
        enqueueSnackbar("Wishlist cleared!", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to clear wishlist", { variant: "error" });
    } finally {
      setClearLoading(false);
    }
  };

  const handleMoveToCart = async (product) => {
    if (!product?._id) return;
    const { discountedPrice } = getDiscountedPrice(product?.price, product?.discount);

    try {
      setMovingId(product._id);
      addToCart(product._id, product?.minQuantity || 1, discountedPrice);
      
      if (!activeUser?._id) {
        toggleGuestWishlist(product._id);
        setWishlist((prev) => prev.filter((item) => String(item._id) !== String(product._id)));
      } else {
        await removeProductFromWishList(activeUser._id, product._id);
        setWishlist((prev) => prev.filter((item) => item._id !== product._id));
        setCurUser((prev) => {
          if (!prev) return prev;
          const newList = (prev?.wishlistedProducts || []).filter(
            (id) => (typeof id === "string" ? id !== product._id : id?._id !== product._id)
          );
          const updated = { ...prev, wishlistedProducts: newList };
          if (authUser) localStorage.setItem("User", JSON.stringify(updated));
          if (authAdmin) localStorage.setItem("Admin", JSON.stringify(updated));
          return updated;
        });
      }

      enqueueSnackbar(`${product?.name || "Product"} moved to cart!`, { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to move item to cart.", { variant: "error" });
    } finally {
      setMovingId(null);
    }
  };

  const handleMoveAllToCart = async () => {
    if (wishlist.length === 0) return;

    try {
      setClearLoading(true);
      let count = 0;
      for (const item of wishlist) {
        const { discountedPrice } = getDiscountedPrice(item?.price, item?.discount);
        addToCart(item._id, item?.minQuantity || 1, discountedPrice);
        count++;
      }
      await clearUserWishlist(activeUser._id);
      setWishlist([]);
      setCurUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, wishlistedProducts: [] };
        if (authUser) localStorage.setItem("User", JSON.stringify(updated));
        if (authAdmin) localStorage.setItem("Admin", JSON.stringify(updated));
        return updated;
      });
      enqueueSnackbar(`Moved ${count} item(s) to your cart!`, { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Error moving items to cart.", { variant: "error" });
    } finally {
      setClearLoading(false);
    }
  };

  let content;

  if (loading) {
    content = <BuffaloLoader variant="inline" text="Loading your wishlist..." />;
  } else if (wishlist.length === 0) {
    content = (
      <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FavoriteIcon sx={{ fontSize: "2rem" }} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Your wishlist is empty</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Explore our fresh dairy products and click the heart icon to save your favorites for later!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow transition"
        >
          <span>Explore Products</span>
          <ArrowForwardIcon sx={{ fontSize: "1.1rem" }} />
        </Link>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        <ul className="space-y-3">
          {wishlist.map((product) => {
            const { discountedPrice } = getDiscountedPrice(product?.price, product?.discount);
            const isMoving = movingId === product._id;
            const isDeleting = deleteLoading === product._id;

            return (
              <li
                key={product?._id}
                className="w-full rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-xs overflow-hidden transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                  <div className="w-full sm:w-28 h-32 sm:h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-700 overflow-hidden flex justify-center items-center relative">
                    <img
                      src={getProductImage(product)}
                      alt={product?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                    {product?.discount > 0 && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-3">
                    <div className="space-y-1">
                      <Link
                        to={`/product-details/${slugify(product?.name)}`}
                        className="font-bold text-gray-800 dark:text-white hover:text-[#1E88E5] transition line-clamp-1 text-base"
                      >
                        {product?.name || "Unnamed Product"}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Category: {product?.category || "General"} &bull; Unit: {product?.quantityUnit || "Unit"}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[#1E88E5] dark:text-blue-400 font-bold text-base">
                          &#8377;{discountedPrice}
                        </span>
                        {product?.discount > 0 && (
                          <span className="text-xs line-through text-gray-400">
                            &#8377;{product?.price}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          (product?.stock ?? 1) > 0 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" 
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }`}>
                          {(product?.stock ?? 1) > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={isMoving || (product?.stock ?? 1) <= 0}
                        className="flex items-center gap-1.5 bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isMoving ? (
                          <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : (
                          <ShoppingCartIcon sx={{ fontSize: "1rem" }} />
                        )}
                        <span>Move to Cart</span>
                      </button>

                      <button
                        onClick={() => handleRemove(product?._id)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer"
                      >
                        {isDeleting ? (
                          <div className="w-3.5 h-3.5 border-2 border-t-transparent border-red-600 rounded-full animate-spin" />
                        ) : (
                          "Remove"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 pb-4 mb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
            <span>My Wishlist</span>
            {wishlist.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 font-bold px-2.5 py-0.5 rounded-full">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your saved favorite items and move them to cart anytime.
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleMoveAllToCart}
              disabled={clearLoading}
              className="bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <ShoppingCartIcon sx={{ fontSize: "0.95rem" }} />
              <span>Move All to Cart</span>
            </button>

            <button
              onClick={handleClearAll}
              disabled={clearLoading}
              className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {clearLoading ? "Clearing..." : "Clear Wishlist"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        {content}
      </div>
    </div>
  );
}