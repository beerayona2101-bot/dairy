import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Pagination } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { ThemeContext } from "../../../context/ThemeProvider";
import { getDiscountedPrice, getProductImage } from "../../../utils/helper";
import { formatNumberWithCommas } from "../../../utils/format";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function TopSellingStock({ topSellingStocks = [], loading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useContext(ThemeContext);
  const productsPerPage = 10;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = topSellingStocks?.slice(indexOfFirstProduct, indexOfLastProduct);

  const getRankBadge = (rankIndex) => {
    if (rankIndex === 0) return "bg-blue-100 text-[#1E88E5] border-blue-300 dark:bg-blue-950/60 dark:text-blue-300";
    if (rankIndex === 1) return "bg-sky-100 text-[#1E88E5] border-sky-300 dark:bg-sky-950/60 dark:text-sky-300";
    if (rankIndex === 2) return "bg-indigo-100 text-[#1565C0] border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-500/20 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 w-full space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <WorkspacePremiumIcon className="text-[#1E88E5]" />
            Top Selling Products Overview
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Full-width performance breakdown by total quantity sold, stock level, price & discount
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-[#1E88E5] dark:text-blue-300 text-xs px-3 py-1 rounded-full font-bold">
          <TrendingUpIcon sx={{ fontSize: "1rem" }} />
          <span>{topSellingStocks?.length || 0} Total Dairy Products</span>
        </div>
      </div>

      {topSellingStocks.length === 0 && !loading ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          No product sales data available currently.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700/60">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4 text-center">Total Quantity Sold</th>
                <th className="py-3.5 px-4 text-center">Stock Remaining</th>
                <th className="py-3.5 px-4 text-right">Current Price</th>
                <th className="py-3.5 px-4 text-center">Discount</th>
              </tr>
            </thead>

            <motion.tbody initial="hidden" animate="visible" variants={containerVariants}>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index * 0.69} className="animate-pulse border-b dark:border-gray-700">
                      <td className="py-3.5 px-4 text-center">
                        <div className="h-5 w-6 bg-gray-300 dark:bg-gray-600 rounded mx-auto" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 w-36 bg-gray-300 dark:bg-gray-600 rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mx-auto" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mx-auto" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded ml-auto" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto" />
                      </td>
                    </tr>
                  ))
                : currentProducts?.map((product, index) => {
                    const globalRank = indexOfFirstProduct + index;
                    const isLowStock = Number(product?.stock || 0) < Number(product?.thresholdVal || 10);
                    const { discountedPrice } = getDiscountedPrice(product?.price || 0, product?.discount || 0);
                    const hasDiscount = Number(product?.discount || 0) > 0;

                    return (
                      <motion.tr
                        key={product?._id || index}
                        variants={rowVariants}
                        className="text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block w-7 h-7 leading-7 text-xs font-bold rounded-full border ${getRankBadge(
                              globalRank
                            )}`}
                          >
                            #{globalRank + 1}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold flex items-center gap-3">
                          <img
                            src={getProductImage(product)}
                            alt={product?.name}
                            className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0"
                          />
                          <span className="line-clamp-1">{product?.name || "Unnamed Product"}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-gray-900 dark:text-white">
                          {formatNumberWithCommas(product?.totalQuantitySold || 0)} {product?.quantityUnit || "Pack"}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-0.5 rounded-full font-bold text-xs ${
                              isLowStock
                                ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 animate-pulse"
                                : "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                            }`}
                          >
                            {product?.stock || 0} {product?.quantityUnit || "Pack"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-extrabold text-[#1E88E5] dark:text-blue-400">
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
                          {hasDiscount ? (
                            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 font-bold text-xs">
                              {product?.discount}% OFF
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">No Offer</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
            </motion.tbody>
          </table>
        </div>
      )}

      {topSellingStocks?.length > productsPerPage && (
        <div className="pt-2 flex justify-center text-gray-800 dark:text-white">
          <Pagination
            count={Math.ceil(topSellingStocks?.length / productsPerPage)}
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
              },
              "& .Mui-selected": {
                backgroundColor: theme === "dark" ? "#1E88E5" : "#1E88E5",
                color: "#fff",
                borderColor: theme === "dark" ? "#1E88E5" : "#1E88E5",
              },
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

TopSellingStock.propTypes = {
  topSellingStocks: PropTypes.array,
  loading: PropTypes.bool,
};