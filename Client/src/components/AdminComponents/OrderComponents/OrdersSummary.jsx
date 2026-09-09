import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UndoIcon from "@mui/icons-material/Undo";
import CancelIcon from "@mui/icons-material/Cancel";
import EditNoteIcon from "@mui/icons-material/EditNote";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function OrdersSummary({
  totalOrders,
  totalRecievedOrders,
  totalCanceledOrders,
  handleStatusFilter,
}) {
  const orderSummaryData = [
    {
      name: "Pending Orders",
      value: totalOrders,
      icon: <ShoppingCartIcon sx={{ fontSize: "1.3rem" }} className="text-[#1E88E5] dark:text-blue-400" />,
      bg: "bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 text-[#1E88E5] dark:text-white",
      status: "Pending",
    },
    {
      name: "Total Orders Recieved",
      value: totalRecievedOrders,
      icon: <CheckCircleIcon sx={{ fontSize: "1.3rem" }} className="text-[#1E88E5] dark:text-sky-400" />,
      bg: "bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/40 text-[#1E88E5] dark:text-white",
      status: "All",
    },
    {
      name: "Total Returned Orders",
      value: 0,
      icon: <UndoIcon sx={{ fontSize: "1.3rem" }} className="text-[#1565C0] dark:text-indigo-300" />,
      bg: "bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 text-[#1565C0] dark:text-white",
      status: "All",
    },
    {
      name: "Total Canceled Orders",
      value: totalCanceledOrders,
      icon: <CancelIcon sx={{ fontSize: "1.3rem" }} className="text-slate-700 dark:text-slate-300" />,
      bg: "bg-slate-100/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-white",
      status: "Cancelled",
    },
    {
      name: "Total Drafted Orders",
      value: 0,
      icon: <EditNoteIcon sx={{ fontSize: "1.3rem" }} className="text-[#00ACC1] dark:text-sky-300" />,
      bg: "bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 text-[#00ACC1] dark:text-white",
      status: "All",
    },
  ];

  return (
    <motion.div
      className="hidden md:block bg-white dark:bg-gray-500/20 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 w-full space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Orders Overview</h2>
        <span className="text-xs text-gray-400 font-medium">Click card to filter table</span>
      </div>

      {/* Render ALL 5 cards in ONE single row on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
        {orderSummaryData.map((item, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl shadow-xs hover:shadow-md ${item.bg} cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2`}
            onClick={() => handleStatusFilter(item.status)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 truncate max-w-[130px]">
                {item.name}
              </span>
              <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-xs shrink-0">
                {item.icon}
              </div>
            </div>

            <div className="text-2xl font-extrabold tracking-tight">
              {item.value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

OrdersSummary.propTypes = {
  totalOrders: PropTypes.number.isRequired,
  totalRecievedOrders: PropTypes.number.isRequired,
  totalCanceledOrders: PropTypes.number.isRequired,
  handleStatusFilter: PropTypes.func.isRequired,
};
