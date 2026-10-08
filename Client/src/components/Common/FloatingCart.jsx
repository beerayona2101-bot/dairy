import React, { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { CartContext } from "../../context/CartProvider";

/**
 * FloatingCart
 * Strictly displayed on Mobile App and Mobile Response viewports (< 768px).
 * Completely removed and unmounted on Web Response (desktop / tablet web viewports >= 768px).
 */
export default function FloatingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useContext(CartContext) || {};

  // Responsive screen state: Only mount on mobile viewports (< 768px)
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalItemsCount = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  }, [cartItems]);

  const hasItems = totalItemsCount > 0;

  // 1. HARD REMOVAL ON WEB RESPONSE:
  // If viewport width >= 768px, do not render into DOM at all.
  if (!isMobileViewport) {
    return null;
  }

  // 2. PATH EXCLUSIONS:
  const pathname = (location.pathname || "").toLowerCase();
  
  // Never show on Cart or Checkout pages (user is already viewing/completing cart) or Admin routes
  if (
    pathname.startsWith("/cart") ||
    pathname.startsWith("/order-checkout") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  // On Home or About/Contact pages, only show when there are active items in cart
  const isBrowsePage =
    pathname.startsWith("/products") || pathname.startsWith("/product-details");
  if (!isBrowsePage && !hasItems) {
    return null;
  }

  // 3. ADAPTIVE MOBILE POSITIONING:
  // On pages with the bottom navigation bar (height ~72px), float nicely above it.
  // On product-details (where bottom nav is hidden), float comfortably above bottom safe area.
  const isProductDetails = pathname.startsWith("/product-details");
  const bottomPositionClass = isProductDetails
    ? "bottom-[calc(22px+env(safe-area-inset-bottom,0px))]"
    : "bottom-[calc(84px+env(safe-area-inset-bottom,0px))]";

  return (
    <div
      className={`md:hidden fixed right-4 z-40 pointer-events-auto transition-all duration-300 ${bottomPositionClass}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <AnimatePresence mode="wait">
        {hasItems ? (
          /* CIRCULAR FLOATING CART BUTTON WITH NUMBER BADGE (ACTIVE) */
          <motion.button
            key="floating-cart-active"
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 15 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 450, damping: 24 }}
            onClick={() => navigate("/cart")}
            className="relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-[#075C2A] via-[#054593] to-[#0756B5] text-white shadow-[0_8px_25px_rgba(7,86,181,0.45)] active:shadow-[0_4px_15px_rgba(7,86,181,0.3)] border border-white/35 backdrop-blur-md cursor-pointer select-none"
            title={`View Cart (${totalItemsCount} items)`}
            aria-label={`View Cart (${totalItemsCount} items)`}
          >
            {/* Center Shopping Cart Icon */}
            <ShoppingCart className="w-5.5 h-5.5 text-white drop-shadow-sm" />

            {/* Item Counter Badge */}
            <motion.span
              key={totalItemsCount}
              initial={{ scale: 0.3 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -top-1 -right-1 bg-[#35A8E8] text-white text-[11px] font-black min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md leading-none"
            >
              {totalItemsCount > 99 ? "99+" : totalItemsCount}
            </motion.span>
          </motion.button>
        ) : (
          /* MINIMAL EMPTY FLOATING CART BUTTON (ON PRODUCTS BROWSING) */
          <motion.button
            key="floating-cart-empty"
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 15 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 450, damping: 24 }}
            onClick={() => navigate("/cart")}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/95 dark:bg-slate-800/95 text-[#0756B5] dark:text-blue-400 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:shadow-sm cursor-pointer select-none backdrop-blur-md"
            title="View Cart"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
