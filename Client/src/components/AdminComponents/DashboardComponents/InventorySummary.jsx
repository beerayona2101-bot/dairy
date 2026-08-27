import { motion } from "framer-motion";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// Animation Variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export default function InventorySummary({
  totalProducts,
  lowStockCount,
  outOfStockProducts,
  expiringSoonCount,
  loading,
}) {
  const navigate = useNavigate();

  const inventorySummaryData = [
    {
      name: "Total Stock Items",
      value: totalProducts,
      icon: <FormatListNumberedIcon className="text-[#1E88E5] dark:text-blue-400" />,
      bg: "bg-blue-50/90 hover:bg-blue-100/90 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 border-blue-200 dark:border-blue-800/40",
      route: "/admin/inventory",
    },
    {
      name: "Low Stock",
      value: lowStockCount,
      icon: <ReportProblemIcon className="text-[#1E88E5] dark:text-sky-400" />,
      bg:
        lowStockCount > 0
          ? "bg-sky-100/90 hover:bg-sky-200/90 dark:bg-sky-900/50 dark:hover:bg-sky-800/60 animate-pulse border-sky-300 dark:border-sky-700/60"
          : "bg-sky-50/90 hover:bg-sky-100/90 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 border-sky-200 dark:border-sky-800/40",
      route: "/admin/inventory",
    },
    {
      name: "Out of Stock",
      value: outOfStockProducts,
      icon: <ErrorOutlineIcon className="text-slate-700 dark:text-slate-300" />,
      bg:
        outOfStockProducts > 0
          ? "bg-slate-200/90 hover:bg-slate-300/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 animate-pulse border-slate-400 dark:border-slate-600"
          : "bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border-slate-300 dark:border-slate-700",
      route: "/admin/inventory",
    },
    {
      name: "Near Expiry",
      value: expiringSoonCount,
      icon: <AccessTimeIcon className="text-[#1565C0] dark:text-indigo-300" />,
      bg:
        expiringSoonCount > 0
          ? "bg-indigo-100/90 hover:bg-indigo-200/90 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 animate-pulse border-indigo-300 dark:border-indigo-700/60"
          : "bg-indigo-50/90 hover:bg-indigo-100/90 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/40",
      route: "/admin/inventory",
    },
  ];

  return (
    <motion.div
      className="bg-white dark:bg-gray-500/20 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Inventory Summary</h2>

      <motion.div
        className="flex flex-wrap sm:grid sm:grid-cols-2 gap-3 overflow-x-auto scrollbar-hide pb-2"
        variants={containerVariants}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-full sm:min-w-[220px] lg:min-w-0 flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-500/10 animate-pulse"
            >
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))
          : inventorySummaryData.map((item, index) => (
            <motion.button
              key={item.name || index}
              type="button"
              onClick={() => navigate(item.route)}
              variants={cardVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full sm:min-w-[220px] lg:min-w-0 flex items-center justify-between p-3 rounded-xl border ${item.bg} cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md text-left group`}
            >
              <div className="flex items-center gap-3 truncate">
                <div className="text-2xl shrink-0 p-2 rounded-lg bg-white/70 dark:bg-black/20 backdrop-blur-xs">
                  {item.icon}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 truncate">
                    {item.name}
                  </div>
                  <div className="text-lg font-bold whitespace-nowrap text-gray-900 dark:text-white">
                    {item.value}
                  </div>
                </div>
              </div>
              <ArrowForwardIcon className="text-gray-400 dark:text-gray-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 !text-lg shrink-0 ms-1" />
            </motion.button>
          ))}
      </motion.div>
    </motion.div>
  );
}

InventorySummary.propTypes = {
  totalProducts: PropTypes.number.isRequired,
  lowStockCount: PropTypes.number.isRequired,
  outOfStockProducts: PropTypes.number.isRequired,
  expiringSoonCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired
};
