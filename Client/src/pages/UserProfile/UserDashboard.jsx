import React, { useEffect, useState, useContext, useCallback } from "react";
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
} from "react-icons/md";
import { UserAuthContext } from "../../context/AuthProvider";
import { UserOrderContext } from "../../context/UserOrderProvider";
import { getUserOrders } from "../../services/orderService";
import BuffaloLoader from "../../components/BuffaloLoader";
import { formatNumberWithCommas } from "../../utils/format";
import { useSnackbar } from "notistack";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { authUser } = useContext(UserAuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!authUser?._id) return;
    try {
      setLoading(true);
      const res = await getUserOrders(authUser._id);
      if (res?.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      enqueueSnackbar(err?.message || "Failed to load dashboard data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [authUser?._id, enqueueSnackbar]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalReceived = orders.length;
  const totalDelivered = orders.filter(
    (o) => o.status?.toLowerCase() === "delivered"
  ).length;
  const totalPending = orders.filter((o) =>
    ["pending", "confirmed", "shipped", "processing"].includes(o.status?.toLowerCase())
  ).length;

  const totalRevenue = orders
    .filter((o) => o.status?.toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const statCards = [
    {
      title: "Orders Received",
      value: totalReceived,
      subtext: "Total orders placed",
      icon: <MdShoppingCart className="text-2xl text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40",
      textColor: "text-blue-700 dark:text-blue-300",
      link: "/user-profile/orders",
    },
    {
      title: "Orders Delivered",
      value: totalDelivered,
      subtext: "Successfully delivered",
      icon: <MdCheckCircle className="text-2xl text-green-600 dark:text-green-400" />,
      bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40",
      textColor: "text-green-700 dark:text-green-300",
      link: "/user-profile/orders",
    },
    {
      title: "Orders Pending",
      value: totalPending,
      subtext: "In progress / shipping",
      icon: <MdPendingActions className="text-2xl text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40",
      textColor: "text-amber-700 dark:text-amber-300",
      link: "/user-profile/orders",
    },
    {
      title: "Total Spent",
      value: `₹${formatNumberWithCommas(totalRevenue)}`,
      subtext: "Total amount paid",
      icon: <MdAttachMoney className="text-2xl text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40",
      textColor: "text-purple-700 dark:text-purple-300",
      link: "/user-profile/payments",
    },
  ];

  if (loading) {
    return <BuffaloLoader variant="inline" text="Loading metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1E88E5] via-[#00ACC1] to-[#43A047] text-white rounded-xl p-5 sm:p-6 shadow-md flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome back, {authUser?.firstName || authUser?.username || "Valued Customer"}! 👋
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Here is your account overview and recent activity stats.
          </p>
        </div>
        <Link
          to="/products"
          className="hidden sm:flex items-center gap-2 bg-white text-[#1E88E5] px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition whitespace-nowrap text-sm"
        >
          <MdLocalShipping /> Shop Essentials
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate(card.link)}
            className={`p-4 sm:p-5 rounded-xl border ${card.bg} shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between group`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                  {card.title}
                </p>
                <h3 className={`text-2xl sm:text-3xl font-extrabold mt-1.5 ${card.textColor} truncate`}>
                  {card.value}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/30 backdrop-blur-xs shadow-xs shrink-0">
                {card.icon}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
              <span className="truncate max-w-[65%]">{card.subtext}</span>
              <span className="flex items-center gap-1 text-[#1E88E5] dark:text-pink-400 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 whitespace-nowrap">
                View <MdArrowForward />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Access & Recent Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-500/20 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <MdShoppingCart className="text-[#1E88E5] dark:text-pink-400" /> Recent Orders
            </h2>
            <Link
              to="/user-profile/orders"
              className="text-xs font-semibold text-[#1E88E5] dark:text-pink-400 hover:underline flex items-center gap-1"
            >
              View All Orders <MdArrowForward />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="mb-2">No orders placed yet.</p>
              <Link
                to="/products"
                className="inline-block px-4 py-2 bg-[#1E88E5] text-white text-xs font-semibold rounded hover:bg-[#1565C0] transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate("/user-profile/orders")}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">
                      Order #{order._id?.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt || Date.now()).toLocaleDateString()} • {order.productsData?.length || 1} items
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-1">
                      ₹{formatNumberWithCommas(order.totalAmount || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Shortcuts - Grid Action Cards */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-4">
          <h2 className="text-lg font-extrabold text-[#0F2742] dark:text-white mb-2">
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
                  <p className="text-sm font-bold text-[#0F2742] dark:text-white">Account Details</p>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">Edit name, email & phone</p>
                </div>
              </div>
              <MdArrowForward className="text-gray-400 group-hover:text-[#1E88E5] group-hover:translate-x-1 transition" />
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
                  <p className="text-sm font-bold text-[#0F2742] dark:text-white">Saved Addresses</p>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">Manage delivery locations</p>
                </div>
              </div>
              <MdArrowForward className="text-gray-400 group-hover:text-[#43A047] group-hover:translate-x-1 transition" />
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
                  <p className="text-sm font-bold text-[#0F2742] dark:text-white">My Wishlist</p>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">Saved favorite dairy items</p>
                </div>
              </div>
              <MdArrowForward className="text-gray-400 group-hover:text-[#00ACC1] group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
