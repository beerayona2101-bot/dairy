import React, { useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { CartContext } from "../../context/CartProvider";

export default function FloatingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useContext(CartContext) || {};

  // Exclude from Home page only
  if (location.pathname === "/" || location.pathname === "/home") {
    return null;
  }

  const totalItemsCount = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  }, [cartItems]);

  const hasItems = totalItemsCount > 0;

  return (
    <div className="fixed right-4 sm:right-6 lg:right-8 bottom-20 sm:bottom-22 lg:bottom-8 z-40 pointer-events-auto">
      <AnimatePresence mode="wait">
        {hasItems ? (
          /* CIRCULAR FLOATING CART BUTTON WITH NUMBER BADGE */
          <motion.button
            key="floating-cart-active"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => navigate("/cart")}
            className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#5B54F2] text-white shadow-[0_8px_25px_rgba(108,92,231,0.45)] hover:shadow-[0_12px_32px_rgba(108,92,231,0.65)] border border-white/30 dark:border-white/20 backdrop-blur-md cursor-pointer transition-shadow"
            title={`View Cart (${totalItemsCount} items)`}
            aria-label={`View Cart (${totalItemsCount} items)`}
          >
            {/* Center Shopping Cart Icon */}
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

            {/* Prominent Number Identification Badge */}
            <motion.span
              key={totalItemsCount}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -top-1 -right-1 bg-[#FF385C] text-white text-[11px] font-black min-w-[21px] h-[21px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md"
            >
              {totalItemsCount}
            </motion.span>
          </motion.button>
        ) : (
          /* MINIMAL EMPTY FLOATING CART BUTTON */
          <motion.button
            key="floating-cart-empty"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => navigate("/cart")}
            className="relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white dark:bg-[#1E293B] text-[#6C5CE7] dark:text-[#A78BFA] border border-slate-200/90 dark:border-slate-700/80 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_28px_rgba(108,92,231,0.35)] cursor-pointer transition-all"
            title="View Cart"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
