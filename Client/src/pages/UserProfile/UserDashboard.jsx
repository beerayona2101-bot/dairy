import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdShoppingCart,
  MdCheckCircle,
  MdPendingActions,
  MdAttachMoney,
  MdArrowForward,
  MdLocationOn,
  MdFavorite,
  MdOutlineAccountCircle,
  MdLocalShipping,
  MdPayment,
  MdCancel,
} from "react-icons/md";
import { UserAuthContext } from "../../context/AuthProvider";
import { UserOrderContext } from "../../context/UserOrderProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import { formatNumberWithCommas } from "../../utils/format";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { authUser } = useContext(UserAuthContext);
  const { userOrders: orders = [], orderLoading: loading } = useContext(UserOrderContext);

  const totalPlaced = orders.length;
  const totalDelivered = orders.filter(
    (o) => o.status?.toLowerCase() === "delivered"
  ).length;
  const totalPending = orders.filter((o) =>
    ["pending", "confirmed", "shipped", "processing", "ready to deliver"].includes(o.status?.toLowerCase())
  ).length;
  const totalCancelled = orders.filter(
    (o) => o.status?.toLowerCase() === "cancelled"
  ).length;

  const totalRevenue = orders
    .filter((o) => o.status?.toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const statCards = [
    {
      title: "Orders Placed",
      value: totalPlaced,
      subtext: "Total orders placed",
      icon: <MdShoppingCart className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/80 dark:border-blue-800/40 hover:border-blue-400",
      textColor: "text-blue-700 dark:text-blue-300",
      link: "/user-profile/orders?status=all",
    },
    {
      title: "Orders Delivered",
      value: totalDelivered,
      subtext: "Successfully delivered",
      icon: <MdCheckCircle className="text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400" />,
      bg: "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400",
      textColor: "text-emerald-700 dark:text-emerald-300",
      link: "/user-profile/orders?status=delivered",
    },
    {
      title: "Orders Pending",
      value: totalPending,
      subtext: "Active & in transit",
      icon: <MdPendingActions className="text-xl sm:text-2xl text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200/80 dark:border-amber-800/40 hover:border-amber-400",
      textColor: "text-amber-700 dark:text-amber-300",
      link: "/user-profile/orders?status=pending",
    },
    {
      title: "Orders Cancelled",
      value: totalCancelled,
      subtext: "Cancelled orders",
      icon: <MdCancel className="text-xl sm:text-2xl text-rose-600 dark:text-rose-400" />,
      bg: "bg-rose-50/80 dark:bg-rose-900/20 border-rose-200/80 dark:border-rose-800/40 hover:border-rose-400",
      textColor: "text-rose-700 dark:text-rose-300",
      link: "/user-profile/orders?status=cancelled",
    },
    {
      title: "Total Spent",
      value: `₹${formatNumberWithCommas(totalRevenue)}`,
      subtext: "Total amount paid",
      icon: <MdAttachMoney className="text-xl sm:text-2xl text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50/80 dark:bg-purple-900/20 border-purple-200/80 dark:border-purple-800/40 hover:border-purple-400",
      textColor: "text-purple-700 dark:text-purple-300",
      link: "/user-profile/payments",
    },
  ];

  if (loading) {
    return <BuffaloLoader variant="inline" text="Loading metrics..." />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-1 pb-28 sm:pb-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1E88E5] via-[#00ACC1] to-[#43A047] text-white rounded-2xl p-5 sm:p-6 shadow-md flex justify-between items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {authUser?.firstName || authUser?.username || "Valued Customer"}! 👋
            </h1>
            <p className="text-white/90 text-xs sm:text-sm mt-1 font-medium">
              Here is your account overview and recent order activity stats.
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-2 bg-white text-[#1E88E5] px-4 py-2 rounded-xl font-bold shadow hover:bg-gray-100 transition whitespace-nowrap text-xs sm:text-sm shrink-0"
          >
            <MdLocalShipping className="text-base" /> Shop Essentials
          </Link>
        </div>

        {/* User Stat Cards Grid (5 Responsive Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate(card.link)}
              className={`p-3.5 sm:p-4 rounded-2xl border ${card.bg} shadow-2xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 flex flex-col justify-between group`}
            >
              <div className="flex justify-between items-start gap-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-gray-600 dark:text-gray-300 leading-tight">
                    {card.title}
                  </p>
                  <h3 className={`text-xl sm:text-2xl font-black mt-1.5 ${card.textColor} truncate`}>
                    {card.value}
                  </h3>
                </div>
                <div className="p-2 rounded-xl bg-white/90 dark:bg-black/40 backdrop-blur-xs shadow-2xs shrink-0">
                  {card.icon}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                <span className="truncate max-w-[65%] font-medium">{card.subtext}</span>
                <span className="flex items-center gap-0.5 text-[#1E88E5] dark:text-pink-400 font-black group-hover:translate-x-0.5 transition-transform shrink-0 whitespace-nowrap">
                  View <MdArrowForward />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access & Recent Activity Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Overview */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800/80 rounded-2xl p-5 shadow-xs border border-gray-200/90 dark:border-gray-700/80">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <MdShoppingCart className="text-[#1E88E5] dark:text-pink-400" /> Recent Orders
              </h2>
              <Link
                to="/user-profile/orders?status=all"
                className="text-xs font-extrabold text-[#1E88E5] dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                View All Orders <MdArrowForward />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p className="mb-3 text-sm font-medium">You haven't placed any orders yet.</p>
                <Link
                  to="/products"
                  className="inline-block px-5 py-2.5 bg-[#1E88E5] text-white text-xs font-extrabold rounded-xl hover:bg-[#1565C0] transition shadow-xs"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 4).map((order) => {
                  const displayId = order.orderId || order._id?.slice(-8)?.toUpperCase() || "ORD-1234";
                  return (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/user-profile/orders?orderId=${order._id}`)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/70 hover:border-[#1E88E5] dark:hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-gray-700/50 transition cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                            Order #{displayId}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          • {order.productsData?.length || 1} item{order.productsData?.length > 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-extrabold rounded-full ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                              : order.status === "Cancelled"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                        <div className="flex items-center justify-end gap-1 mt-1 text-xs font-black text-gray-900 dark:text-white">
                          <span>₹{formatNumberWithCommas(order.totalAmount || 0)}</span>
                          <MdArrowForward className="text-gray-400 group-hover:text-[#1E88E5] dark:group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 shadow-xs border border-gray-200/90 dark:border-gray-700/80 space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700/60">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/user-profile"
                className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 transition border border-blue-100 dark:border-blue-900/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-[#1E88E5] dark:bg-blue-900/60 dark:text-blue-300 shrink-0">
                    <MdOutlineAccountCircle className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">Account Details</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Edit name, email & phone</p>
                  </div>
                </div>
                <MdArrowForward className="text-gray-400 group-hover:text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/user-profile/addresses"
                className="flex items-center justify-between p-3.5 rounded-xl bg-green-50/70 dark:bg-green-950/30 hover:bg-green-100/80 dark:hover:bg-green-900/50 transition border border-green-100 dark:border-green-900/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-green-100 text-[#43A047] dark:bg-green-900/60 dark:text-green-300 shrink-0">
                    <MdLocationOn className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">Saved Addresses</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Manage delivery locations</p>
                  </div>
                </div>
                <MdArrowForward className="text-gray-400 group-hover:text-[#43A047] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/user-profile/wishlist"
                className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 hover:bg-cyan-100/80 dark:hover:bg-cyan-900/50 transition border border-cyan-100 dark:border-cyan-900/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-100 text-[#00ACC1] dark:bg-cyan-900/60 dark:text-cyan-300 shrink-0">
                    <MdFavorite className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">My Wishlist</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saved favorite dairy items</p>
                  </div>
                </div>
                <MdArrowForward className="text-gray-400 group-hover:text-[#00ACC1] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/user-profile/payments"
                className="flex items-center justify-between p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 transition border border-purple-100 dark:border-purple-900/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-[#6C5CE7] dark:bg-purple-900/60 dark:text-purple-300 shrink-0">
                    <MdPayment className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">Payments & Billing</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Transaction history & invoices</p>
                  </div>
                </div>
                <MdArrowForward className="text-gray-400 group-hover:text-[#6C5CE7] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
