import PropTypes from "prop-types";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import { useContext, useState, useEffect } from "react";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { productLike } from "../../services/productServices";
import { addToWishlist, removeProductFromWishList } from "../../services/userProfileService";
import { useSnackbar } from 'notistack';
import { getProductImage } from "../../utils/helper";
import { getGuestWishlist, toggleGuestWishlist } from "../../utils/guestWishlist";

export default function RecommendedCard({ product }) {
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, setAuthUser, setOpenLoginDialog } = useContext(UserAuthContext);
  const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
  const activeUser = authUser || authAdmin;
  const setCurUser = authUser ? setAuthUser : setAuthAdmin;

  const { _id: id, name, image, description, rating = 4.5, likes = [] } = product || {};

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);
  const [guestWishlist, setGuestWishlist] = useState(getGuestWishlist);

  useEffect(() => {
    const updateGuest = () => setGuestWishlist(getGuestWishlist());
    window.addEventListener("guestWishlistUpdated", updateGuest);
    return () => window.removeEventListener("guestWishlistUpdated", updateGuest);
  }, []);

  const isWishlisted = activeUser?._id
    ? (Array.isArray(activeUser?.wishlistedProducts) && activeUser.wishlistedProducts.some(w => {
        if (!w) return false;
        const wId = typeof w === 'object' ? w._id || w.id : w;
        return String(wId) === String(id);
      }))
    : guestWishlist.map(String).includes(String(id));

  const handleToggleWishlist = async (productId) => {
    if (!productId) return;

    if (!activeUser?._id) {
      const { added } = toggleGuestWishlist(productId);
      enqueueSnackbar(added ? "Product added to wishlist!" : "Removed from wishlist!", { variant: added ? "success" : "info" });
      return;
    }

    if (wishlistLoading) return;

    const wasWishlisted = isWishlisted;
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
          enqueueSnackbar("Removed from wishlist!", { variant: "info" });
        }
      } else {
        const data = await addToWishlist(activeUser._id, productId);
        if (data?.success) {
          enqueueSnackbar("Product added to wishlist!", { variant: "success" });
        }
      }
    } catch (error) {
      setCurUser((prev) => {
        if (!prev) return prev;
        const currentList = Array.isArray(prev.wishlistedProducts) ? prev.wishlistedProducts : [];
        const revertedList = wasWishlisted
          ? [...currentList, productId]
          : currentList.filter(item => (typeof item === 'object' ? String(item._id) !== String(productId) : String(item) !== String(productId)));
        return { ...prev, wishlistedProducts: revertedList };
      });
      enqueueSnackbar(error?.response?.data?.message || "Failed to update wishlist.", { variant: "error" });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleLikeProduct = async (productId) => {
    if (!activeUser?._id) {
      enqueueSnackbar("Please log in to like products.", {variant: "error"});
      return;
    }

    if (localLikes.includes(activeUser._id)) {
      enqueueSnackbar("You already liked this product.", { variant: "info" });
      return;
    }

    setLikeLoading(true);

    try {
      const { message, updatedLikes } = await productLike(productId, activeUser._id);
      setLocalLikes(updatedLikes);
      enqueueSnackbar(message || "You liked the product!", {variant: "success"});
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to like product.", { variant: "error" });
    } finally {
      setLikeLoading(false);
    }
  };

  const finalImage = getProductImage({ name, image });

  return (
    <motion.div
      className="rounded-lg h-full overflow-hidden relative shadow-sm hover:shadow-md bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 transition-all duration-300 flex flex-col"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="relative h-28 sm:h-32 bg-gray-100 dark:bg-gray-800/50 transition-colors duration-300 shrink-0">
        {!finalImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <EmojiFoodBeverageIcon className="text-gray-400 dark:text-gray-300 text-3xl" />
            <Link to={`/product-details/${slugify(name)}`}>
              <span className="text-gray-500 dark:text-gray-300 text-xs font-medium hover:text-blue-500 line-clamp-1">
                {name}
              </span>
            </Link>
          </div>
        ) : (
          <Link to={`/product-details/${slugify(name)}`} className="w-full h-full block overflow-hidden">
            <img
              src={finalImage}
              alt={name}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/madhur_cow_milk.png";
              }}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        )}

        <button
          onClick={() => handleToggleWishlist(id)}
          disabled={wishlistLoading}
          className={`absolute top-1.5 right-1.5 rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 border ${
            isWishlisted
              ? "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-[#FF385C]"
              : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-white/80 dark:border-gray-700 text-gray-400 hover:text-[#FF385C]"
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlistLoading ? (
            <div className="w-3 h-3 border-2 border-t-transparent border-[#FF385C] rounded-full animate-spin"></div>
          ) : isWishlisted ? (
            <FavoriteIcon className="text-[#FF385C] fill-current drop-shadow-[0_0_6px_rgba(255,56,92,0.7)] animate-pulse" sx={{ fontSize: "1.05rem" }} />
          ) : (
            <FavoriteBorderIcon className="text-gray-400 hover:text-[#FF385C] transition-colors" sx={{ fontSize: "1.05rem" }} />
          )}
        </button>
      </div>

      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <Link
            to={`/product-details/${slugify(name)}`}
            className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white hover:text-[#1E88E5] dark:hover:text-pink-400 line-clamp-1 transition-colors block"
            title={name}
          >
            {name}
          </Link>

          <div className="flex items-center gap-3 my-1">
            <div className="flex items-center gap-1">
              <StarIcon className="text-[#FE8C00]" sx={{ fontSize: "0.9rem" }} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <FavoriteBorderIcon className="text-[#FE8C00]" sx={{ fontSize: "0.9rem" }} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{localLikes?.length || 0}</span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
            {description}
          </p>
        </div>

        <div className="pt-1.5 flex justify-end">
          <Link
            to={`/product-details/${slugify(name)}`}
            className="text-[11px] sm:text-xs border border-[#1E88E5] text-[#1E88E5] dark:border-pink-400 dark:text-pink-400 hover:bg-[#1E88E5] hover:text-white dark:hover:bg-pink-500 dark:hover:text-white px-2.5 py-0.5 rounded-full transition-colors font-medium"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

RecommendedCard.propTypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  likes: PropTypes.array,
  rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
