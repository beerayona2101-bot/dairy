import PropTypes from "prop-types";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BackButton from "../../Common/BackButton";

// Animation Variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function OverallInventory({
  totalCategories,
  totalProducts,
  lowStockCount,
  outOfStockProducts,
  expiringSoonCount,
  loading,
  selectedFilter = "all",
  onSelectFilter,
}) {

  const inventorySummaryData = [
    {
      id: "totalProducts",
      filterKey: "all",
      name: "Total Products",
      value: totalProducts,
      icon: <InventoryIcon className="text-[#6C5CE7] dark:text-purple-300" sx={{ fontSize: "1.3rem" }} />,
      bg: "bg-white dark:bg-gray-800",
      activeBorder: "border-2 border-[#6C5CE7] dark:border-purple-400 ring-2 ring-purple-100/50 shadow-md",
      iconBg: "bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800",
      textColor: "text-[#6C5CE7] dark:text-purple-300",
      emoji: "📦",
    },
    {
      id: "lowStock",
      filterKey: "lowStock",
      name: "Low Stock Products",
      value: lowStockCount,
      icon: <TrendingDownIcon className="text-[#6C5CE7] dark:text-purple-300" sx={{ fontSize: "1.3rem" }} />,
      bg: "bg-white dark:bg-gray-800",
      activeBorder: "border-2 border-[#6C5CE7] dark:border-purple-400 ring-2 ring-purple-100/50 shadow-md",
      iconBg: "bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800",
      textColor: "text-[#6C5CE7] dark:text-purple-300",
      emoji: "⚠️",
    },
    {
      id: "expiringSoon",
      filterKey: "expiringSoon",
      name: "Expiring Soon",
      value: expiringSoonCount,
      icon: <AccessTimeIcon className="text-gray-600 dark:text-gray-400" sx={{ fontSize: "1.3rem" }} />,
      bg: "bg-white dark:bg-gray-800",
      activeBorder: "border-2 border-[#6C5CE7] dark:border-purple-400 ring-2 ring-purple-100/50 shadow-md",
      iconBg: "bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600",
      textColor: "text-gray-900 dark:text-white",
      emoji: "⏰",
    },
  ];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800/80 rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700/80"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <BackButton fallbackPath="/admin/dashboard" />
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Inventory Overview
          </h2>
        </div>
        <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full hidden sm:inline-block">
          💡 Click card below to filter products
        </span>
      </div>

      <motion.div
        className="grid grid-cols-3 gap-2 sm:gap-5 w-full"
        variants={containerVariants}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-700/50 animate-pulse h-20 sm:h-28"
            />
          ))
          : inventorySummaryData.map((item, index) => {
            const isSelected = selectedFilter === item.filterKey || (selectedFilter === "all" && item.filterKey === "all");

            return (
              <motion.button
                key={item.id || index}
                type="button"
                onClick={() => {
                  if (onSelectFilter) {
                    onSelectFilter(item.filterKey);
                  }
                }}
                className={`w-full p-2.5 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between border select-none ${item.bg} ${
                  isSelected
                    ? item.activeBorder
                    : "border-gray-200/80 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                }`}
                variants={itemVariants}
                title={`Click to filter table by ${item.name}`}
              >
                <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1 w-full">
                  <div className="flex items-center justify-between sm:block">
                    <p className="text-[9px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                      {item.name.replace(" Products", "")}
                    </p>
                    <div className={`w-6 h-6 rounded-lg ${item.iconBg} flex sm:hidden items-center justify-center shrink-0 shadow-xs`}>
                      {item.icon}
                    </div>
                  </div>
                  <h3 className={`text-sm sm:text-3xl font-black ${item.textColor}`}>
                    {item.value}
                  </h3>
                  <span className="text-[9px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 hidden sm:block pt-0.5">
                    {isSelected ? "✓ Active Filter" : "Click to apply filter"}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${item.iconBg} hidden sm:flex items-center justify-center shrink-0 shadow-xs`}>
                  {item.icon}
                </div>
              </motion.button>
            );
          })}
      </motion.div>
    </motion.div>
  );
}

OverallInventory.propTypes = {
  totalCategories: PropTypes.number.isRequired,
  totalProducts: PropTypes.number.isRequired,
  lowStockCount: PropTypes.number.isRequired,
  outOfStockProducts: PropTypes.number.isRequired,
  expiringSoonCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  selectedFilter: PropTypes.string,
  onSelectFilter: PropTypes.func,
};
