import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductContext } from "../../context/ProductProvider";
import { socket } from "../../socket/socket";
import ProductsList from "../../components/AdminComponents/InventoryComponents/ProductsList";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import {
  getExpiryStatusCounts,
  lowStockCount,
  outOfStockProducts,
  totalProducts,
} from "../../utils/InventoryHelpers/inventoryOverviewHelper";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay },
  }),
};

export default function ProductsPage() {
  const productCtx = useContext(ProductContext) || {};
  const products = productCtx.products || [];
  const productLoading = productCtx.productLoading ?? false;

  const [selectedFilter, setSelectedFilter] = useState("all");

  const safeProducts = Array.isArray(products) ? products : [];
  const { expiredCount, expiringSoonCount } = getExpiryStatusCounts(safeProducts);
  const lowStock = lowStockCount(safeProducts);
  const outOfStock = outOfStockProducts(safeProducts);

  useEffect(() => {
    if (!socket) return;
    socket.emit("admin:register-inventory-feed");
    return () => {
      socket.off("admin:register-inventory-feed");
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.05}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-sm"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E88E5] dark:text-blue-300">
              <ShoppingBagIcon sx={{ fontSize: "1.6rem" }} />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Products Dashboard
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 pl-11 hidden sm:block">
            Complete inventory catalog of all dairy products with live search, stock controls, and add/edit options.
          </p>
        </div>
      </motion.div>

      {/* Summary Metrics Bar - Compact 3-Column Grid on Mobile (< sm) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="grid grid-cols-3 gap-2 sm:gap-5 w-full"
      >
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "all"
              ? "bg-blue-100/90 dark:bg-blue-900/40 border-blue-400 ring-2 ring-[#1E88E5] shadow-md"
              : "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40 hover:border-blue-300"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-black text-[#64748B] dark:text-gray-400 uppercase tracking-wider truncate">Total Products</p>
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex sm:hidden items-center justify-center text-[#1E88E5] dark:text-blue-300 font-bold shrink-0 shadow-xs">
                <InventoryIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-3xl font-black text-[#1E88E5] dark:text-blue-300">{totalProducts(safeProducts)}</h3>
            <span className="text-[11px] font-semibold text-[#1E88E5] dark:text-blue-400 hidden sm:block pt-0.5">
              {selectedFilter === "all" ? "✓ Active Filter" : "Click to view all"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 hidden sm:flex items-center justify-center text-[#1E88E5] dark:text-blue-300 font-bold shrink-0 shadow-xs">
            <InventoryIcon sx={{ fontSize: "1.5rem" }} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("lowStock")}
          className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "lowStock"
              ? "bg-amber-100/90 dark:bg-amber-900/40 border-amber-400 ring-2 ring-[#FB8C00] shadow-md"
              : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/40 hover:border-amber-300"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-black text-[#64748B] dark:text-gray-400 uppercase tracking-wider truncate">Low Stock</p>
              <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex sm:hidden items-center justify-center text-[#FB8C00] dark:text-amber-400 font-bold shrink-0 shadow-xs">
                <WarningAmberIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-3xl font-black text-[#FB8C00] dark:text-amber-400">{lowStock}</h3>
            <span className="text-[11px] font-semibold text-[#FB8C00] dark:text-amber-400 hidden sm:block pt-0.5">
              {selectedFilter === "lowStock" ? "✓ Active Filter" : "Click to view low stock"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 hidden sm:flex items-center justify-center text-[#FB8C00] dark:text-amber-400 font-bold shrink-0 shadow-xs">
            <WarningAmberIcon sx={{ fontSize: "1.5rem" }} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("expiringSoon")}
          className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "expiringSoon"
              ? "bg-red-100/90 dark:bg-red-900/40 border-red-400 ring-2 ring-[#E53935] shadow-md"
              : "bg-red-50/90 dark:bg-red-950/40 border-red-200/80 dark:border-red-800/40 hover:border-red-300"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-black text-[#64748B] dark:text-gray-400 uppercase tracking-wider truncate">Expiring Soon</p>
              <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/60 flex sm:hidden items-center justify-center text-[#E53935] dark:text-red-400 font-bold shrink-0 shadow-xs">
                <HourglassEmptyIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-3xl font-black text-[#E53935] dark:text-red-400">{expiringSoonCount}</h3>
            <span className="text-[11px] font-semibold text-[#E53935] dark:text-red-400 hidden sm:block pt-0.5">
              {selectedFilter === "expiringSoon" ? "✓ Active Filter" : "Click to view expiring soon"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/60 hidden sm:flex items-center justify-center text-[#E53935] dark:text-red-400 font-bold shrink-0 shadow-xs">
            <HourglassEmptyIcon sx={{ fontSize: "1.5rem" }} />
          </div>
        </button>
      </motion.div>

      {/* Main Products List Table */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.15}
      >
        <ProductsList
          products={safeProducts}
          loading={productLoading}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          showProductsPageActions={true}
        />
      </motion.div>
    </div>
  );
}
