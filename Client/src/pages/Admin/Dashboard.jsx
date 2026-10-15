import { useContext, useEffect, useState, useCallback } from "react";
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
import wsManager from "../../socket/WebSocketManager";

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, productLoading } = useContext(ProductContext);
  const { allOrders, allOrdersLoading } = useContext(AdminOrderContext);

  const [storesList, setStoresList] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await getAllStores();
      if (res?.success) {
        setStoresList(res.stores || []);
        setCustomerCount(res.stores?.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch customer count for dashboard:", err);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const unsub1 = wsManager.subscribe("user:registered", fetchCustomers);
    const unsub2 = wsManager.subscribe("user:new-registered", fetchCustomers);
    return () => {
      unsub1();
      unsub2();
    };
  }, [fetchCustomers]);

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
      {/* Top 4 Interactive Metric Cards Grid */}
      <motion.div variants={fadeUpVariant} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {/* 1. Revenue Card (Royal Blue) */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/revenue")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[24px] bg-white dark:bg-slate-800 border border-blue-100/90 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(37,99,235,0.06)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.18)] hover:border-blue-600 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs border border-blue-200/60 dark:border-blue-800 shrink-0">
              <TrendingUpIcon className="text-xs sm:text-xl drop-shadow-xs" />
            </div>
            <ArrowForwardIcon className="text-blue-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              Total Revenue
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight truncate">
              &#8377;{formatNumberWithCommas(totalRevenue)}
            </div>
            <p className="text-[9px] sm:text-[11px] text-blue-500/70 group-hover:text-blue-600 dark:text-blue-400/80 font-bold truncate hidden sm:block">
              Click for Revenue Analytics →
            </p>
          </div>
        </motion.button>

        {/* 2. Orders Card (Sky Blue) */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/orders")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[24px] bg-white dark:bg-slate-800 border border-sky-100/90 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(2,132,199,0.06)] hover:shadow-[0_12px_30px_rgba(2,132,199,0.18)] hover:border-sky-500 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs border border-sky-200/60 dark:border-sky-800 shrink-0">
              <ReceiptLongIcon className="text-xs sm:text-xl drop-shadow-xs" />
            </div>
            <ArrowForwardIcon className="text-sky-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              Total Orders
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight truncate">
              {allOrders?.length || 0}
            </div>
            <p className="text-[9px] sm:text-[11px] text-sky-500/70 group-hover:text-sky-600 dark:text-sky-400/80 font-bold truncate hidden sm:block">
              Click to manage Orders →
            </p>
          </div>
        </motion.button>

        {/* 3. Customers Card (Indigo Blue) */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/customers")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[24px] bg-white dark:bg-slate-800 border border-indigo-100/90 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(99,102,241,0.06)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.18)] hover:border-indigo-600 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs border border-indigo-200/60 dark:border-indigo-800 shrink-0">
              <StoreIcon className="text-xs sm:text-xl drop-shadow-xs" />
            </div>
            <ArrowForwardIcon className="text-indigo-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              Total Customers
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight truncate">
              {customerCount}
            </div>
            <p className="text-[9px] sm:text-[11px] text-indigo-500/70 group-hover:text-indigo-600 dark:text-indigo-400/80 font-bold truncate hidden sm:block">
              Click to manage Customers →
            </p>
          </div>
        </motion.button>

        {/* 4. Dairy Products Card (Electric Blue) */}
        <motion.button
          type="button"
          onClick={() => navigate("/admin/inventory")}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-[24px] bg-white dark:bg-slate-800 border border-blue-100/90 dark:border-slate-700/80 shadow-[0_4px_20px_rgba(30,64,175,0.06)] hover:shadow-[0_12px_30px_rgba(30,64,175,0.18)] hover:border-blue-700 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden min-h-[85px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shadow-xs border border-blue-200/60 dark:border-blue-800 shrink-0">
              <Inventory2Icon className="text-xs sm:text-xl drop-shadow-xs" />
            </div>
            <ArrowForwardIcon className="text-blue-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[10px] sm:text-xl shrink-0" />
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2.5">
            <span className="text-[9px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
              Dairy Products
            </span>
            <div className="text-xs sm:text-2xl md:text-3xl font-black text-blue-700 dark:text-blue-300 tracking-tight truncate">
              {products?.length || 0}
            </div>
            <p className="text-[9px] sm:text-[11px] text-blue-600/70 group-hover:text-blue-700 dark:text-blue-300/80 font-bold truncate hidden sm:block">
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
