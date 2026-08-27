import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InventoryIcon from "@mui/icons-material/Inventory";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

import { socket } from "../../../socket/socket";
import { formatNumberWithCommas } from "../../../utils/format";

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function LiveUpdatesDashboard({ allOrders = [], stores = [], loading }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [liveEvents, setLiveEvents] = useState([]);

  // Generate initial events feed from orders and stores
  useEffect(() => {
    const events = [];

    // Add Order events
    (allOrders || []).forEach((order) => {
      const { _id, address, totalAmount, status, createdAt, productsData } = order;
      const customerName = address?.name || address?.owner?.firstName || "Customer";

      events.push({
        id: `order-${_id}`,
        type: "order",
        orderId: _id,
        status: status || "Pending",
        title: getOrderTitle(status, customerName, totalAmount),
        subtitle: `${productsData?.length || 1} product(s) • Total: ₹${formatNumberWithCommas(totalAmount || 0)}`,
        timestamp: new Date(createdAt || Date.now()),
        customerName,
        userId: address?.owner?._id || address?.owner,
        isNew: false,
      });
    });

    // Add Customer registration events
    (stores || []).forEach((store) => {
      const name = `${store.firstName || "New"} ${store.lastName || "Customer"}`;
      events.push({
        id: `user-${store._id}`,
        type: "user",
        userId: store._id,
        title: `New Customer Registered: ${name}`,
        subtitle: `Phone: ${store.mobileNo || "N/A"} • ${store.role || "Customer"}`,
        timestamp: new Date(store.createdAt || Date.now()),
        isNew: false,
      });
    });

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp - a.timestamp);
    setLiveEvents(events);
  }, [allOrders, stores]);

  // Listen to real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      const newEv = {
        id: `live-order-${Date.now()}`,
        type: "order",
        orderId: data?.orderId || data?._id,
        status: data?.status || "Pending",
        title: `⚡ Live New Order #${data?.orderId?.slice(-6) || "Placed"}`,
        subtitle: `Total: ₹${formatNumberWithCommas(data?.totalAmount || 0)} • Just Now`,
        timestamp: new Date(),
        isNew: true,
      };
      setLiveEvents((prev) => [newEv, ...prev]);
    };

    const handleStatusUpdate = (data) => {
      const newEv = {
        id: `live-status-${Date.now()}`,
        type: "order",
        orderId: data?.orderId,
        status: data?.status,
        title: `🔔 Order Status Updated to "${data?.status}"`,
        subtitle: `Order #${data?.orderId?.slice(-6) || ""} • Live Update`,
        timestamp: new Date(),
        isNew: true,
      };
      setLiveEvents((prev) => [newEv, ...prev]);
    };

    const handleNewUser = (data) => {
      const newEv = {
        id: `live-user-${Date.now()}`,
        type: "user",
        userId: data?._id,
        title: `👤 Live User Signup: ${data?.firstName || "Customer"}`,
        subtitle: `Mobile: ${data?.mobileNo || "N/A"} • Just Registered`,
        timestamp: new Date(),
        isNew: true,
      };
      setLiveEvents((prev) => [newEv, ...prev]);
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:accept", handleStatusUpdate);
    socket.on("order:reject", handleStatusUpdate);
    socket.on("order:status-updated", handleStatusUpdate);
    socket.on("user:registered", handleNewUser);

    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:accept", handleStatusUpdate);
      socket.off("order:reject", handleStatusUpdate);
      socket.off("order:status-updated", handleStatusUpdate);
      socket.off("user:registered", handleNewUser);
    };
  }, []);

  function getOrderTitle(status, name, amount) {
    switch (status) {
      case "Pending":
        return `New Order from ${name} (₹${formatNumberWithCommas(amount || 0)})`;
      case "Confirmed":
        return `Order Confirmed for ${name}`;
      case "Processing":
        return `Order Packing & Processing (${name})`;
      case "Shipped":
        return `Order Shipped to ${name}`;
      case "Delivered":
        return `Order Delivered to ${name}`;
      case "Cancelled":
        return `Order Cancelled (${name})`;
      default:
        return `Order Update: ${name}`;
    }
  }

  const getEventIcon = (event) => {
    if (event.type === "user") {
      return <PersonAddIcon className="text-[#1E88E5] dark:text-blue-400" />;
    }
    switch (event.status) {
      case "Pending":
        return <ShoppingBagIcon className="text-[#1E88E5] dark:text-sky-400" />;
      case "Confirmed":
        return <CheckCircleIcon className="text-[#1E88E5] dark:text-blue-400" />;
      case "Processing":
        return <InventoryIcon className="text-[#1565C0] dark:text-indigo-300" />;
      case "Shipped":
        return <LocalShippingIcon className="text-[#1E88E5] dark:text-sky-400" />;
      case "Delivered":
        return <CheckCircleIcon className="text-[#1E88E5] dark:text-blue-400" />;
      case "Cancelled":
        return <CancelIcon className="text-slate-500 dark:text-slate-400" />;
      default:
        return <ShoppingBagIcon className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getBadgeClass = (status, type) => {
    if (type === "user") {
      return "bg-blue-100 text-[#1E88E5] dark:bg-blue-950/60 dark:text-blue-300 border-blue-300";
    }
    switch (status) {
      case "Pending":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300";
      case "Confirmed":
        return "bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200 border-blue-400";
      case "Processing":
        return "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 border-indigo-300";
      case "Shipped":
        return "bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300";
      case "Delivered":
        return "bg-blue-100 text-[#1E88E5] dark:bg-blue-950/60 dark:text-blue-300 border-blue-300";
      case "Cancelled":
        return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300";
    }
  };

  // Filter events
  const filteredEvents = liveEvents.filter((ev) => {
    if (filter === "All") return true;
    if (filter === "New Users") return ev.type === "user";
    if (filter === "Pending Orders") return ev.status === "Pending";
    if (filter === "Shipped") return ev.status === "Shipped";
    if (filter === "Delivered") return ev.status === "Delivered";
    if (filter === "Cancelled") return ev.status === "Cancelled";
    return true;
  });

  const filterTabs = ["All", "Pending Orders", "Shipped", "Delivered", "Cancelled", "New Users"];

  const handleEventClick = (event) => {
    if (event.type === "user") {
      navigate("/admin/customers");
    } else {
      navigate("/admin/orders");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700/80 w-full space-y-5">
      {/* Header bar with Live pulse badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SignalCellularAltIcon className="text-[#1E88E5] dark:text-blue-400" />
            <h2 className="text-xl font-extrabold text-[#0F2742] dark:text-white">
              Live Activity Timeline Feed
            </h2>
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse border border-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
            Real-time activity feed for orders, customer signups, shipping updates, and deliveries.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-[#64748B] dark:text-gray-300 shrink-0 self-start sm:self-auto">
          {filteredEvents.length} Total Events
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1E88E5] text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-700/60 text-[#64748B] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Live Stream List - Timeline Layout */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
          <div className="w-7 h-7 border-4 border-dashed rounded-full animate-spin border-[#1E88E5]" />
          <span className="text-sm font-semibold">Loading live feed...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-gray-400 space-y-1">
          <p className="text-sm font-bold">No updates found for &ldquo;{filter}&rdquo;</p>
          <p className="text-xs">Select another filter tab or wait for live store activity.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-hide relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
          <AnimatePresence>
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                onClick={() => handleEventClick(event)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group relative ml-3 pl-8 ${
                  event.isNew
                    ? "bg-blue-50/90 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700/80 shadow-md animate-pulse"
                    : "bg-gray-50/80 hover:bg-gray-100/90 dark:bg-gray-700/40 dark:hover:bg-gray-700/70 border-gray-200/80 dark:border-gray-700/60"
                }`}
              >
                {/* Timeline Dot Marker */}
                <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#1E88E5] flex items-center justify-center shadow-xs shrink-0 z-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]" />
                </div>

                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-xs border border-gray-200/60 dark:border-gray-700 shrink-0">
                    {getEventIcon(event)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#0F2742] dark:text-white line-clamp-1 group-hover:text-[#1E88E5] dark:group-hover:text-blue-400 transition">
                        {event.title}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getBadgeClass(event.status, event.type)}`}>
                        {event.type === "user" ? "New User" : event.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] dark:text-gray-400 mt-0.5 font-medium line-clamp-1">
                      {event.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-semibold text-[#64748B] dark:text-gray-400 hidden sm:block">
                    {event.timestamp instanceof Date && !isNaN(event.timestamp)
                      ? event.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Just now"}
                  </span>
                  <div className="p-1.5 rounded-xl group-hover:bg-[#1E88E5] group-hover:text-white transition">
                    <ArrowForwardIcon className="text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" sx={{ fontSize: "1.1rem" }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

LiveUpdatesDashboard.propTypes = {
  allOrders: PropTypes.array,
  stores: PropTypes.array,
  loading: PropTypes.bool,
};
