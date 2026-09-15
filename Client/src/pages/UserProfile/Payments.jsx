import React, { useState, useContext } from "react";
import { UserOrderContext } from "../../context/UserOrderProvider";
import { formatNumberWithCommas } from "../../utils/format";
import { formatOrderDate } from "../../utils/dateUtils";
import api from "../../services/api";
import BuffaloLoader from "../../components/BuffaloLoader";
import {
  MdAttachMoney,
  MdCheckCircle,
  MdReceipt,
  MdLocalShipping,
  MdCreditCard,
  MdOutlinePendingActions,
  MdCancel,
  MdToday,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { Download, Sparkles, FileText, Calendar, CreditCard as CreditCardIcon, Search, X, Filter, Eye } from "lucide-react";
import InvoiceModal from "../../components/InvoiceModal";

export default function Payments() {
  const { userOrders, orderLoading } = useContext(UserOrderContext);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewInvoiceOrderId, setViewInvoiceOrderId] = useState(null);

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  // Today Amount Paid
  const todaySpent = (userOrders || [])
    .filter((o) => o?.status !== "Cancelled" && isToday(o?.createdAt))
    .reduce((sum, o) => sum + (Number(o?.totalAmount) || 0), 0);

  // Total Amount Paid
  const totalSpent = (userOrders || [])
    .filter((o) => o?.status !== "Cancelled")
    .reduce((sum, o) => sum + (Number(o?.totalAmount) || 0), 0);

  // Online Payments Count
  const onlinePayments = (userOrders || []).filter((o) =>
    o?.paymentMode?.toLowerCase().includes("online")
  ).length;

  // COD Payments Count
  const codPayments = (userOrders || []).filter((o) =>
    o?.paymentMode?.toLowerCase().includes("cash") ||
    !o?.paymentMode?.toLowerCase().includes("online")
  ).length;

  const baseUrl = api.defaults.baseURL || "http://localhost:9000";

  // Filtered Orders Calculation
  const filteredOrders = (userOrders || []).filter((order) => {
    let matchesTab = true;
    if (activeFilter === "online") {
      matchesTab = order?.paymentMode?.toLowerCase().includes("online");
    } else if (activeFilter === "cod") {
      matchesTab =
        order?.paymentMode?.toLowerCase().includes("cash") ||
        !order?.paymentMode?.toLowerCase().includes("online");
    } else if (activeFilter === "delivered") {
      matchesTab = order?.status === "Delivered";
    } else if (activeFilter === "pending") {
      matchesTab = order?.status !== "Delivered" && order?.status !== "Cancelled";
    }

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const orderId = (order.orderId || order._id || "").toLowerCase();
      const mode = (order.paymentMode || "").toLowerCase();
      const status = (order.status || "").toLowerCase();
      matchesSearch = orderId.includes(q) || mode.includes(q) || status.includes(q);
    }

    return matchesTab && matchesSearch;
  });

  if (orderLoading) {
    return <BuffaloLoader variant="inline" text="Loading payment records..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6 overflow-y-auto flex-1 min-h-0 pr-0.5 scrollbar-thin">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/80 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#6C5CE7] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
            <MdAttachMoney className="text-2xl" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black text-gray-900 dark:text-white leading-tight">
              Payment & Transaction History
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
              Review completed purchases, daily spending, and download invoices.
            </p>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards Grid (Includes Today Amount Paid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Today Amount Paid Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/60 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200/80 dark:border-amber-800/40 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <MdToday className="text-xl sm:text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
              Today Paid
            </p>
            <h3 className="text-base sm:text-xl font-black text-amber-700 dark:text-amber-300 truncate">
              &#8377;{formatNumberWithCommas(todaySpent)}
            </h3>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/60 dark:from-purple-950/40 dark:to-slate-900 border border-purple-100 dark:border-purple-800/40 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#6C5CE7] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs font-black text-lg sm:text-xl">
            &#8377;
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
              Total Amount
            </p>
            <h3 className="text-base sm:text-xl font-black text-[#6C5CE7] dark:text-purple-300 truncate">
              &#8377;{formatNumberWithCommas(totalSpent)}
            </h3>
          </div>
        </div>

        {/* Online Payments Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-cyan-50/60 dark:from-blue-950/40 dark:to-slate-900 border border-blue-100 dark:border-blue-800/40 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
            <MdCreditCard className="text-xl sm:text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
              Online Mode
            </p>
            <h3 className="text-base sm:text-xl font-black text-blue-700 dark:text-blue-300 truncate">
              {onlinePayments} Orders
            </h3>
          </div>
        </div>

        {/* Cash On Delivery Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
            <MdLocalShipping className="text-xl sm:text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
              COD Mode
            </p>
            <h3 className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-300 truncate">
              {codPayments} Orders
            </h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or mode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-[#6C5CE7] text-xs font-semibold text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-[#6C5CE7] text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Payments
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("online")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                activeFilter === "online"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
              }`}
            >
              Online
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("cod")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                activeFilter === "cod"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
              }`}
            >
              COD
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("delivered")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                activeFilter === "delivered"
                  ? "bg-green-600 text-white shadow-xs"
                  : "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 hover:bg-green-100"
              }`}
            >
              Delivered
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                activeFilter === "pending"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
              }`}
            >
              Active
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Container */}
      {!filteredOrders || filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-700">
          <MdReceipt className="mx-auto text-4xl text-gray-400 mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-white">
            No matching payment transactions found
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
            {searchQuery || activeFilter !== "all"
              ? "Try adjusting your search query or filter selection."
              : "You haven't made any purchases yet."}
          </p>
          {(searchQuery || activeFilter !== "all") && (
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="inline-block px-5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#6C5CE7] dark:text-purple-300 text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Mobile View Card List (Visible on Mobile only: md:hidden) */}
          <div className="block md:hidden space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center justify-between gap-1.5 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#6C5CE7]" />
                Recent Transactions
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                Showing {filteredOrders.length} {filteredOrders.length === 1 ? "record" : "records"}
              </span>
            </h4>

            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="p-3.5 bg-white dark:bg-slate-800/90 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xs space-y-3"
              >
                {/* Header Row: Order ID & Date */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/60">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Order ID
                    </span>
                    <span className="text-xs font-mono font-bold text-[#6C5CE7] dark:text-purple-300">
                      {order.orderId || `MD-ORD-${order._id?.slice(-6)}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center justify-end gap-1">
                      <Calendar size={10} /> Date
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      {formatOrderDate(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Details Row: Payment Mode, Status, Amount */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment Mode */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-[11px]">
                      <CreditCardIcon size={12} className="text-gray-500" />
                      {order.paymentMode || "COD"}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                          : order.status === "Cancelled"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {order.status === "Delivered" && <MdCheckCircle size={12} />}
                      {order.status === "Cancelled" && <MdCancel size={12} />}
                      {order.status !== "Delivered" && order.status !== "Cancelled" && (
                        <MdOutlinePendingActions size={12} />
                      )}
                      {order.status || "Pending"}
                    </span>
                  </div>

                  {/* Total Amount */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      &#8377;{formatNumberWithCommas(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>

                {/* Footer Action: View Invoice (In-Page Modal) */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => setViewInvoiceOrderId(order._id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-[#6C5CE7] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 font-bold text-xs transition cursor-pointer active:scale-98"
                  >
                    <Eye className="w-4 h-4 text-[#6C5CE7] dark:text-purple-300" /> View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View Table (Visible on Desktop only: hidden md:block) */}
          <div className="hidden md:block bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Amount (INR)</th>
                    <th className="p-3.5 text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition"
                    >
                      <td className="p-3.5 font-mono font-bold text-[#6C5CE7] dark:text-purple-300">
                        {order.orderId || `MD-ORD-${order._id?.slice(-6)}`}
                      </td>
                      <td className="p-3.5 text-gray-600 dark:text-gray-300">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="p-3.5 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold">
                          {order.paymentMode || "COD"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                              : order.status === "Cancelled"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {order.status === "Delivered" && <MdCheckCircle />}
                          {order.status === "Cancelled" && <MdCancel />}
                          {order.status !== "Delivered" && order.status !== "Cancelled" && (
                            <MdOutlinePendingActions />
                          )}
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-gray-900 dark:text-white text-sm">
                        &#8377;{formatNumberWithCommas(order.totalAmount || 0)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setViewInvoiceOrderId(order._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 text-[#6C5CE7] dark:text-purple-300 border border-[#6C5CE7]/20 font-bold text-xs transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* In-Page Invoice Modal */}
      <InvoiceModal
        open={!!viewInvoiceOrderId}
        onClose={() => setViewInvoiceOrderId(null)}
        orderId={viewInvoiceOrderId}
      />
    </div>
  );
}
