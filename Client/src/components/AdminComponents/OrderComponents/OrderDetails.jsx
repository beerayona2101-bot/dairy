import React, { useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDebounce } from "use-debounce";
import { useSnackbar } from "notistack";
import { Avatar, Menu, MenuItem } from "@mui/material";
import { FilterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { SidebarContext } from "../../../context/SidebarProvider";
import { filterOrdersBySearch } from "../../../utils/filterOrders";
import { socket } from "../../../socket/socket";
import { updateOrderStatusApi, cancelOrderApi } from "../../../services/orderService";
import { formatNumberWithCommas } from "../../../utils/format";
import { getProductImage } from "../../../utils/helper";
import { AdminOrderContext } from "../../../context/AdminOrderProvider";
import { formatFullAddress } from "../../../utils/dateUtils";

const statusLevels = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Shipped: 3,
  Delivered: 4,
  Cancelled: 99,
};

export default function OrderDetails({ allOrders = [], loading, statusFilter, handleStatusFilter }) {
  const { enqueueSnackbar } = useSnackbar();
  const { navbarInput, highlightMatch } = useContext(SidebarContext);
  const { setAllOrders, refetchAllOrders } = useContext(AdminOrderContext);

  const [debouncedSearchText] = useDebounce(navbarInput, 300);
  const [localOrders, setLocalOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [sortOption, setSortOption] = useState("latest");

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Sync localOrders whenever allOrders or sortOption changes
  useEffect(() => {
    if (!Array.isArray(allOrders)) {
      setLocalOrders([]);
      return;
    }

    const sorted = [...allOrders];
    if (sortOption === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
    } else if (sortOption === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0));
    } else if (sortOption === "amountHigh") {
      sorted.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
    } else if (sortOption === "amountLow") {
      sorted.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
    }
    setLocalOrders(sorted);
  }, [allOrders, sortOption]);

  const handleOrderUpdateFailed = useCallback(
    ({ message }) => {
      enqueueSnackbar(message || "Failed to update order status.", { variant: "error" });
      setProcessingId(null);
    },
    [enqueueSnackbar]
  );

  const handleOrderUpdateSuccess = useCallback(
    ({ message, status }) => {
      enqueueSnackbar(message || `Order status updated to ${status}.`, { variant: "success" });
      setProcessingId(null);
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    socket.on("order:update-status-failed", handleOrderUpdateFailed);
    socket.on("order:update-status-success", handleOrderUpdateSuccess);

    return () => {
      socket.off("order:update-status-failed", handleOrderUpdateFailed);
      socket.off("order:update-status-success", handleOrderUpdateSuccess);
    };
  }, [handleOrderUpdateFailed, handleOrderUpdateSuccess]);

  const handleUpdateOrderStatus = async (orderId, currentStatus, newStatus, userId) => {
    if (!orderId || !newStatus || currentStatus === newStatus) return;

    // Rule: Cancellation is ONLY permitted while order is Pending. Once Confirmed, order cannot be cancelled.
    if (newStatus === "Cancelled" && currentStatus !== "Pending") {
      enqueueSnackbar("Orders cannot be cancelled once confirmed or delivered. Cancellation is only available for Pending orders.", {
        variant: "warning",
      });
      return;
    }

    setProcessingId({ orderId, status: newStatus });

    try {
      let res;
      if (newStatus === "Cancelled") {
        res = await cancelOrderApi(orderId);
      } else {
        res = await updateOrderStatusApi(orderId, newStatus);
      }

      if (res?.success) {
        if (socket && socket.connected) {
          socket.emit(newStatus === "Cancelled" ? "order:reject" : "order:accept", {
            orderId,
            status: newStatus,
            userId,
            date: new Date().toISOString(),
          });
        }

        enqueueSnackbar(`Order updated to "${newStatus}"!`, { variant: "success" });

        // Update local state immediately
        setLocalOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );

        // Update context state
        if (typeof setAllOrders === "function") {
          setAllOrders((prev) =>
            prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
          );
        }

        // Trigger refetch if available
        if (typeof refetchAllOrders === "function") {
          refetchAllOrders();
        }
      } else {
        enqueueSnackbar(res?.message || "Failed to update order status.", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Error updating order status.", { variant: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const filterOptions = [
    { value: "latest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "amountHigh", label: "High to Low Amount" },
    { value: "amountLow", label: "Low to High Amount" },
  ];

  const filteredOrders = filterOrdersBySearch(localOrders, debouncedSearchText);
  const statusFilteredOrders =
    statusFilter === "All"
      ? filteredOrders
      : filteredOrders.filter((order) => order.status === statusFilter);

  // Dynamic active tab colors - Brand Blue Palette
  const getTabActiveStyle = (status) => {
    switch (status) {
      case "All":
        return "bg-[#1E88E5] text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/30";
      case "Pending":
        return "bg-[#1E88E5] text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-400/30";
      case "Confirmed":
        return "bg-[#1E88E5] text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-400/30";
      case "Processing":
        return "bg-[#1565C0] text-white shadow-md shadow-navy-600/20 ring-2 ring-indigo-400/30";
      case "Shipped":
        return "bg-[#1E88E5] text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-400/30";
      case "Delivered":
        return "bg-[#1E88E5] text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-400/30";
      case "Cancelled":
        return "bg-slate-700 text-white shadow-md shadow-slate-500/20 ring-2 ring-slate-400/30";
      default:
        return "bg-[#1E88E5] text-white shadow-md";
    }
  };

  const getStatusBadgeClass = (status) => {
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

  const allStatuses = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
  const updateableStatuses = [
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Processing (Packing)", value: "Processing" },
    { label: "Shipped (In Transit)", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  let content;
  if (loading) {
    content = (
      <div className="flex items-center justify-center py-20 text-gray-600 dark:text-white gap-3">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-[#1E88E5]" />
        <span className="text-base font-semibold">Loading orders data...</span>
      </div>
    );
  } else if (!statusFilteredOrders?.length) {
    content = (
      <div className="py-16 text-center text-gray-500 dark:text-gray-300 space-y-1">
        <p className="text-base font-semibold">No orders found for &ldquo;{statusFilter}&rdquo;</p>
        <p className="text-xs text-gray-400">Try selecting another status tab or clear search filter.</p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {statusFilteredOrders.map((order) => {
          const { address, productsData = [], totalAmount, status = "Pending", createdAt, _id, paymentMode } = order;
          const owner = address?.owner;
          const isProcessing = processingId?.orderId === _id;
          const currentLevel = statusLevels[status] ?? 0;
          const isFinal = status === "Delivered" || status === "Cancelled";

          return (
            <div
              key={_id}
              className="bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/90 text-gray-800 dark:text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-all"
            >
              {/* Card Header: Customer Info & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar src={owner?.photo} alt={owner?.firstName} className="!w-10 !h-10 border border-gray-200" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/admin/customers/${owner?._id}/orders-history`}
                        className="font-bold text-gray-900 dark:text-white hover:text-[#6C5CE7] transition"
                      >
                        {highlightMatch(owner?.firstName, navbarInput)} {highlightMatch(owner?.lastName, navbarInput)}
                      </Link>
                      <span className="text-[11px] font-mono font-black text-[#6C5CE7] bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        #{order?.orderId || `MD-${_id?.slice(-6).toUpperCase()}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Phone: <span className="font-semibold text-gray-700 dark:text-gray-300">{owner?.mobileNo || address?.phone || "N/A"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadgeClass(status)}`}>
                    {status}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p>
                    <strong className="text-gray-800 dark:text-gray-100">Recipient:</strong> {address?.name || "Customer"}{" "}
                    <span className="text-gray-500 font-normal">({address?.phone || "N/A"})</span>
                  </p>
                  {address?.addressType && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded border border-blue-200">
                      {address?.addressType}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">
                  <strong className="text-gray-800 dark:text-gray-100">Full Delivery Address:</strong>{" "}
                  {highlightMatch(formatFullAddress(address), navbarInput)}
                </p>
              </div>

              {/* Order Products Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700/60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700 uppercase">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {productsData.map((item, idx) => {
                      const prod = item?.productId || item;
                      const qty = item?.productQuantity || item?.quantity || 1;
                      const price = item?.productPrice || prod?.price || 0;
                      return (
                        <tr key={prod?._id || idx} className="text-gray-800 dark:text-gray-200">
                          <td className="py-2 px-3 font-semibold flex items-center gap-2">
                            <img
                              src={getProductImage(prod)}
                              alt={prod?.name}
                              className="w-7 h-7 object-cover rounded border shrink-0"
                            />
                            <span className="line-clamp-1">{prod?.name || item?.productName || "Dairy Product"}</span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold">{qty}</td>
                          <td className="py-2 px-3 text-right">&#8377;{formatNumberWithCommas(price)}</td>
                          <td className="py-2 px-3 text-right font-bold text-[#1E88E5] dark:text-blue-400">
                            &#8377;{formatNumberWithCommas(qty * price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Toolbar: One-Way Sequential Action Buttons & Dropdown */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">
                    Total: &#8377;{formatNumberWithCommas(totalAmount)}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200">
                    {paymentMode || "COD"}
                  </span>
                </div>

                {/* Status Update Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Status:
                  </span>

                  {/* Step Quick Action Buttons based on current status */}
                  {status === "Pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(_id, status, "Confirmed", owner?._id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircleIcon sx={{ fontSize: "0.9rem" }} /> Confirm Order
                      </button>

                      <button
                        onClick={() => handleUpdateOrderStatus(_id, status, "Cancelled", owner?._id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <CancelIcon sx={{ fontSize: "0.9rem" }} /> Reject / Cancel
                      </button>
                    </div>
                  )}

                  {status === "Confirmed" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(_id, status, "Processing", owner?._id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <InventoryIcon sx={{ fontSize: "0.9rem" }} /> Pack & Process Order
                      </button>
                    </div>
                  )}

                  {status === "Processing" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(_id, status, "Shipped", owner?._id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <LocalShippingIcon sx={{ fontSize: "0.9rem" }} /> Mark as Shipped
                      </button>
                    </div>
                  )}

                  {status === "Shipped" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(_id, status, "Delivered", owner?._id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircleIcon sx={{ fontSize: "0.9rem" }} /> Mark as Delivered
                      </button>
                    </div>
                  )}

                  {/* Native Dropdown Selector - Locked for Delivered & Cancelled, Cancel only allowed in Pending */}
                  {status !== "Delivered" && status !== "Cancelled" && (
                    <select
                      value={status}
                      disabled={isProcessing}
                      onChange={(e) => handleUpdateOrderStatus(_id, status, e.target.value, owner?._id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {(status === "Pending"
                        ? [
                            { label: "Pending", value: "Pending" },
                            { label: "Confirmed", value: "Confirmed" },
                            { label: "Cancelled", value: "Cancelled" },
                          ]
                        : status === "Confirmed"
                        ? [
                            { label: "Confirmed", value: "Confirmed" },
                            { label: "Processing (Packing)", value: "Processing" },
                          ]
                        : status === "Processing"
                        ? [
                            { label: "Processing (Packing)", value: "Processing" },
                            { label: "Shipped (In Transit)", value: "Shipped" },
                          ]
                        : status === "Shipped"
                        ? [
                            { label: "Shipped (In Transit)", value: "Shipped" },
                            { label: "Delivered", value: "Delivered" },
                          ]
                        : [{ label: status, value: status }]
                      ).map((st) => {
                        const isCurrent = st.value === status;

                        return (
                          <option
                            key={st.value}
                            value={st.value}
                            className={
                              isCurrent
                                ? "font-bold text-[#1E88E5] bg-blue-50 dark:bg-gray-800"
                                : "font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                            }
                          >
                            {isCurrent ? `✓ ${st.label}` : st.label}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {status === "Delivered" && (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-50 text-[#1E88E5] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                      ✓ Order Delivered & Completed
                    </span>
                  )}

                  {status === "Cancelled" && (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
                      Order Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-500/20 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 w-full space-y-4">
      {/* Header bar with Sort filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ReceiptLongOutlinedIcon className="text-[#1E88E5] dark:text-blue-400" />
          Orders Management
        </h2>

        <div>
          <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/60 dark:hover:bg-gray-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-gray-600 transition cursor-pointer text-gray-800 dark:text-white"
          >
            <FilterIcon size={15} />
            <span>{filterOptions.find((f) => f.value === sortOption)?.label || "Select Filter"}</span>
          </button>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose} className="mt-1">
            {filterOptions.map((filter) => (
              <MenuItem
                key={filter.value}
                onClick={() => {
                  setSortOption(filter.value);
                  handleClose();
                }}
                className={`text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  sortOption === filter.value ? "font-bold text-[#1E88E5] dark:text-blue-400" : ""
                }`}
              >
                {filter.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>

      {/* Dynamic Status Tabs (Color Changes After Clicking) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        {allStatuses.map((st) => {
          const isActive = statusFilter === st;
          const count =
            st === "All"
              ? filteredOrders.length
              : filteredOrders.filter((o) => o.status === st).length;

          return (
            <button
              key={st}
              onClick={() => handleStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? getTabActiveStyle(st)
                  : "bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              <span>{st}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? "bg-white/30 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {content}
    </div>
  );
}

OrderDetails.propTypes = {
  allOrders: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  statusFilter: PropTypes.string.isRequired,
  handleStatusFilter: PropTypes.func.isRequired,
};
