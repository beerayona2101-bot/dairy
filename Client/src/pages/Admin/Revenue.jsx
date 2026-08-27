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
    let csvContent = "MADHUR DAIRY & DAILY NEEDS - FINANCIAL SUMMARY REPORT\n";
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
    link.setAttribute("download", `Madhur_Dairy_Financial_Summary_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TrendingUpIcon className="text-emerald-600 dark:text-emerald-400 !text-3xl" />
            Revenue & Financial Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Click any metric card below to switch and view detailed reports & breakdown at the bottom.
          </p>
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
            className="flex items-center gap-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition cursor-pointer"
          >
            <DownloadIcon className="!text-base" /> Export Financial Summary
          </button>
        </div>
      </motion.div>

      {/* 4 Financial Metric Cards - Clickable Interactive Buttons */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Gross Revenue */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("revenue")}
          className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-2 relative overflow-hidden ${
            activeMetricTab === "revenue"
              ? "bg-blue-100/90 dark:bg-blue-900/40 border-[#1E88E5] ring-2 ring-[#1E88E5] shadow-md scale-[1.02]"
              : "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40 hover:border-blue-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            <span>Total Gross Revenue</span>
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#1E88E5] dark:text-blue-400 shadow-xs">
              <PaidIcon className="!text-xl" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1E88E5] dark:text-white">
            &#8377; {formatNumberWithCommas(totalRevenue)}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">From all customer orders</p>
            {activeMetricTab === "revenue" && (
              <span className="text-[10px] font-black text-[#1E88E5] bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-300">
                ✓ Active View
              </span>
            )}
          </div>
        </button>

        {/* Card 2: Net Profit */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("profit")}
          className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-2 relative overflow-hidden ${
            activeMetricTab === "profit"
              ? "bg-sky-100/90 dark:bg-sky-900/40 border-sky-500 ring-2 ring-sky-500 shadow-md scale-[1.02]"
              : "bg-sky-50/90 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/40 hover:border-sky-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            <span>Estimated Profit</span>
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#1E88E5] dark:text-sky-400 shadow-xs">
              <AccountBalanceWalletIcon className="!text-xl" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1E88E5] dark:text-white">
            &#8377; {formatNumberWithCommas(totalProfit)}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Net margin earnings</p>
            {activeMetricTab === "profit" && (
              <span className="text-[10px] font-black text-sky-700 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-full border border-sky-300">
                ✓ Active View
              </span>
            )}
          </div>
        </button>

        {/* Card 3: Delivered Revenue */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("delivered")}
          className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-2 relative overflow-hidden ${
            activeMetricTab === "delivered"
              ? "bg-indigo-100/90 dark:bg-indigo-900/40 border-indigo-500 ring-2 ring-indigo-500 shadow-md scale-[1.02]"
              : "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/40 hover:border-indigo-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            <span>Delivered Sales</span>
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#1565C0] dark:text-indigo-300 shadow-xs">
              <ShoppingBagIcon className="!text-xl" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1565C0] dark:text-white">
            &#8377; {formatNumberWithCommas(deliveredRevenue)}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{deliveredOrders.length} orders delivered</p>
            {activeMetricTab === "delivered" && (
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-300">
                ✓ Active View
              </span>
            )}
          </div>
        </button>

        {/* Card 4: Average Order Value */}
        <button
          type="button"
          onClick={() => setActiveMetricTab("avgOrder")}
          className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border space-y-2 relative overflow-hidden ${
            activeMetricTab === "avgOrder"
              ? "bg-slate-200/90 dark:bg-slate-800/80 border-teal-500 ring-2 ring-teal-500 shadow-md scale-[1.02]"
              : "bg-slate-100/90 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-teal-400 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            <span>Avg. Order Value</span>
            <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-[#00ACC1] dark:text-sky-300 shadow-xs">
              <TrendingUpIcon className="!text-xl" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#00ACC1] dark:text-white">
            &#8377; {formatNumberWithCommas(avgOrderValue.toFixed(2))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Average ticket size</p>
            {activeMetricTab === "avgOrder" && (
              <span className="text-[10px] font-black text-teal-700 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-300">
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
          <span className="text-xs font-semibold text-[#1E88E5] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200">
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
                      <td className="px-4 py-3 font-mono font-bold text-xs text-[#1E88E5]">
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
                            ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-300"
                            : order.status === "Confirmed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300"
                            : order.status === "Processing"
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300"
                        }`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-[#1E88E5] dark:text-blue-300">
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
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300">
                          {marginPercent}% Margin
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{soldQty} Units</td>
                      <td className="px-4 py-3 text-right font-extrabold text-sky-700 dark:text-sky-300">
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
                        <td className="px-4 py-3 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-300">
                          #{order._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {custName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{orderDate}</td>
                        <td className="px-4 py-3 font-medium">{order.paymentMethod || order.paymentMode || "COD"}</td>
                        <td className="px-4 py-3 text-center font-bold">{itemsCount} Items</td>
                        <td className="px-4 py-3 text-right font-extrabold text-indigo-700 dark:text-indigo-300">
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
                            stockVal === 0
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : stockVal <= threshold
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          }`}
                        >
                          {stockVal === 0
                            ? "Out of Stock"
                            : `${stockVal} Units${stockVal <= threshold ? " (Low Stock)" : ""}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
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
