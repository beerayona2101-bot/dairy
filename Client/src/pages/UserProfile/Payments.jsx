import React, { useContext } from "react";
import { UserOrderContext } from "../../context/UserOrderProvider";
import { formatNumberWithCommas } from "../../utils/format";
import { formatOrderDate } from "../../utils/dateUtils";
import api from "../../services/api";
import BuffaloLoader from "../../components/BuffaloLoader";
import { MdAttachMoney, MdCheckCircle, MdReceipt, MdLocalShipping, MdCreditCard } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Payments() {
  const { userOrders, orderLoading } = useContext(UserOrderContext);

  const totalSpent = (userOrders || [])
    .filter((o) => o?.status !== "Cancelled")
    .reduce((sum, o) => sum + (Number(o?.totalAmount) || 0), 0);

  const onlinePayments = (userOrders || []).filter((o) =>
    o?.paymentMode?.toLowerCase().includes("online")
  ).length;

  const codPayments = (userOrders || []).filter((o) =>
    o?.paymentMode?.toLowerCase().includes("cash")
  ).length;

  const baseUrl = api.defaults.baseURL || "http://localhost:9000";

  if (orderLoading) {
    return <BuffaloLoader variant="inline" text="Loading payment records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MdAttachMoney className="text-[#6C5CE7] text-3xl" /> Payment & Transaction History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review all completed purchases, payment modes, total spending, and download official invoices.
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#6C5CE7] dark:text-purple-300">
            <MdAttachMoney className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total Amount Paid</p>
            <h3 className="text-2xl font-black text-[#6C5CE7] dark:text-purple-300">
              &#8377;{formatNumberWithCommas(totalSpent)}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
            <MdCreditCard className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Online Payments</p>
            <h3 className="text-2xl font-black text-blue-700 dark:text-blue-300">
              {onlinePayments} Orders
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
            <MdLocalShipping className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Cash on Delivery</p>
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {codPayments} Orders
            </h3>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {!userOrders || userOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-700">
          <MdReceipt className="mx-auto text-4xl text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-white">No payment transactions found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">You haven't made any purchases yet.</p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 rounded-full bg-[#6C5CE7] text-white text-xs font-bold shadow-md hover:bg-[#5b4cc4] transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden shadow-xs">
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
                {userOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                    <td className="p-3.5 font-mono font-bold text-[#6C5CE7] dark:text-purple-300">
                      #{order.orderId || `MD-${order._id.slice(-6).toUpperCase()}`}
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
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-gray-900 dark:text-white text-sm">
                      &#8377;{formatNumberWithCommas(order.totalAmount || 0)}
                    </td>
                    <td className="p-3.5 text-center">
                      <a
                        href={`${baseUrl}/pdf/generate-bill/${order._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 text-[#6C5CE7] dark:text-purple-300 border border-[#6C5CE7]/20 font-bold text-xs transition cursor-pointer"
                      >
                        <MdReceipt /> PDF Invoice
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

