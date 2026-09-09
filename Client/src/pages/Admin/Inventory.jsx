import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductContext } from "../../context/ProductProvider";
import { socket } from "../../socket/socket";
import OverallInventory from "../../components/AdminComponents/InventoryComponents/OverallInventory";
import ProductsList from "../../components/AdminComponents/InventoryComponents/ProductsList";
import {
  getExpiryStatusCounts,
  lowStockCount,
  outOfStockProducts,
  totalCategories,
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

export default function Inventory() {
  const productCtx = useContext(ProductContext) || {};
  const products = productCtx.products || [];
  const productLoading = productCtx.productLoading ?? false;

  const [selectedFilter, setSelectedFilter] = useState("all");

  const safeProducts = Array.isArray(products) ? products : [];
  const { expiredCount, expiringSoonCount } = getExpiryStatusCounts(safeProducts);

  // Register real-time Socket event listeners for instant live inventory updates
  useEffect(() => {
    if (!socket) return;

    socket.emit("admin:register-inventory-feed");

    return () => {
      socket.off("admin:register-inventory-feed");
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Overview Cards Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.05}
      >
        <OverallInventory
          totalCategories={totalCategories(safeProducts)}
          totalProducts={totalProducts(safeProducts)}
          lowStockCount={lowStockCount(safeProducts)}
          outOfStockProducts={outOfStockProducts(safeProducts)}
          expiringSoonCount={expiringSoonCount}
          expiredCount={expiredCount}
          loading={productLoading}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </motion.div>

      {/* Main Inventory Products Table Section */}
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
        />
      </motion.div>
    </div>
  );
}
