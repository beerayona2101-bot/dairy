import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StoreIcon from "@mui/icons-material/Store";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import LiveUpdatesDashboard from "../../components/AdminComponents/DashboardComponents/LiveUpdatesDashboard";
import { ProductContext } from "../../context/ProductProvider";
import { AdminOrderContext } from "../../context/AdminOrderProvider";
import { getTotalRevenue } from "../../utils/DashboardHelpers/salesOverviewHelper";
import { getAllStores } from "../../services/storeServices";
import { formatNumberWithCommas } from "../../utils/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, productLoading } = useContext(ProductContext);
  const { allOrders, allOrdersLoading } = useContext(AdminOrderContext);

  const [storesList, setStoresList] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getAllStores();
        if (res?.success) {
          setStoresList(res.stores || []);
          setCustomerCount(res.stores?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch customer count for dashboard:", err);
      }
    };
    fetchCustomers();
  }, []);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const fadeInVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  const totalRevenue = getTotalRevenue(allOrders);

  return (
    <motion.div
      variants={fadeInVariant}
      initial="hidden"
      animate="visible"
      className="w-full p-4 md:p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Top 4 Glassmorphism Interactive Metric Cards Grid (2x2 on Mobile, 4x1 on Desktop) */}
      <motion.div variants={fadeUpVariant} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {/* 1. Revenue Card - Vibrant Purple Glass Panel */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/revenue")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[28px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(108,92,231,0.15)] transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] flex items-center justify-center shadow-xs border border-purple-100 dark:border-purple-800 shrink-0">
              <TrendingUpIcon className="text-xs sm:text-xl" />
            </div>
            <ArrowForwardIcon className="text-[#6C5CE7] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              Total Revenue
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-[#6C5CE7] dark:text-purple-300 tracking-tight truncate">
              &#8377;{formatNumberWithCommas(totalRevenue)}
            </div>
            <p className="text-[9px] sm:text-[11px] text-[#718096] dark:text-gray-400 font-bold truncate hidden sm:block">
              Click for Revenue Analytics →
            </p>
          </div>
        </motion.button>

        {/* 2. Orders Card - Emerald Green Glass Panel */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/orders")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[28px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(0,184,148,0.15)] transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00B894] flex items-center justify-center shadow-xs border border-emerald-100 dark:border-emerald-800 shrink-0">
              <ReceiptLongIcon className="text-xs sm:text-xl" />
            </div>
            <ArrowForwardIcon className="text-[#00B894] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              Total Orders
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-[#00B894] dark:text-emerald-400 tracking-tight truncate">
              {allOrders?.length || 0}
            </div>
            <p className="text-[9px] sm:text-[11px] text-[#718096] dark:text-gray-400 font-bold truncate hidden sm:block">
              Click to manage Orders →
            </p>
          </div>
        </motion.button>

        {/* 3. Customers Card - Salmon Orange Glass Panel */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/customers")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[28px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(255,118,117,0.15)] transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF7675] flex items-center justify-center shadow-xs border border-orange-100 dark:border-orange-800 shrink-0">
              <StoreIcon className="text-xs sm:text-xl" />
            </div>
            <ArrowForwardIcon className="text-[#FF7675] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              Total Customers
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-[#FF7675] dark:text-orange-400 tracking-tight truncate">
              {customerCount}
            </div>
            <p className="text-[9px] sm:text-[11px] text-[#718096] dark:text-gray-400 font-bold truncate hidden sm:block">
              Click to manage Customers →
            </p>
          </div>
        </motion.button>

        {/* 4. Products Inventory Card - Deep Navy Glass Panel */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/inventory")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[28px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/90 dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(15,39,66,0.15)] transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0F2742] dark:text-blue-300 flex items-center justify-center shadow-xs border border-blue-100 dark:border-blue-800 shrink-0">
              <Inventory2Icon className="text-xs sm:text-xl" />
            </div>
            <ArrowForwardIcon className="text-[#0F2742] dark:text-blue-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
              Dairy Products
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-[#0F2742] dark:text-white tracking-tight truncate">
              {products?.length || 0}
            </div>
            <p className="text-[9px] sm:text-[11px] text-[#718096] dark:text-gray-400 font-bold truncate hidden sm:block">
              Click for Inventory Overview →
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Main Full-Width Live Updates Dashboard Stream */}
      <motion.section className="w-full" variants={fadeInVariant}>
        <motion.div variants={fadeUpVariant} className="w-full">
          <LiveUpdatesDashboard
            allOrders={allOrders || []}
            stores={storesList || []}
            loading={productLoading || allOrdersLoading}
          />
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
