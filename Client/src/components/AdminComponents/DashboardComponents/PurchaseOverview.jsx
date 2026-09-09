import { motion } from "framer-motion";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import UndoIcon from "@mui/icons-material/Undo";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Timer } from "lucide-react";
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
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function OrdersOverview({ totalOrdersRecieved, totalPendingOrders, countCanceledOrders, countDeliveredOrders, loading }) {
  const navigate = useNavigate();

  const purchaseOverviewData = [
    {
      name: "Total Orders Recieved",
      value: totalOrdersRecieved,
      icon: <ShoppingCartIcon className="text-[#1E88E5] dark:text-blue-400" />,
      bg: "bg-blue-50/90 hover:bg-blue-100/90 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 border-blue-200 dark:border-blue-800/40",
      route: "/admin/orders",
    },
    {
      name: "Total Delivered",
      value: countDeliveredOrders || 0,
      icon: <UndoIcon className="text-[#1E88E5] dark:text-sky-400" />,
      bg: "bg-sky-50/90 hover:bg-sky-100/90 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 border-sky-200 dark:border-sky-800/40",
      route: "/admin/orders",
    },
    {
      name: "Total Canceled",
      value: countCanceledOrders || 0,
      icon: <CancelIcon className="text-slate-600 dark:text-slate-300" />,
      bg: "bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-300 dark:border-slate-700",
      route: "/admin/orders",
    },
    {
      name: "Total Pending Orders",
      value: totalPendingOrders,
      icon: <Timer className="text-[#1565C0] dark:text-indigo-300" />,
      bg: "bg-indigo-50/90 hover:bg-indigo-100/90 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/40",
      route: "/admin/orders",
    },
  ];

  return (
    <motion.div
      className="bg-white dark:bg-gray-500/20 rounded-xl p-3.5 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700/50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Orders Overview</h2>
        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline-block">
          Click card to manage
        </span>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3"
        variants={containerVariants}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-500/10 animate-pulse"
            >
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))
          : purchaseOverviewData.map((item, index) => (
            <motion.button
              key={item.name || index}
              type="button"
              onClick={() => navigate(item.route)}
              variants={cardVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl border ${item.bg} cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md text-left group`}
            >
              <div className="flex items-center gap-2 truncate">
                <div className="text-sm sm:text-2xl shrink-0 p-1.5 sm:p-2 rounded-lg bg-white/70 dark:bg-black/20 backdrop-blur-xs">
                  {item.icon}
                </div>
                <div className="truncate">
                  <div className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 truncate">
                    {item.name.replace("Total ", "")}
                  </div>
                  <div className="text-sm sm:text-lg font-bold whitespace-nowrap text-gray-900 dark:text-white">
                    {item.value}
                  </div>
                </div>
              </div>
              <ArrowForwardIcon className="text-gray-400 dark:text-gray-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 !text-xs sm:!text-lg shrink-0 ms-0.5" />
            </motion.button>
          ))}
      </motion.div>
    </motion.div>
  );
}

OrdersOverview.propTypes = {
  totalOrdersRecieved: PropTypes.number.isRequired,
  totalPendingOrders: PropTypes.number.isRequired,
  countCanceledOrders: PropTypes.number.isRequired,
  countDeliveredOrders: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};
