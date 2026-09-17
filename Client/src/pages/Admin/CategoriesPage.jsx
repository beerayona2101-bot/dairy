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
import BackButton from "../../components/Common/BackButton";

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
          <div className="flex items-center gap-3">
            <BackButton fallbackPath="/admin/dashboard" />
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#8C7CF0] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <CategoryIcon sx={{ fontSize: "1.6rem" }} />
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Categories Dashboard
              </h1>
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 pl-14 hidden sm:block">
            Manage all dairy categories, custom images, showcase descriptions, feature tags, and inline category products.
          </p>
        </div>

        <button
          onClick={() => setOpenAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8C7CF0] hover:bg-[#7b6be0] text-white font-extrabold text-xs md:text-sm shadow-md transition-all duration-200 cursor-pointer shrink-0"
        >
          <AddIcon sx={{ fontSize: "1.2rem" }} />
          <span>+ Add Category</span>
        </button>
      </motion.div>

      {/* Summary Metrics Bar */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="grid grid-cols-3 gap-2 sm:gap-4 w-full"
      >
        {/* 1. Total Categories Button */}
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "all"
              ? "bg-purple-100/90 dark:bg-purple-900/40 border-purple-300 ring-2 ring-[#8C7CF0] shadow-md"
              : "bg-white dark:bg-gray-800 border-purple-100 dark:border-gray-700 hover:border-purple-300 shadow-xs"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">Total Categories</p>
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/60 flex sm:hidden items-center justify-center text-[#8C7CF0] dark:text-purple-300 font-bold shrink-0 shadow-xs">
                <CategoryIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-2xl font-black text-[#8C7CF0] dark:text-purple-300">{totalCategoriesCount}</h3>
            <span className="text-[11px] font-semibold text-[#8C7CF0] dark:text-purple-400 hidden sm:block pt-0.5">
              {selectedFilter === "all" ? "✓ Viewing All Categories" : "Click to view all"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/60 hidden sm:flex items-center justify-center text-[#8C7CF0] dark:text-purple-300 font-bold shrink-0 shadow-xs">
            <CategoryIcon />
          </div>
        </button>

        {/* 2. Showcase Cards Button */}
        <button
          type="button"
          onClick={() => setSelectedFilter("showcase")}
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "showcase"
              ? "bg-purple-100/90 dark:bg-purple-900/40 border-purple-300 ring-2 ring-[#8C7CF0] shadow-md"
              : "bg-white dark:bg-gray-800 border-purple-100 dark:border-gray-700 hover:border-purple-300 shadow-xs"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">Showcase Cards</p>
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/60 flex sm:hidden items-center justify-center text-[#8C7CF0] dark:text-purple-300 font-bold shrink-0 shadow-xs">
                <ViewCarouselIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-2xl font-black text-[#8C7CF0] dark:text-purple-300">{showcaseCardsCount}</h3>
            <span className="text-[11px] font-semibold text-[#8C7CF0] dark:text-purple-400 hidden sm:block pt-0.5">
              {selectedFilter === "showcase" ? "✓ Viewing Showcase Cards" : "Click to filter showcase cards"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/60 hidden sm:flex items-center justify-center text-[#8C7CF0] dark:text-purple-300 font-bold shrink-0 shadow-xs">
            <ViewCarouselIcon />
          </div>
        </button>

        {/* 3. Catalog Products Button */}
        <button
          type="button"
          onClick={() => setSelectedFilter("products")}
          className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between ${
            selectedFilter === "products"
              ? "bg-purple-100/90 dark:bg-purple-900/40 border-purple-300 ring-2 ring-[#8C7CF0] shadow-md"
              : "bg-white dark:bg-gray-800 border-purple-100 dark:border-gray-700 hover:border-purple-300 shadow-xs"
          }`}
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
            <div className="flex items-center justify-between sm:block">
              <p className="text-[9px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">Catalog Products</p>
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/60 flex sm:hidden items-center justify-center text-[#8C7CF0] dark:text-purple-300 font-bold shrink-0 shadow-xs">
                <ShoppingBagIcon sx={{ fontSize: "1rem" }} />
              </div>
            </div>
            <h3 className="text-sm sm:text-2xl font-black text-[#8C7CF0] dark:text-purple-300">{safeProducts.length}</h3>
            <span className="text-[11px] font-semibold text-[#8C7CF0] dark:text-purple-400 hidden sm:block pt-0.5">
              {selectedFilter === "products" ? "✓ Viewing All Products Table" : "Click to view all products list"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/60 hidden sm:flex items-center justify-center text-[#8C7CF0] dark:text-purple-300 font-bold shrink-0 shadow-xs">
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
