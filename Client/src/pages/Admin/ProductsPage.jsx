import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductContext } from "../../context/ProductProvider";
import { socket } from "../../socket/socket";
import ProductsList from "../../components/AdminComponents/InventoryComponents/ProductsList";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import {
  getExpiryStatusCounts,
  lowStockCount,
  outOfStockProducts,
  totalProducts,
} from "../../utils/InventoryHelpers/inventoryOverviewHelper";
import BackButton from "../../components/Common/BackButton";

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
  const { expiringSoonCount } = getExpiryStatusCounts(safeProducts);
  const lowStock = lowStockCount(safeProducts);

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
          <div className="flex items-center gap-3">
            <BackButton fallbackPath="/admin/dashboard" />
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-[#6C5CE7] dark:text-purple-300">
                <ShoppingBagIcon />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Products Management
              </h1>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pl-11">
            Manage your store items, stock levels, shelf life, and pricing.
          </p>
        </div>
      </motion.div>

      {/* KPI Filter Metric Cards */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "all"
              ? "bg-purple-100/90 dark:bg-purple-900/40 border-purple-400 ring-2 ring-[#6C5CE7] shadow-md"
              : "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40 hover:border-purple-300"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-black text-[#64748B] dark:text-gray-400 uppercase tracking-wider truncate">Total Products</p>
              <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex sm:hidden items-center justify-center text-[#6C5CE7] dark:text-purple-300 font-bold shrink-0 shadow-xs">
                <InventoryIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-3xl font-black text-[#6C5CE7] dark:text-purple-300">{totalProducts(safeProducts)}</h3>
            <span className="text-[11px] font-semibold text-[#6C5CE7] dark:text-purple-400 hidden sm:block pt-0.5">
              {selectedFilter === "all" ? "✓ Active Filter" : "Click to view all"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 hidden sm:flex items-center justify-center text-[#6C5CE7] dark:text-purple-300 font-bold shrink-0 shadow-xs">
            <InventoryIcon sx={{ fontSize: "1.5rem" }} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("lowStock")}
          className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "lowStock"
              ? "bg-purple-200/90 dark:bg-purple-800/40 border-purple-500 ring-2 ring-[#8B5CF6] shadow-md"
              : "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40 hover:border-purple-300"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-black text-[#64748B] dark:text-gray-400 uppercase tracking-wider truncate">Low Stock</p>
              <div className="w-6 h-6 rounded-lg bg-purple-200 dark:bg-purple-800/60 flex sm:hidden items-center justify-center text-[#8B5CF6] dark:text-purple-300 font-bold shrink-0 shadow-xs">
                <WarningAmberIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-3xl font-black text-[#8B5CF6] dark:text-purple-300">{lowStock}</h3>
            <span className="text-[11px] font-semibold text-[#8B5CF6] dark:text-purple-400 hidden sm:block pt-0.5">
              {selectedFilter === "lowStock" ? "✓ Active Filter" : "Click to view low stock"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-200 dark:bg-purple-800/60 hidden sm:flex items-center justify-center text-[#8B5CF6] dark:text-purple-300 font-bold shrink-0 shadow-xs">
            <WarningAmberIcon sx={{ fontSize: "1.5rem" }} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("expiringSoon")}
          className={`p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "expiringSoon"
              ? "bg-zinc-900 text-white border-zinc-700 ring-2 ring-zinc-500 shadow-md"
              : "bg-zinc-800/90 text-white border-zinc-700/80 hover:border-zinc-500"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-black text-zinc-300 uppercase tracking-wider truncate">Expiring Soon</p>
              <div className="w-6 h-6 rounded-lg bg-zinc-700 flex sm:hidden items-center justify-center text-purple-300 font-bold shrink-0 shadow-xs">
                <HourglassEmptyIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-3xl font-black text-white">{expiringSoonCount}</h3>
            <span className="text-[11px] font-semibold text-purple-300 hidden sm:block pt-0.5">
              {selectedFilter === "expiringSoon" ? "✓ Active Filter" : "Click to view expiring soon"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-700 hidden sm:flex items-center justify-center text-purple-300 font-bold shrink-0 shadow-xs">
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
