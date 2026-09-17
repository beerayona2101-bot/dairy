import React, { useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import CategoryIcon from "@mui/icons-material/Category";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { groupProductsByCategory } from "../../../utils/groupProductsByCategory";
import { getDiscountedPrice, getProductImage } from "../../../utils/helper";
import { formatNumberWithCommas } from "../../../utils/format";
import EditCategoryModal from "./Models/EditCategoryModal";
import UpdateProductModel from "./Models/UpdateProductModel";
import EditProductModel from "./Models/EditProductModel";
import RemoveModel from "./Models/RemoveProductModel";
import AddProductModel from "./Models/AddProductModel";
import { PageContentContext } from "../../../context/PageContentProvider";
import { updatePageContentService } from "../../../services/pageContentService";
import { socket } from "../../../socket/socket";
import { useSnackbar } from "notistack";
import { useModalBackNavigation } from "../../../hooks/useModalBackNavigation";

const fadeVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

export default function CategoryCardsGrid({
  products = [],
  filterMode = "all",
  onUpdateProduct,
  onEditProduct,
  onRemoveProduct,
  onCategoryChange,
  openAddCategoryModal,
  onCloseAddCategoryModal,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { pageContent, refreshPageContent, setPageContent } = useContext(PageContentContext) || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || null;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState(null);

  // Modals for Product actions when category is opened
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [openUpdateProductModal, setOpenUpdateProductModal] = useState(false);
  const [openEditProductModal, setOpenEditProductModal] = useState(false);
  const [openRemoveProductModal, setOpenRemoveProductModal] = useState(false);
  const [openAddProductModal, setOpenAddProductModal] = useState(false);

  useModalBackNavigation(modalOpen, () => handleCloseModal());

  React.useEffect(() => {
    if (openAddCategoryModal) {
      setEditingCategoryData(null);
      setModalOpen(true);
    }
  }, [openAddCategoryModal]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategoryData(null);
    if (onCloseAddCategoryModal) {
      onCloseAddCategoryModal();
    }
  };

  const handleSelectCategory = (cat) => {
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("category");
      setSearchParams(newParams);
    }
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  const grouped = groupProductsByCategory(products);
  const showcaseTitles = (pageContent?.landingShowcaseCards || []).map((c) => c.title).filter(Boolean);
  const homeTitles = (pageContent?.homeCategoryCards || []).map((c) => c.title).filter(Boolean);
  let categoriesList = Array.from(new Set([...Object.keys(grouped), ...showcaseTitles, ...homeTitles]));

  if (filterMode === "showcase") {
    categoriesList = categoriesList.filter((cat) =>
      (pageContent?.landingShowcaseCards || []).some(
        (c) => c.title?.toLowerCase() === cat?.toLowerCase()
      )
    );
  }

  // Toggle Showcase ON / OFF for Landing Page & Home Showcase Cards
  const handleToggleShowcase = async (e, categoryName) => {
    e.stopPropagation(); // prevent opening category product view

    const isCurrentlyInShowcase = (pageContent?.landingShowcaseCards || []).some(
      (c) => c.title?.toLowerCase() === categoryName?.toLowerCase()
    );

    let updatedLanding = [...(pageContent?.landingShowcaseCards || [])];
    let updatedHome = [...(pageContent?.homeCategoryCards || [])];

    if (isCurrentlyInShowcase) {
      // Turn OFF -> remove category from showcase
      updatedLanding = updatedLanding.filter((c) => c.title?.toLowerCase() !== categoryName?.toLowerCase());
      updatedHome = updatedHome.filter((c) => (c.title || c.name)?.toLowerCase() !== categoryName?.toLowerCase());
    } else {
      // Turn ON -> add category to showcase
      const items = grouped[categoryName] || [];
      const repImage = getProductImage(items[0]);
      const defaultCard = {
        title: categoryName,
        image: repImage || "/images/MADHU_milk.png",
        description: `Pure, fresh, high-quality ${categoryName} products delivered daily.`,
        features: ["100% Pure & Fresh", "Quality Guaranteed"],
      };
      updatedLanding.push(defaultCard);
      updatedHome.push(defaultCard);
    }

    const updatedPayload = {
      ...pageContent,
      landingShowcaseCards: updatedLanding,
      homeCategoryCards: updatedHome,
    };

    try {
      const res = await updatePageContentService(updatedPayload);
      if (res?.success) {
        const newContent = res.pageContent || updatedPayload;
        if (setPageContent) {
          setPageContent(newContent);
        }
        if (socket) {
          socket.emit("page-content:updated", { pageContent: newContent });
        }
        if (refreshPageContent) {
          refreshPageContent();
        }
        enqueueSnackbar(
          isCurrentlyInShowcase
            ? `"${categoryName}" hidden from Showcase & Home Page.`
            : `"${categoryName}" enabled on Showcase & Home Page!`,
          { variant: isCurrentlyInShowcase ? "info" : "success" }
        );
      }
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to update category showcase status", { variant: "error" });
    }
  };

  const handleDeleteCategory = async (e, categoryName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove the "${categoryName}" category?`)) return;

    try {
      let updatedLanding = (pageContent?.landingShowcaseCards || []).filter(
        (c) => c.title?.toLowerCase() !== categoryName?.toLowerCase()
      );
      let updatedHome = (pageContent?.homeCategoryCards || []).filter(
        (c) => c.title?.toLowerCase() !== categoryName?.toLowerCase()
      );

      const updatedPayload = {
        ...pageContent,
        landingShowcaseCards: updatedLanding,
        homeCategoryCards: updatedHome,
      };

      const res = await updatePageContentService(updatedPayload);
      if (res?.success) {
        const newContent = res.pageContent || updatedPayload;
        if (setPageContent) {
          setPageContent(newContent);
        }
        if (socket) {
          socket.emit("page-content:updated", { pageContent: newContent });
        }
        if (refreshPageContent) refreshPageContent();
        enqueueSnackbar(`Category "${categoryName}" removed successfully`, { variant: "success" });
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      enqueueSnackbar("Failed to delete category", { variant: "error" });
    }
  };

  // Handle Quick + / - Stock Increment & Decrement
  const handleStockChange = (e, product, delta) => {
    e.stopPropagation();
    const currentStock = Number(product.stock || 0);
    const newStock = Math.max(0, currentStock + delta);
    if (newStock === currentStock) return;

    const updatePayload = {
      _id: product._id,
      stock: newStock,
      price: product.price,
      thresholdVal: product.thresholdVal,
      discount: product.discount,
    };

    if (socket) {
      socket.emit("update-product", updatePayload);
    }

    enqueueSnackbar(
      `Stock for ${product.name} updated to ${newStock} ${product.quantityUnit || "Pack"}`,
      { variant: "success", autoHideDuration: 1500, preventDuplicate: true }
    );
  };

  const handleSaveCategory = async (updatedData) => {
    try {
      const currentShowcaseCards = Array.isArray(pageContent?.landingShowcaseCards)
        ? [...pageContent.landingShowcaseCards]
        : [];
      const currentHomeCards = Array.isArray(pageContent?.homeCategoryCards)
        ? [...pageContent.homeCategoryCards]
        : [];

      const existingIdx = currentShowcaseCards.findIndex(
        (c) =>
          c.title?.toLowerCase() === updatedData.originalTitle?.toLowerCase() ||
          c.title?.toLowerCase() === updatedData.title?.toLowerCase()
      );

      const newCardObj = {
        title: updatedData.title,
        description: updatedData.description,
        image: updatedData.image,
        features: updatedData.features,
      };

      if (existingIdx >= 0) {
        currentShowcaseCards[existingIdx] = newCardObj;
      } else {
        currentShowcaseCards.push(newCardObj);
      }

      const existingHomeIdx = currentHomeCards.findIndex(
        (c) =>
          c.title?.toLowerCase() === updatedData.originalTitle?.toLowerCase() ||
          c.title?.toLowerCase() === updatedData.title?.toLowerCase()
      );

      if (existingHomeIdx >= 0) {
        currentHomeCards[existingHomeIdx] = newCardObj;
      } else {
        currentHomeCards.push(newCardObj);
      }

      const updatedPayload = {
        ...pageContent,
        landingShowcaseCards: currentShowcaseCards,
        homeCategoryCards: currentHomeCards,
      };

      const res = await updatePageContentService(updatedPayload);
      if (res?.success) {
        if (socket) {
          socket.emit("page-content:updated", res.data);
        }
        if (refreshPageContent) {
          refreshPageContent();
        }
        enqueueSnackbar(`Category "${updatedData.title}" details saved successfully!`, {
          variant: "success",
        });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to save category showcase details", {
        variant: "error",
      });
    }
  };

  // If a category card was clicked, render FULL INLINE PRODUCT VIEW
  if (selectedCategory) {
    const categoryProducts = grouped[selectedCategory] || [];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="category-full-view"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-4 w-full"
        >
          {/* Header with Back Button, Category Title and Add Product Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-800/80 p-4 rounded-2xl border border-purple-100 dark:border-gray-700/80 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSelectCategory(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-gray-700 text-[#8C7CF0] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-gray-600 text-xs font-bold shadow-xs border border-purple-200 dark:border-gray-600 transition cursor-pointer"
              >
                <ArrowBackIcon sx={{ fontSize: "1rem" }} />
                <span>Back to All Categories</span>
              </button>

              <div className="h-5 w-px bg-purple-200 dark:bg-gray-600 hidden sm:block" />

              <div className="flex items-center gap-2">
                <CategoryIcon className="text-[#8C7CF0] dark:text-purple-300" />
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                  {selectedCategory} Category Products
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200">
                  {categoryProducts.length} {categoryProducts.length === 1 ? "Item" : "Items"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setOpenAddProductModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8C7CF0] hover:bg-[#7b6be0] text-white font-extrabold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <AddIcon sx={{ fontSize: "1.1rem" }} />
              <span>+ Add Product to {selectedCategory}</span>
            </button>
          </div>

          {/* Category Products Data Table */}
          <div className="overflow-x-auto rounded-2xl border border-purple-100 dark:border-gray-700/80 bg-white dark:bg-gray-800/90 shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-purple-50/50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold border-b border-purple-100 dark:border-gray-700 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 text-center whitespace-nowrap w-12">RANK</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">PRODUCT NAME</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">SELLING PRICE</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">REMAINING STOCK</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">CATEGORY</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">DISCOUNT</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">STOCK CONTROLS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100/60 dark:divide-gray-700/50">
                {categoryProducts.map((product, idx) => {
                  const rankNumber = idx + 1;
                  const isLowStock = Number(product?.stock || 0) < Number(product?.thresholdVal || 10);
                  const { discountedPrice } = getDiscountedPrice(product?.price || 0, product?.discount || 0);
                  const hasDiscount = product?.discount > 0;

                  const getRankBadge = (num) => {
                    if (num === 1) {
                      return (
                        <span className="w-7 h-7 rounded-full bg-[#8C7CF0] text-white font-black text-xs flex items-center justify-center shadow-xs border border-purple-300 mx-auto">
                          #1
                        </span>
                      );
                    }
                    return (
                      <span className="w-7 h-7 rounded-full bg-purple-50 dark:bg-gray-700 text-[#8C7CF0] dark:text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-200 dark:border-gray-600 mx-auto">
                        #{num}
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={product?._id || product?.name || `cat-table-row-${idx}`}
                      className="hover:bg-purple-50/40 dark:hover:bg-gray-700/30 transition-colors text-gray-800 dark:text-gray-200"
                    >
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getRankBadge(rankNumber)}
                      </td>

                      <td className="py-3.5 px-4 font-semibold flex items-center gap-3">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/madhu_cow_milk.png";
                          }}
                          className="w-10 h-10 object-cover rounded-xl border border-purple-100 dark:border-gray-700 shrink-0"
                        />
                        <span className="line-clamp-1 font-bold text-gray-900 dark:text-white">
                          {product.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 dark:text-white">
                            &#8377;{formatNumberWithCommas(discountedPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              &#8377;{formatNumberWithCommas(product?.price)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-2xs border ${
                          isLowStock
                            ? "bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 animate-pulse"
                            : "bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/60 dark:text-purple-300 border-purple-200"
                        }`}>
                          {product?.stock || 0} {product.quantityUnit || "Pack"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/40 dark:text-purple-300 font-bold text-xs border border-purple-200">
                          {product.category || selectedCategory}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {hasDiscount ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                            {product?.discount}% OFF
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setOpenUpdateProductModal(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-[#8C7CF0] rounded-xl transition cursor-pointer shadow-xs border border-purple-200"
                            title="Update Stock & Price"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setOpenEditProductModal(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-[#8C7CF0] rounded-xl transition cursor-pointer shadow-xs border border-purple-200"
                            title="Edit Product"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setOpenRemoveProductModal(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-gray-700 rounded-xl transition cursor-pointer shadow-xs border border-purple-200"
                            title="Delete Product"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Product Modals */}
          <UpdateProductModel
            open={openUpdateProductModal}
            onClose={() => setOpenUpdateProductModal(false)}
            selectedProduct={selectedProductForModal}
          />
          <EditProductModel
            open={openEditProductModal}
            onClose={() => setOpenEditProductModal(false)}
            selectedProduct={selectedProductForModal}
          />
          <RemoveModel
            open={openRemoveProductModal}
            onClose={() => setOpenRemoveProductModal(false)}
            selectedProduct={selectedProductForModal}
          />
          <AddProductModel
            open={openAddProductModal}
            onClose={() => setOpenAddProductModal(false)}
            initialCategory={selectedCategory}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // DEFAULT VIEW: Clean Category Image Cards Grid with Showcase ON / OFF Toggle
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="category-cards-grid"
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categoriesList.map((category) => {
            const items = grouped[category] || [];
            const repImage = getProductImage(items[0]);
            const showcaseCard = (pageContent?.landingShowcaseCards || []).find(
              (c) => c.title?.toLowerCase() === category?.toLowerCase()
            );
            const isCurrentlyInShowcase = Boolean(showcaseCard);

            return (
              <motion.div
                key={category}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectCategory(category)}
                className="bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200/80 dark:border-gray-700/80 cursor-pointer transition-all duration-300 relative group"
              >
                {/* Category Image Header Only */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={showcaseCard?.image || repImage || "/images/MADHU_milk.png"}
                    alt={category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  {/* Top Left: Showcase Cards ON / OFF Toggle Switch */}
                  <button
                    onClick={(e) => handleToggleShowcase(e, category)}
                    className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-sm border backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer z-10 ${
                      isCurrentlyInShowcase
                        ? "bg-purple-50/95 hover:bg-purple-100 text-[#8C7CF0] border-purple-200"
                        : "bg-white/90 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                    title={`Toggle ${category} visibility in Showcase Cards`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isCurrentlyInShowcase ? "bg-[#8C7CF0] animate-pulse" : "bg-gray-400"}`} />
                    <span>Showcase Cards: {isCurrentlyInShowcase ? "ON" : "OFF"}</span>
                  </button>

                  {/* Top Right: Edit & Delete Category Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategoryData({
                          category: category,
                          title: showcaseCard?.title || category,
                          image: showcaseCard?.image || repImage || "",
                          description: showcaseCard?.description || "",
                          features: showcaseCard?.features || [],
                        });
                        setModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-[#8C7CF0] shadow-sm border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                      title={`Edit ${category} category details`}
                    >
                      <EditIcon sx={{ fontSize: "0.85rem" }} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteCategory(e, category)}
                      className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-gray-700 shadow-sm border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                      title={`Delete ${category} category`}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: "0.85rem" }} />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Bottom Left: Category Name Overlay & Arrow Hint */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <h4 className="text-xl font-black text-white tracking-wide drop-shadow-md">
                      {category}
                    </h4>
                    <span className="text-[11px] font-bold text-purple-200 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>View Items</span>
                      <ArrowForwardIcon sx={{ fontSize: "0.85rem" }} />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Edit / Add Category Modal */}
        <EditCategoryModal
          open={modalOpen}
          onClose={handleCloseModal}
          categoryData={editingCategoryData}
          onSave={handleSaveCategory}
        />
      </motion.div>
    </AnimatePresence>
  );
}

CategoryCardsGrid.propTypes = {
  products: PropTypes.array.isRequired,
  onUpdateProduct: PropTypes.func,
  onEditProduct: PropTypes.func,
  onRemoveProduct: PropTypes.func,
  onCategoryChange: PropTypes.func,
  openAddCategoryModal: PropTypes.bool,
  onCloseAddCategoryModal: PropTypes.func,
};
