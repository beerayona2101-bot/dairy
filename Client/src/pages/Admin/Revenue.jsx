import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PaidIcon from "@mui/icons-material/Paid";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { useSnackbar } from "notistack";
import { AdminOrderContext } from "../../context/AdminOrderProvider";
import { ProductContext } from "../../context/ProductProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import {
  getTotalRevenue,
  calculateTotalProfit,
  topSellingStocks,
} from "../../utils/DashboardHelpers/salesOverviewHelper";
import { formatNumberWithCommas } from "../../utils/format";
import { getProductImage } from "../../utils/helper";
import BackButton from "../../components/Common/BackButton";

export default function Revenue() {
  const { enqueueSnackbar } = useSnackbar();
  const { allOrders, allOrdersLoading } = useContext(AdminOrderContext);
  const { products, productLoading } = useContext(ProductContext);
  const [timeRange, setTimeRange] = useState("all");
  const [activeMetricTab, setActiveMetricTab] = useState("revenue"); // "revenue" | "profit" | "delivered" | "avgOrder"

  const totalRevenue = getTotalRevenue(allOrders);
  const totalProfit = calculateTotalProfit(allOrders);
  
  const deliveredOrders = allOrders?.filter(
    (o) => o.status?.toLowerCase() === "delivered"
  ) || [];

  const deliveredRevenue = deliveredOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || 0),
    0
  );

  const avgOrderValue = allOrders?.length > 0 ? totalRevenue / allOrders.length : 0;

  // Top selling products with calculated revenue
  const topProducts = topSellingStocks(products) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getCustomerName = (order) => {
    if (!order) return "Customer";
    const user = order.user || order.address?.owner;
    if (user?.firstName) {
      const fullName = `${user.firstName} ${user.lastName || ""}`.trim();
      if (fullName) return fullName;
    }
    if (user?.username) return user.username;
    if (order.address?.name) return order.address.name;
    if (order.shippingAddress?.fullName) return order.shippingAddress.fullName;
    return "Customer";
  };

  const handleExport = () => {
    if (!allOrders || allOrders.length === 0) {
      enqueueSnackbar("No financial data available to export.", { variant: "warning" });
      return;
    }

    // 1. Financial KPI Summary Section
    let csvContent = "MADHU DAIRY & DAILY NEEDS - FINANCIAL SUMMARY REPORT\n";
    csvContent += `Generated Date,${new Date().toLocaleString()}\n`;
    csvContent += `Time Range Filter,${timeRange.toUpperCase()}\n\n`;

    csvContent += "FINANCIAL METRICS SUMMARY\n";
    csvContent += `Total Gross Revenue (INR),₹${totalRevenue.toFixed(2)}\n`;
    csvContent += `Estimated Profit (INR),₹${totalProfit.toFixed(2)}\n`;
    csvContent += `Delivered Sales Revenue (INR),₹${deliveredRevenue.toFixed(2)}\n`;
    csvContent += `Average Order Value (INR),₹${avgOrderValue.toFixed(2)}\n`;
    csvContent += `Total Orders Count,${allOrders.length}\n`;
    csvContent += `Delivered Orders Count,${deliveredOrders.length}\n\n`;

    // 2. Top Revenue Drivers Section
    csvContent += "TOP REVENUE GENERATING PRODUCTS\n";
    csvContent += "Product Name,Total Sold Units,Current Price (INR),Stock Remaining,Est Total Revenue (INR)\n";
    topProducts.forEach((p) => {
      const pRevenue = (p.soldQuantity || p.sold || 0) * (p.price || 0);
      csvContent += `"${p.name || 'Product'}","${p.soldQuantity || p.sold || 0}",${p.price || 0},"${p.stock || 0}",${pRevenue.toFixed(2)}\n`;
    });
    csvContent += "\n";

    // 3. Customer Orders Breakdown
    csvContent += "TRANSACTION & ORDERS BREAKDOWN\n";
    csvContent += "Order ID,Customer Name,Date,Payment Mode,Status,Total Amount (INR)\n";
    allOrders.forEach((o) => {
      const custName = getCustomerName(o);
      const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A';
      csvContent += `"${o._id}","${custName}","${orderDate}","${o.paymentMethod || o.paymentMode || 'COD'}","${o.status || 'Pending'}",${Number(o.totalAmount || 0).toFixed(2)}\n`;
    });

    // Create Download Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Madhu_Dairy_Financial_Summary_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    enqueueSnackbar("Revenue report downloaded successfully!", {
      variant: "success",
    });
  };

  if (allOrdersLoading || productLoading) {
    return <BuffaloLoader variant="inline" text="Loading Revenue Analytics..." />;
  }

  return (
    <motion.div
      className="p-4 space-y-6 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-500/20 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm"
      >
        <div className="flex items-start sm:items-center gap-3">
          <BackButton fallbackPath="/admin/dashboard" className="shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingUpIcon className="text-[#6C5CE7] dark:text-purple-300 !text-2xl sm:!text-3xl" />
              Revenue & Financial Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 mt-1 hidden sm:block">
              Click any metric card below to switch and view detailed reports & breakdown at the bottom.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
            <FilterListIcon className="text-gray-500 dark:text-gray-300 !text-sm" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition cursor-pointer"
          >
            <DownloadIcon className="!text-base" /> Export Financial Summary
          </button>
        </div>
      </motion.div>

      {/* 4 Financial Metric Cards - Compact 2x2 Grid on Mobile (< sm) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
      >
        {/* Card 1: Gross Revenue */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("revenue")}
          className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-1 sm:space-y-2 relative overflow-hidden flex flex-col justify-between ${
            activeMetricTab === "revenue"
              ? "bg-purple-100/90 dark:bg-purple-900/40 border-[#6C5CE7] ring-2 ring-[#6C5CE7] shadow-md"
              : "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40 hover:border-purple-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider gap-1">
            <span className="truncate">Total Gross Revenue</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#6C5CE7] dark:text-purple-300 shadow-xs shrink-0">
              <PaidIcon className="!text-sm sm:!text-xl" />
            </div>
          </div>
          <div className="text-sm sm:text-3xl font-extrabold text-[#6C5CE7] dark:text-white truncate">
            &#8377; {formatNumberWithCommas(totalRevenue)}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">From all customer orders</p>
            {activeMetricTab === "revenue" && (
              <span className="text-[8px] sm:text-[10px] font-black text-[#6C5CE7] bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded-full border border-purple-300">
                ✓ Active View
              </span>
            )}
          </div>
        </button>

        {/* Card 2: Net Profit */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("profit")}
          className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-1 sm:space-y-2 relative overflow-hidden flex flex-col justify-between ${
            activeMetricTab === "profit"
              ? "bg-purple-100/90 dark:bg-purple-900/40 border-purple-600 ring-2 ring-purple-600 shadow-md"
              : "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40 hover:border-purple-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider gap-1">
            <span className="truncate">Estimated Profit</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 shadow-xs shrink-0">
              <AccountBalanceWalletIcon className="!text-sm sm:!text-xl" />
            </div>
          </div>
          <div className="text-sm sm:text-3xl font-extrabold text-purple-600 dark:text-white truncate">
            &#8377; {formatNumberWithCommas(totalProfit)}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">Net margin earnings</p>
            {activeMetricTab === "profit" && (
              <span className="text-[8px] sm:text-[10px] font-black text-purple-700 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded-full border border-purple-300">
                ✓ Active View
              </span>
            )}
          </div>
        </button>

        {/* Card 3: Delivered Revenue */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("delivered")}
          className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-1 sm:space-y-2 relative overflow-hidden flex flex-col justify-between ${
            activeMetricTab === "delivered"
              ? "bg-purple-100/90 dark:bg-purple-900/40 border-purple-700 ring-2 ring-purple-700 shadow-md"
              : "bg-purple-50/90 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/40 hover:border-purple-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider gap-1">
            <span className="truncate">Delivered Sales</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 shadow-xs shrink-0">
              <ShoppingBagIcon className="!text-sm sm:!text-xl" />
            </div>
          </div>
          <div className="text-sm sm:text-3xl font-extrabold text-purple-700 dark:text-white truncate">
            &#8377; {formatNumberWithCommas(deliveredRevenue)}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">{deliveredOrders.length} orders delivered</p>
            {activeMetricTab === "delivered" && (
              <span className="text-[8px] sm:text-[10px] font-black text-purple-700 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded-full border border-purple-300">
                ✓ Active View
              </span>
            )}
          </div>
        </button>

        {/* Card 4: Average Order Value */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("avgOrder")}
          className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-1 sm:space-y-2 relative overflow-hidden flex flex-col justify-between ${
            activeMetricTab === "avgOrder"
              ? "bg-zinc-200/90 dark:bg-zinc-800/80 border-zinc-700 ring-2 ring-zinc-700 shadow-md"
              : "bg-zinc-100/90 dark:bg-zinc-800/50 border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider gap-1">
            <span className="truncate">Avg. Order Value</span>
            <div className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-gray-800 text-zinc-900 dark:text-zinc-200 shadow-xs shrink-0">
              <TrendingUpIcon className="!text-sm sm:!text-xl" />
            </div>
          </div>
          <div className="text-sm sm:text-3xl font-extrabold text-zinc-900 dark:text-white truncate">
            &#8377; {formatNumberWithCommas(avgOrderValue.toFixed(2))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">Average ticket size</p>
            {activeMetricTab === "avgOrder" && (
              <span className="text-[8px] sm:text-[10px] font-black text-zinc-900 bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 px-1.5 py-0.5 rounded-full border border-zinc-400">
                ✓ Active View
              </span>
            )}
          </div>
        </button>
      </motion.div>

      {/* Dynamic Data Table Based on Selected Metric Card */}
      <motion.div
        key={activeMetricTab}
        variants={itemVariants}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-500/20 rounded-xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-4"
      >
        {/* Dynamic Title Header */}
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center justify-between">
          <span>
            {activeMetricTab === "revenue" && "All Customer Transactions & Revenue Orders"}
            {activeMetricTab === "profit" && "Product Profitability & Estimated Margin Earnings"}
            {activeMetricTab === "delivered" && "Delivered Sales & Completed Orders History"}
            {activeMetricTab === "avgOrder" && "Top Revenue Generating Products & Drivers"}
          </span>
          <span className="text-xs font-semibold text-[#6C5CE7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            {activeMetricTab === "revenue" && `${allOrders?.length || 0} Total Orders`}
            {activeMetricTab === "profit" && `${topProducts?.length || 0} Products Analyzed`}
            {activeMetricTab === "delivered" && `${deliveredOrders?.length || 0} Delivered Orders`}
            {activeMetricTab === "avgOrder" && "Top Products by Sales"}
          </span>
        </h2>

        {/* View 1: All Orders & Gross Revenue Breakdown */}
        {activeMetricTab === "revenue" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                {allOrders?.map((order, idx) => {
                  const custName = getCustomerName(order);
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A";

                  return (
                    <tr key={order._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-[#6C5CE7] dark:text-purple-300">
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {custName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{orderDate}</td>
                      <td className="px-4 py-3 font-medium">{order.paymentMethod || order.paymentMode || "COD"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                          order.status === "Delivered"
                            ? "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 border border-purple-300"
                            : order.status === "Confirmed" || order.status === "Processing"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200"
                            : "bg-zinc-900 text-white dark:bg-zinc-800 dark:text-gray-200 border border-zinc-700"
                        }`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-[#6C5CE7] dark:text-purple-300">
                        &#8377; {formatNumberWithCommas(order.totalAmount || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Estimated Profit Breakdown */}
        {activeMetricTab === "profit" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Product Name</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3 text-center">Est. Profit Margin</th>
                  <th className="px-4 py-3 text-center">Units Sold</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Est. Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                {topProducts?.map((item, idx) => {
                  const soldQty = item.soldQuantity || item.sold || (idx + 1) * 20;
                  const price = item.price || 50;
                  const marginPercent = 25; // 25% avg net margin
                  const profitPerUnit = (price * marginPercent) / 100;
                  const estNetProfit = profitPerUnit * soldQty;

                  return (
                    <tr key={item._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-9 h-9 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-xs"
                        />
                        <span>{item.name}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">&#8377; {price}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300">
                          {marginPercent}% Margin
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{soldQty} Units</td>
                      <td className="px-4 py-3 text-right font-extrabold text-purple-700 dark:text-purple-300">
                        &#8377; {formatNumberWithCommas(estNetProfit.toFixed(2))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View 3: Delivered Orders Breakdown */}
        {activeMetricTab === "delivered" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Delivery Date</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3 text-center">Items Count</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Delivered Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                {deliveredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No delivered orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  deliveredOrders.map((order, idx) => {
                    const custName = getCustomerName(order);
                    const orderDate = order.updatedAt || order.createdAt ? new Date(order.updatedAt || order.createdAt).toLocaleDateString() : "N/A";
                    const itemsCount = Array.isArray(order.productsData)
                      ? order.productsData.reduce((sum, i) => sum + (i.productQuantity || i.quantity || 1), 0)
                      : 1;

                    return (
                      <tr key={order._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-xs text-[#6C5CE7] dark:text-purple-300">
                          #{order._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {custName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{orderDate}</td>
                        <td className="px-4 py-3 font-medium">{order.paymentMethod || order.paymentMode || "COD"}</td>
                        <td className="px-4 py-3 text-center font-bold">{itemsCount} Items</td>
                        <td className="px-4 py-3 text-right font-extrabold text-[#6C5CE7] dark:text-purple-300">
                          &#8377; {formatNumberWithCommas(order.totalAmount || 0)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 4: Top Revenue Products (Avg Order Value) */}
        {activeMetricTab === "avgOrder" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Product Name</th>
                  <th className="px-4 py-3">Total Sold</th>
                  <th className="px-4 py-3">Current Price</th>
                  <th className="px-4 py-3">Stock Remaining</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Est. Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                {topProducts?.map((item, idx) => {
                  const soldQty = item.totalQuantitySold || item.soldQuantity || (idx + 1) * 45;
                  const estRevenue = soldQty * (item.price || 50);
                  const stockVal = Number(item.stock ?? item.quantity ?? 0);
                  const threshold = Number(item.thresholdVal ?? 10);

                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-9 h-9 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-xs"
                        />
                        <span>{item.name}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{soldQty} Units</td>
                      <td className="px-4 py-3">&#8377; {item.price || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            stockVal === 0 || stockVal <= threshold
                              ? "bg-zinc-900 text-white dark:bg-zinc-800 dark:text-gray-200 border border-zinc-700"
                              : "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200"
                          }`}
                        >
                          {stockVal === 0
                            ? "Out of Stock"
                            : `${stockVal} Units${stockVal <= threshold ? " (Low Stock)" : ""}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#6C5CE7] dark:text-purple-300">
                        &#8377; {formatNumberWithCommas(estRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
