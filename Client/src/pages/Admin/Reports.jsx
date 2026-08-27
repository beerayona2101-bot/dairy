import React, { useContext, useState, useMemo } from "react";
import { motion } from "framer-motion";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SpeedIcon from "@mui/icons-material/Speed";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useSnackbar } from "notistack";

import { ProductContext } from "../../context/ProductProvider";
import { AdminOrderContext } from "../../context/AdminOrderProvider";
import { getReportAnalyticsData } from "../../utils/DashboardHelpers/reportsAnalyticsHelper";
import { formatNumberWithCommas } from "../../utils/format";

import ReportRevenueChart from "../../components/AdminComponents/ReportComponents/ReportRevenueChart";
import ReportCategoryPie from "../../components/AdminComponents/ReportComponents/ReportCategoryPie";
import ReportProductGrowthBar from "../../components/AdminComponents/ReportComponents/ReportProductGrowthBar";
import ReportOrderStatusRings from "../../components/AdminComponents/ReportComponents/ReportOrderStatusRings";
import ReportProductTable from "../../components/AdminComponents/ReportComponents/ReportProductTable";

export default function Reports() {
  const { enqueueSnackbar } = useSnackbar();
  const { allOrders } = useContext(AdminOrderContext);
  const { products } = useContext(ProductContext);

  const [timeRange, setTimeRange] = useState("month");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const analyticsData = useMemo(() => {
    return getReportAnalyticsData(allOrders || [], products || [], timeRange, startDate, endDate);
  }, [allOrders, products, timeRange, startDate, endDate]);

  const { summaryMetrics, timelineData, categoryData, productGrowthData, orderStatusData } = analyticsData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, duration: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const handleExportCSV = () => {
    const headers = "Product Name,Category,Units Sold,Revenue (INR),Growth Rate (%)\n";
    const rows = productGrowthData
      .map((p) => `"${p.name}","${p.category}",${p.sold},${p.revenue},${p.growth}%`)
      .join("\n");

    const fileName =
      timeRange === "custom"
        ? `Madhur_Dairy_Sales_Report_From_${startDate}_To_${endDate}.csv`
        : `Madhur_Dairy_Sales_Report_${timeRange.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    enqueueSnackbar(`Report downloaded for period: ${timeRange === "custom" ? `${startDate} to ${endDate}` : timeRange}!`, {
      variant: "success",
    });
  };

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page Header with Right-Side Top Corner Export Button & Time Range Dropdown */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800/80 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
              <AssessmentOutlinedIcon className="text-[#1E88E5] dark:text-pink-400 !text-3xl" />
              Analytics & Reports Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 mt-1">
              Real-time interactive graphical presentations, sales growth metrics, circular share breakdowns, and static data reports.
            </p>
          </div>

          {/* Export CSV Report Button at Top Right Corner */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-center shrink-0"
          >
            <DownloadIcon className="!text-base" /> Export CSV Report
          </button>
        </div>

        {/* Time Range Dropdown & Custom Date Range Inputs Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          {/* Time Range Dropdown Select */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/60 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
            <CalendarTodayIcon className="!text-sm text-[#1E88E5] dark:text-blue-400" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Period:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="today" className="dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">Day</option>
              <option value="week" className="dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">Week</option>
              <option value="month" className="dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">Month</option>
              <option value="year" className="dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">Year</option>
              <option value="all" className="dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">All Time</option>
              <option value="custom" className="dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">Custom Range</option>
            </select>
          </div>

          {/* Calendar Date Range Pickers (From Date - To Date) */}
          {timeRange === "custom" && (
            <div className="flex flex-wrap items-center gap-2 bg-blue-50/80 dark:bg-gray-900/60 p-1.5 rounded-xl border border-blue-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Metric Summary Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-blue-50/90 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-200/80 dark:border-blue-800/40 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-[#1E88E5] dark:text-blue-400 mt-1">
                ₹{formatNumberWithCommas(summaryMetrics.revenue)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-[#1E88E5] dark:text-blue-300 shadow-xs">
              <AttachMoneyIcon />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E88E5] dark:text-blue-300 pt-2 border-t border-blue-200/60 dark:border-gray-700/50">
            <TrendingUpIcon sx={{ fontSize: "1rem" }} />
            <span>+{summaryMetrics.revenueGrowth}% vs last period</span>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-sky-50/90 dark:bg-sky-950/40 p-5 rounded-2xl border border-sky-200/80 dark:border-sky-800/40 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">Units & Orders Sold</p>
              <h3 className="text-2xl font-extrabold text-[#1E88E5] dark:text-sky-400 mt-1">
                {formatNumberWithCommas(summaryMetrics.salesCount)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-[#1E88E5] dark:text-sky-300 shadow-xs">
              <ShoppingBagIcon />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E88E5] dark:text-sky-300 pt-2 border-t border-sky-200/60 dark:border-gray-700/50">
            <TrendingUpIcon sx={{ fontSize: "1rem" }} />
            <span>+{summaryMetrics.salesGrowth}% sales volume increase</span>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-indigo-50/90 dark:bg-indigo-950/40 p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/40 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">Net Profit</p>
              <h3 className="text-2xl font-extrabold text-[#1565C0] dark:text-indigo-300 mt-1">
                ₹{formatNumberWithCommas(summaryMetrics.profit)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-[#1565C0] dark:text-indigo-300 shadow-xs">
              <MonetizationOnIcon />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] dark:text-indigo-300 pt-2 border-t border-indigo-200/60 dark:border-gray-700/50">
            <span>Profit Margin: {summaryMetrics.profitMargin}%</span>
          </div>
        </div>

        {/* Card 4: Avg Order Value */}
        <div className="bg-slate-100/90 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">Average Order Value</p>
              <h3 className="text-2xl font-extrabold text-[#00ACC1] dark:text-sky-400 mt-1">
                ₹{formatNumberWithCommas(summaryMetrics.avgOrderValue)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-[#00ACC1] dark:text-sky-300 shadow-xs">
              <SpeedIcon />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            <span>Fulfillment Rate: {summaryMetrics.fulfillmentRate}%</span>
          </div>
        </div>
      </motion.div>

      {/* Revenue & Sales Trend Graph */}
      <motion.div variants={itemVariants}>
        <ReportRevenueChart timelineData={timelineData} timeRange={timeRange} />
      </motion.div>

      {/* Circular Presentation & Product Growth Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ReportCategoryPie categoryData={categoryData} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ReportProductGrowthBar productGrowthData={productGrowthData} />
        </motion.div>
      </div>

      {/* Circular Order Status Rings & Detailed Static Data Table */}
      <div className="grid grid-cols-1 space-y-6">
        <motion.div variants={itemVariants}>
          <ReportOrderStatusRings orderStatusData={orderStatusData} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ReportProductTable productGrowthData={productGrowthData} />
        </motion.div>
      </div>
    </motion.div>
  );
}
