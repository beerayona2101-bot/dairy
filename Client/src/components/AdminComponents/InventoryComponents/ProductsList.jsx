import React, { useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import UpdateProductModel from './Models/UpdateProductModel';
import AddProductModel from "./Models/AddProductModel";
import EditProductModel from "./Models/EditProductModel";
import BuffaloLoader from "../../BuffaloLoader";
import RemoveModel from './Models/RemoveProductModel';
import { SidebarContext } from '../../../context/SidebarProvider';
import { FilterIcon, X, Plus, Edit2, RefreshCw, Trash2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Slide from '@mui/material/Slide';
import { ThemeContext } from '../../../context/ThemeProvider';
import {
  Pagination, Menu
} from "@mui/material";
import { searchProducts } from '../../../utils/filterData';
import { useDebounce } from 'use-debounce';
import { getDiscountedPrice, getProductImage } from '../../../utils/helper';
import { formatNumberWithCommas } from '../../../utils/format';
import { socket } from '../../../socket/socket';
import { useSnackbar } from 'notistack';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function ProductsList({ products, loading, selectedFilter = "all", setSelectedFilter, hideEditButton = false, showProductsPageActions = false }) {
  const { enqueueSnackbar } = useSnackbar();

  const sidebarCtx = useContext(SidebarContext) || {};
  const navbarInput = sidebarCtx.navbarInput || "";
  const highlightMatch = sidebarCtx.highlightMatch || ((text) => text);

  const themeCtx = useContext(ThemeContext) || {};
  const theme = themeCtx.theme || "light";

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);

  const handleStockChange = (e, product, delta) => {
    e.stopPropagation();
    const currentStock = Number(product?.stock || 0);
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
  const [initialCategory, setInitialCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openRemoveModel, setOpenRemoveModel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [productList, setProductList] = useState(products || []);
  const [filterType, setFilterType] = useState('Filter');
  const [currentPage, setCurrentPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [debouncedQuery] = useDebounce(navbarInput || "", 300);

  const productsPerPage = 7;

  useEffect(() => {
    setProductList(products || []);
  }, [products]);

  const filterOptions = [
    { label: "Price: Low to High", value: "priceLowToHigh" },
    { label: "Price: High to Low", value: "priceHighToLow" },
    { label: "Quantity: Low to High", value: "quantityLowToHigh" },
    { label: "Quantity: High to Low", value: "quantityHighToLow" },
    { label: "Sold: Low to High", value: "soldLowToHigh" },
    { label: "Sold: High to Low", value: "soldHighToLow" },
    { label: "Clear", value: "Filter" },
  ];

  const handleFilter = (type) => {
    setFilterType(type);

    if (type === 'Filter') {
      if (setSelectedFilter) setSelectedFilter('all');
      setProductList(products || []);
      setCurrentPage(1);
      return;
    }

    let sortedProducts = [...products];

    switch (type) {
      case 'priceLowToHigh':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'quantityLowToHigh':
        sortedProducts.sort((a, b) => a.stock - b.stock);
        break;
      case 'quantityHighToLow':
        sortedProducts = sortedProducts.sort((a, b) => b.stock - a.stock);
        break;
      case 'outOfStock':
        sortedProducts = sortedProducts.filter((p) => p.stock === 0);
        break;
      case 'lowStock':
        sortedProducts = sortedProducts.filter((p) => p?.stock < p?.thresholdVal);
        break;
      case 'soldLowToHigh':
        sortedProducts.sort((a, b) => (a.totalQuantitySold || 0) - (b.totalQuantitySold || 0));
        break;
      case 'soldHighToLow':
        sortedProducts.sort((a, b) => (b.totalQuantitySold || 0) - (a.totalQuantitySold || 0));
        break;
      default:
        sortedProducts = products;
    }

    setProductList(sortedProducts);
    setCurrentPage(1);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setCurrentPage(1);
    setActiveCategory(null);
  }, [selectedFilter, filterType]);

  const filteredProducts = useMemo(() => {
    let list = [...(productList || [])];

    // Apply Card Filter
    if (selectedFilter === 'lowStock') {
      list = list.filter((p) => Number(p?.stock) < Number(p?.thresholdVal));
    } else if (selectedFilter === 'outOfStock') {
      list = list.filter((p) => Number(p?.stock) === 0);
    } else if (selectedFilter === 'expiringSoon') {
      const now = new Date();
      list = list.filter((p) => {
        const hoursDiff = (now - new Date(p.createdAt)) / (1000 * 60 * 60);
        return hoursDiff >= 48;
      });
    }

    return searchProducts(list, debouncedQuery);
  }, [productList, selectedFilter, debouncedQuery]);

  let content;
  if (loading) {
    content = <BuffaloLoader variant="inline" text="Loading products..." />;
  } else if (!filteredProducts || filteredProducts?.length === 0) {
    content = (
      <div className="text-center text-gray-500 dark:text-gray-300 py-6">
        No products found matching the selected filter.
      </div>
    );
  } else {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts?.slice(indexOfFirstProduct, indexOfLastProduct);

    content = (
      <>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] bg-gray-50/80 dark:bg-gray-800">
                <th className="py-3 px-3.5 text-center whitespace-nowrap w-12">RANK</th>
                <th className="py-3 px-3.5 whitespace-nowrap">PRODUCT NAME</th>
                <th className="py-3 px-3.5 whitespace-nowrap">SELLING PRICE</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">STOCK</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">CATEGORY</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">DISCOUNT</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">ACTIONS</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentProducts?.map((product, index) => {
                const rankNumber = indexOfFirstProduct + index + 1;
                const isLowStock = Number(product?.stock || 0) < Number(product?.thresholdVal || 10);
                const { discountedPrice } = getDiscountedPrice(product?.price || 0, product?.discount || 0);
                const hasDiscount = product?.discount > 0;

                const getRankBadge = (num) => {
                  if (num === 1) {
                    return (
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-200 to-yellow-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs border border-amber-300 mx-auto">
                        #1
                      </span>
                    );
                  }
                  if (num === 2) {
                    return (
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-gray-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs border border-slate-300 mx-auto">
                        #2
                      </span>
                    );
                  }
                  if (num === 3) {
                    return (
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-200 to-amber-300 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs border border-orange-300 mx-auto">
                        #3
                      </span>
                    );
                  }
                  return (
                    <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 text-[#1E88E5] dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-gray-600 mx-auto">
                      #{num}
                    </span>
                  );
                };

                return (
                  <motion.tr
                    key={product?._id ? `prod-${product._id}-${index}` : `prod-index-${index}`}
                    variants={rowVariants}
                    className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {getRankBadge(rankNumber)}
                    </td>
                    <td className="py-3 px-3.5 font-semibold flex items-center gap-3">
                      <img
                        src={getProductImage(product)}
                        alt={product?.name}
                        className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0"
                      />
                      <span className="font-bold text-gray-900 dark:text-white">
                        {highlightMatch(product?.name, navbarInput)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-green-700 dark:text-green-400">
                          &#8377;{formatNumberWithCommas(discountedPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            &#8377;{formatNumberWithCommas(product?.price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      {Number(product?.stock || 0) === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {product?.stock} {product?.quantityUnit || "Units"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {product?.stock} {product?.quantityUnit || "Units"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1E88E5] dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200">
                        {highlightMatch(product?.category, navbarInput)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      {hasDiscount ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-300">
                          {product?.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-center">
                      {showProductsPageActions ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setOpenEditModal(true);
                            }}
                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-[#1E88E5] dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                            title="Edit product details (Name, Category, Image, Price...)"
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setOpenUpdateModal(true);
                            }}
                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                            title="Update Stock & Expiry data"
                          >
                            <RefreshCw size={13} /> Update
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setOpenRemoveModel(true);
                            }}
                            className="flex items-center gap-1 text-xs font-bold p-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition cursor-pointer"
                            title="Remove product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 mx-auto">
                          <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 shadow-xs">
                            <button
                              onClick={(e) => handleStockChange(e, product, -1)}
                              className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900 text-red-600 dark:text-red-300 font-black text-sm flex items-center justify-center transition cursor-pointer"
                              title="Remove stock (-1)"
                            >
                              -
                            </button>
                            <span className="px-2 font-black text-xs text-gray-900 dark:text-white min-w-8 text-center">
                              {product?.stock}
                            </span>
                            <button
                              onClick={(e) => handleStockChange(e, product, 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-300 font-black text-sm flex items-center justify-center transition cursor-pointer"
                              title="Add stock (+1)"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>

        <div className="p-4 mt-2 flex justify-center text-gray-800 dark:text-white">
          <Pagination
            count={Math.ceil(filteredProducts?.length / productsPerPage)}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            variant="outlined"
            shape="rounded"
            siblingCount={1}
            boundaryCount={0}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "inherit",
                transition: "all 0.2s ease",
                "&:hover": {
                  border: "2px solid #1E88E5",
                },
                "& .Mui-selected": {
                  backgroundColor: `${theme === "dark" ? "#1E88E5" : "#fff"}`,
                  color: `${theme === "light" ? "#1E88E5" : "#fff"}`,
                  borderColor: "#1E88E5",
                  "&:hover": {
                    backgroundColor: "#6e305e",
                  },
                },
              },
            }}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-500/20 rounded p-4 md:p-6 shadow-md w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Products
            </h2>
            {selectedFilter &&
              selectedFilter !== "all" &&
              selectedFilter !== "totalProducts" && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-950/40 text-[#1E88E5] dark:text-blue-300 rounded-full text-xs font-semibold shadow-xs">
                  <span>
                    Filtered by: {
                      selectedFilter === "lowStock" ? "Low Stock Products" :
                      selectedFilter === "outOfStock" ? "Out of Stock" :
                      selectedFilter === "expiringSoon" ? "Expiring Soon" : selectedFilter
                    }
                  </span>
                  {setSelectedFilter && (
                    <button
                      onClick={() => setSelectedFilter("all")}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800/50 p-0.5 rounded-full cursor-pointer transition ml-1"
                      title="Clear filter"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}
          </div>

          <button
            onClick={() => {
              setInitialCategory(activeCategory || "");
              setOpenAddModal(true);
            }}
            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {content}
      </div>

      <AddProductModel open={openAddModal} onClose={() => setOpenAddModal(false)} initialCategory={initialCategory} />
      <UpdateProductModel open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} selectedProduct={selectedProduct} />
      <EditProductModel open={openEditModal} onClose={() => setOpenEditModal(false)} selectedProduct={selectedProduct} />
      <RemoveModel open={openRemoveModel} onClose={() => setOpenRemoveModel(false)} selectedProduct={selectedProduct} />
    </>
  )
}

ProductsList.propTypes = {
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  selectedFilter: PropTypes.string,
  setSelectedFilter: PropTypes.func,
};
