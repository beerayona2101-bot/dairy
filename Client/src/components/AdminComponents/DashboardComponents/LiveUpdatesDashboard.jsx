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

import wsManager from "../../../socket/WebSocketManager";
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
      const { _id, address, user, totalAmount, status, createdAt, productsData } = order;
      const customerName = (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) || address?.name || address?.fullName || (address?.owner?.firstName ? `${address.owner.firstName} ${address.owner.lastName || ''}`.trim() : null) || "Customer";

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
    const handleNewOrder = (data) => {
      const newEv = {
        id: `live-order-${Date.now()}`,
        type: "order",
        orderId: data?.orderId || data?._id,
        status: data?.status || "Pending",
        title: `⚡ Live New Order ${data?.orderId ? `#${data.orderId}` : "Placed"}`,
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
        subtitle: `Order ${data?.orderId ? `#${data.orderId}` : ""} • Live Update`,
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

    const handleNewEnquiry = (data) => {
      const enquiry = data?.data || data;
      const newEv = {
        id: `live-enquiry-${Date.now()}`,
        type: "user",
        title: `📩 New Enquiry from ${enquiry?.fullName || "Customer"}`,
        subtitle: `Phone: ${enquiry?.phone || "N/A"} • "${enquiry?.message?.slice(0, 30) || ""}..."`,
        timestamp: new Date(),
        isNew: true,
      };
      setLiveEvents((prev) => [newEv, ...prev]);
    };

    const unsubs = [
      wsManager.subscribe("order:new", handleNewOrder),
      wsManager.subscribe("order.created", handleNewOrder),
      wsManager.subscribe("order:accept", handleStatusUpdate),
      wsManager.subscribe("order:reject", handleStatusUpdate),
      wsManager.subscribe("order:status-updated", handleStatusUpdate),
      wsManager.subscribe("user-order:updated-status", handleStatusUpdate),
      wsManager.subscribe("admin:order-updated", handleStatusUpdate),
      wsManager.subscribe("order:global-status-update", handleStatusUpdate),
      wsManager.subscribe("order:accept-success", handleStatusUpdate),
      wsManager.subscribe("admin-order:delivered-success", handleStatusUpdate),
      wsManager.subscribe("order:reject-success", handleStatusUpdate),
      wsManager.subscribe("order.updated", handleStatusUpdate),
      wsManager.subscribe("user:registered", handleNewUser),
      wsManager.subscribe("user:new-registered", (data) => handleNewUser(data?.user || data)),
      wsManager.subscribe("enquiry.created", handleNewEnquiry),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
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

  const getMarkerColor = (event) => {
    return {
      border: "border-[#8C7CF0] dark:border-purple-400 ring-4 ring-purple-100 dark:ring-purple-950/50",
      dot: "bg-[#8C7CF0] dark:bg-purple-400",
    };
  };

  const getEventIcon = (event) => {
    if (event.type === "user") {
      return <PersonAddIcon className="text-[#8C7CF0] dark:text-purple-300 drop-shadow-xs" />;
    }
    switch (event.status) {
      case "Pending":
        return <ShoppingBagIcon className="text-[#8C7CF0] dark:text-purple-300 drop-shadow-xs" />;
      case "Confirmed":
        return <CheckCircleIcon className="text-[#8C7CF0] dark:text-purple-300 drop-shadow-xs" />;
      case "Processing":
        return <InventoryIcon className="text-[#8C7CF0] dark:text-purple-300 drop-shadow-xs" />;
      case "Shipped":
        return <LocalShippingIcon className="text-[#8C7CF0] dark:text-purple-300 drop-shadow-xs" />;
      case "Delivered":
        return <CheckCircleIcon className="text-[#8C7CF0] dark:text-purple-300 drop-shadow-xs" />;
      case "Cancelled":
        return <CancelIcon className="text-gray-500 dark:text-gray-400 drop-shadow-xs" />;
      default:
        return <ShoppingBagIcon className="text-[#8C7CF0] dark:text-purple-300 drop-shadow-xs" />;
    }
  };

  const getBadgeClass = (status, type) => {
    if (type === "user") {
      return "bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    }
    if (status === "Cancelled") {
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
    }
    return "bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
  };

  // Filter events
  const filteredEvents = liveEvents.filter((ev) => {
    if (filter === "All") return true;
    if (filter === "Pending Orders") return ev.status === "Pending";
    if (filter === "Shipped") return ev.status === "Shipped";
    if (filter === "Ready to Deliver") return ev.status === "Ready to Deliver" || ev.status === "Out for Delivery";
    if (filter === "Delivered") return ev.status === "Delivered";
    if (filter === "Cancelled") return ev.status === "Cancelled";
    if (filter === "New Users") return ev.type === "user";
    return true;
  });

  const filterTabs = ["All", "Pending Orders", "Shipped", "Ready to Deliver", "Delivered", "Cancelled", "New Users"];

  const handleEventClick = (event) => {
    if (event.type === "user") {
      navigate("/admin/customers");
    } else {
      navigate("/admin/orders");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 md:p-6 shadow-[0_4px_20px_rgba(140,124,240,0.06)] border border-purple-100/70 dark:border-gray-700/80 w-full space-y-5">
      {/* Header bar with Live pulse badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SignalCellularAltIcon className="text-[#8C7CF0] dark:text-purple-300" />
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Live Activity Timeline Feed
            </h2>
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-purple-50 text-[#8C7CF0] dark:bg-purple-950/60 dark:text-purple-300 animate-pulse border border-purple-200 dark:border-purple-800">
              <span className="w-2 h-2 rounded-full bg-[#8C7CF0] animate-ping" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
            Real-time activity feed for orders, customer signups, shipping updates, and deliveries.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#8C7CF0] dark:text-purple-300 border border-purple-100 dark:border-purple-800 shrink-0 self-start sm:self-auto">
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
                  ? "bg-[#8C7CF0] text-white shadow-md shadow-purple-500/20"
                  : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-purple-50 hover:text-[#8C7CF0] dark:hover:bg-purple-950/40"
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
          <div className="w-7 h-7 border-4 border-dashed rounded-full animate-spin border-[#8C7CF0]" />
          <span className="text-sm font-semibold">Loading live feed...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-gray-400 space-y-1">
          <p className="text-sm font-bold">No updates found for &ldquo;{filter}&rdquo;</p>
          <p className="text-xs">Select another filter tab or wait for live store activity.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-hide relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-purple-100 dark:before:bg-gray-700">
          <AnimatePresence>
            {filteredEvents.map((event, idx) => {
              const markerColors = getMarkerColor(event);

              return (
                <motion.div
                  key={`${event.id || 'event'}-${idx}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => handleEventClick(event)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group relative ml-3 pl-8 bg-white dark:bg-gray-700/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border-purple-100/80 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#8C7CF0]`}
                >
                  {/* Timeline Dot Marker */}
                  <div className={`absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 ${markerColors.border} flex items-center justify-center shadow-xs shrink-0 z-10`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${markerColors.dot}`} />
                  </div>

                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 shadow-xs border border-purple-100 dark:border-purple-800 shrink-0">
                      {getEventIcon(event)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#8C7CF0] dark:group-hover:text-purple-300 transition">
                          {event.title}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getBadgeClass(event.status, event.type)}`}>
                          {event.type === "user" ? "New User" : event.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium line-clamp-1">
                        {event.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 hidden sm:block">
                      {event.timestamp instanceof Date && !isNaN(event.timestamp)
                        ? event.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </span>
                    <div className="p-1.5 rounded-xl group-hover:bg-[#8C7CF0] group-hover:text-white transition shadow-xs">
                      <ArrowForwardIcon className="text-[#8C7CF0] group-hover:text-white transition-transform group-hover:translate-x-0.5" sx={{ fontSize: "1.1rem" }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
