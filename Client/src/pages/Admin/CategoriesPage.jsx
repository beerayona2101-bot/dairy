import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductContext } from "../../context/ProductProvider";
import { socket } from "../../socket/socket";
import CategoryCardsGrid from "../../components/AdminComponents/InventoryComponents/CategoryCardsGrid";
import ProductsList from "../../components/AdminComponents/InventoryComponents/ProductsList";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { PageContentContext } from "../../context/PageContentProvider";
import { groupProductsByCategory } from "../../utils/groupProductsByCategory";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay },
  }),
};

export default function CategoriesPage() {
  const productCtx = useContext(ProductContext) || {};
  const products = productCtx.products || [];
  const { pageContent } = useContext(PageContentContext) || {};
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "showcase", "products"

  const safeProducts = Array.isArray(products) ? products : [];
  const grouped = groupProductsByCategory(safeProducts);
  const showcaseTitles = (pageContent?.landingShowcaseCards || []).map((c) => c.title).filter(Boolean);
  const homeTitles = (pageContent?.homeCategoryCards || []).map((c) => c.title).filter(Boolean);
  const totalCategoriesCount = Array.from(new Set([...Object.keys(grouped), ...showcaseTitles, ...homeTitles])).length;
  const showcaseCardsCount = (pageContent?.landingShowcaseCards || []).length || totalCategoriesCount;

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
              <CategoryIcon sx={{ fontSize: "1.6rem" }} />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#0F2742] dark:text-white tracking-tight">
              Categories Dashboard
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#64748B] dark:text-gray-400 pl-11">
            Manage all dairy categories, custom images, showcase descriptions, feature tags, and inline category products.
          </p>
        </div>

        <button
          onClick={() => setOpenAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-extrabold text-xs md:text-sm shadow-md transition-all duration-200 cursor-pointer shrink-0"
        >
          <AddIcon sx={{ fontSize: "1.2rem" }} />
          <span>+ Add Category</span>
        </button>
      </motion.div>

      {/* Summary Metrics Bar (Interactive Filters) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* 1. Total Categories Button */}
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between ${
            selectedFilter === "all"
              ? "bg-blue-100/90 dark:bg-blue-900/40 border-blue-400 ring-2 ring-[#1E88E5] shadow-md"
              : "bg-gradient-to-br from-blue-50/90 to-blue-100/40 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200/80 dark:border-blue-800/40 hover:border-blue-300"
          }`}
        >
          <div>
            <p className="text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Total Categories</p>
            <h3 className="text-2xl font-black text-[#1E88E5] dark:text-blue-300 mt-1">{totalCategoriesCount}</h3>
            <span className="text-[11px] font-semibold text-[#1E88E5] dark:text-blue-400 mt-0.5 inline-block">
              {selectedFilter === "all" ? "✓ Viewing All Categories" : "Click to view all"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-[#1E88E5] dark:text-blue-300 font-bold shrink-0">
            <CategoryIcon />
          </div>
        </button>

        {/* 2. Showcase Cards Button */}
        <button
          type="button"
          onClick={() => setSelectedFilter("showcase")}
          className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between ${
            selectedFilter === "showcase"
              ? "bg-cyan-100/90 dark:bg-cyan-900/40 border-cyan-400 ring-2 ring-[#00ACC1] shadow-md"
              : "bg-gradient-to-br from-cyan-50/90 to-cyan-100/40 dark:from-cyan-950/40 dark:to-cyan-900/20 border-cyan-200/80 dark:border-cyan-800/40 hover:border-cyan-300"
          }`}
        >
          <div>
            <p className="text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Showcase Cards</p>
            <h3 className="text-2xl font-black text-[#00ACC1] dark:text-cyan-300 mt-1">{showcaseCardsCount}</h3>
            <span className="text-[11px] font-semibold text-[#00ACC1] dark:text-cyan-400 mt-0.5 inline-block">
              {selectedFilter === "showcase" ? "✓ Viewing Showcase Cards" : "Click to filter showcase cards"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center text-[#00ACC1] dark:text-cyan-300 font-bold shrink-0">
            <ViewCarouselIcon />
          </div>
        </button>

        {/* 3. Catalog Products Button */}
        <button
          type="button"
          onClick={() => setSelectedFilter("products")}
          className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between ${
            selectedFilter === "products"
              ? "bg-green-100/90 dark:bg-green-900/40 border-green-400 ring-2 ring-[#43A047] shadow-md"
              : "bg-gradient-to-br from-green-50/90 to-green-100/40 dark:from-green-950/40 dark:to-green-900/20 border-green-200/80 dark:border-green-800/40 hover:border-green-300"
          }`}
        >
          <div>
            <p className="text-xs font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">Catalog Products</p>
            <h3 className="text-2xl font-black text-[#43A047] dark:text-green-300 mt-1">{safeProducts.length}</h3>
            <span className="text-[11px] font-semibold text-[#43A047] dark:text-green-400 mt-0.5 inline-block">
              {selectedFilter === "products" ? "✓ Viewing All Products Table" : "Click to view all products list"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/60 flex items-center justify-center text-[#43A047] dark:text-green-300 font-bold shrink-0">
            <ShoppingBagIcon />
          </div>
        </button>
      </motion.div>

      {/* Main Categories Grid / Products Table Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.15}
      >
        {selectedFilter === "products" ? (
          <ProductsList
            products={safeProducts}
            loading={false}
            showProductsPageActions={true}
          />
        ) : (
          <CategoryCardsGrid
            products={safeProducts}
            filterMode={selectedFilter}
            openAddCategoryModal={openAddModal}
            onCloseAddCategoryModal={() => setOpenAddModal(false)}
          />
        )}
      </motion.div>
    </div>
  );
}
