import React, { useContext, useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import { FaHourglassHalf, FaBoxOpen, FaShippingFast, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaGlassWhiskey, FaShoppingCart } from "react-icons/fa";
import CloseIcon from '@mui/icons-material/Close';
import { UserOrderContext } from "../../context/UserOrderProvider";
import { enqueueSnackbar } from "notistack";
import BuffaloLoader from "../../components/BuffaloLoader";

import Slide from '@mui/material/Slide';
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { socket } from "../../socket/socket";
import { getProductImage } from "../../utils/helper";
import { cancelOrderApi } from "../../services/orderService";

import api from "../../services/api";
import { formatOrderDate, formatFullAddress } from "../../utils/dateUtils";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MyOrders() {

  const { userOrders, orderLoading } = useContext(UserOrderContext);
  const { authUser } = useContext(UserAuthContext);
  const { authAdmin } = useContext(AdminAuthContext);
  const currentUser = authUser || authAdmin;

  const orderStats = {
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
    Confirmed: 0,
  };

  userOrders?.forEach(order => {
    if (orderStats[order?.status] !== undefined) {
      orderStats[order?.status]++;
    }
  });

  const statCards = [
    { title: "All", count: userOrders?.length, color: "bg-gray-600/30 text-gray-300", icon: <FaGlassWhiskey /> },
    { title: "Confirmed", count: orderStats.Confirmed, color: "bg-blue-600/30 text-blue-600", icon: <FaCheckCircle /> },
    { title: "Pending", count: orderStats.Pending, color: "bg-yellow-500/30 text-yellow-500", icon: <FaHourglassHalf /> },
    { title: "Processing", count: orderStats.Processing, color: "bg-blue-400/30 text-blue-400", icon: <FaBoxOpen /> },
    { title: "Shipped", count: orderStats.Shipped, color: "bg-purple-500/30 text-purple-500", icon: <FaShippingFast /> },
    { title: "Delivered", count: orderStats.Delivered, color: "bg-green-600/30 text-green-600", icon: <FaCheckCircle /> },
    { title: "Cancelled", count: orderStats.Cancelled, color: "bg-red-500/30 text-red-500", icon: <FaTimesCircle /> },
  ];

  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(statCards[0]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusTypeUpdate = ({ success, message }) => {
    if (success) {
      enqueueSnackbar(message, { variant: "success" });
      setSelectedOrder(null);
    } else {
      enqueueSnackbar(message, { variant: "error" });
    }
    setLoading(false);
  }

  useEffect(() => {
    socket.on("order:update-delivered-status", handleStatusTypeUpdate);

    return () => {
      socket.off("order:update-delivered-status", handleStatusTypeUpdate);
    }
  }, []);

  const handleOrderReceived = () => {

    if (!selectedOrder) {
      enqueueSnackbar("No order selected!", { variant: "error" });
      return;
    }

    if (!currentUser) {
      enqueueSnackbar("User not authenticated!", { variant: "error" });
      return;
    }

    setLoading(true);
    socket.emit("order:delivered", {
      orderId: selectedOrder?._id,
      status: "Delivered",
      userId: currentUser?._id,
    });
  };

  const handleUserCancelOrder = async (orderId) => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await cancelOrderApi(orderId);
      if (res?.success) {
        enqueueSnackbar("Order cancelled successfully!", { variant: "info" });
        if (socket && socket.connected) {
          socket.emit("user:cancel-order", { orderId, userId: currentUser?._id });
        }
        window.location.reload();
      } else {
        enqueueSnackbar(res?.message || "Failed to cancel order.", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Error cancelling order.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaHourglassHalf className="text-yellow-500" />;
      case "Processing":
        return <FaBoxOpen className="text-blue-500" />;
      case "Shipped":
        return <FaShippingFast className="text-purple-500" />;
      case "Delivered":
        return <FaCheckCircle className="text-green-600" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500" />;
      case "Confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredOrders = (selectedStatus?.title === "All")
    ? userOrders
    : userOrders.filter((order) => order?.status === selectedStatus?.title);

  let content;
  if (orderLoading) {
    content = <BuffaloLoader variant="inline" text="Loading orders..." />;
  } else if (!filteredOrders || filteredOrders?.length === 0) {
    content = (
      <div className="text-center text-gray-600 dark:text-gray-300 py-16 w-full">
        {selectedStatus.title === "All"
          ? "You haven't placed any orders yet."
          : `No ${selectedStatus?.title.toLowerCase()} orders found.`}
      </div>
    );
  } else {
    content = (
      <div className="space-y-4 pt-1">
        {filteredOrders?.map((order) => (
          <div
            key={order?._id}
            onClick={() => setSelectedOrder(order)}
            className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80 dark:border-gray-700/80 hover:border-[#6C5CE7] dark:hover:border-purple-500 transition-all cursor-pointer space-y-3 group"
          >
            {/* Top Bar: Order ID, Date, Status Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#6C5CE7] bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                  #{order?.orderId || `MD-${order?._id?.slice(-6).toUpperCase()}`}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {formatOrderDate(order?.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {getStatusIcon(order?.status)}
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100">
                  {order?.status}
                </span>
              </div>
            </div>

            {/* Middle Section: Item Preview & Short Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Product Thumbnail Preview */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 shrink-0 overflow-hidden">
                  {order?.productsData?.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={getProductImage(item?.productId || { name: item?.productName })}
                      alt={item?.productId?.name || item?.productName || "Product"}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 object-cover rounded-xl border-2 border-white dark:border-gray-800 shadow-xs"
                    />
                  ))}
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                    {order?.productsData?.[0]?.productId?.name || order?.productsData?.[0]?.productName || "Dairy Products"}
                    {order?.productsData?.length > 1 && (
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                        +{order?.productsData?.length - 1} more
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Total Items: <span className="font-extrabold text-gray-700 dark:text-gray-200">{order?.productsData?.reduce((acc, p) => acc + (p?.productQuantity || 1), 0)}</span>
                  </p>
                </div>
              </div>

              {/* Delivery Location Summary */}
              <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-gray-800 dark:text-gray-200">
                  <span>Deliver to:</span>
                  <span className="truncate">{order?.address?.name || "Customer"}</span>
                  {order?.address?.addressType && (
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-purple-100 text-[#6C5CE7] dark:bg-purple-900/40 dark:text-purple-300">
                      {order?.address?.addressType}
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                  {[order?.address?.hno, order?.address?.village || order?.address?.streetAddress, order?.address?.city].filter(Boolean).join(", ") || formatFullAddress(order?.address)}
                </p>
              </div>
            </div>

            {/* Bottom Row: Total Price & View Details Button */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Total Amount</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  &#8377;{(order?.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-extrabold text-[#6C5CE7] bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition cursor-pointer"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 pb-4 mb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
            My Orders
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            View and manage your recent order history and status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 py-1 max-w-full">
          {statCards?.map((card, idx) => {
            const isSelected = selectedStatus?.title === card?.title;
            return (
              <button
                key={card?.title || idx}
                onClick={() => setSelectedStatus(card)}
                className={`
                  flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shrink-0
                  transition-all duration-200 border cursor-pointer
                  ${
                    isSelected
                      ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-xs"
                      : "bg-gray-100/90 hover:bg-gray-200 dark:bg-gray-700/70 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200/90 dark:border-gray-600/80"
                  }
                `}
              >
                {card.icon}
                <span>{card.title}</span>
                <span
                  className={`px-1.5 py-0.1 text-[10px] rounded-full font-extrabold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200"
                  }`}
                >
                  {card.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        {content}
      </div>

      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            className: "!bg-white dark:!bg-gray-900 !rounded-3xl !shadow-2xl !p-0 !overflow-hidden",
          },
          backdrop: {
            className: "!bg-black/50 !backdrop-blur-xs",
          },
        }}
      >
        {selectedOrder && (
          <div className="flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#6C5CE7] dark:text-purple-300">
                  <FaShoppingCart size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      Order Details
                    </h3>
                    <span className="text-xs font-mono font-black text-[#6C5CE7] bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                      #{selectedOrder?.orderId || `MD-${selectedOrder?._id?.slice(-6).toUpperCase()}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Ordered on: {formatOrderDate(selectedOrder?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {getStatusIcon(selectedOrder?.status)}
                  <span>{selectedOrder?.status}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Delivery Address & Recipient */}
              <div className="text-xs text-gray-700 dark:text-gray-300 bg-purple-50/50 dark:bg-gray-800/60 p-4 rounded-2xl border border-purple-100 dark:border-gray-700 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm">
                    <strong className="text-gray-900 dark:text-white">Recipient:</strong> {selectedOrder?.address?.name || "Customer"}{" "}
                    <span className="text-gray-500 font-medium ml-1">📞 ({selectedOrder?.address?.phone || "N/A"})</span>
                  </p>
                  {selectedOrder?.address?.addressType && (
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-purple-100 text-[#6C5CE7] dark:bg-purple-900/40 dark:text-purple-300 rounded border border-purple-200">
                      {selectedOrder?.address?.addressType}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Delivery Address:</strong>{" "}
                  {formatFullAddress(selectedOrder?.address)}
                </p>
              </div>

              {/* Delivery Precautions Banner */}
              {selectedOrder?.deliveryInstructions && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-0.5">
                  <div className="flex items-center gap-1 font-extrabold uppercase text-amber-800 dark:text-amber-300 text-[11px] tracking-wider">
                    <span>⚠️</span>
                    <span>Delivery Precautions & Instructions:</span>
                  </div>
                  <p className="font-semibold leading-relaxed text-amber-950 dark:text-amber-100">
                    &ldquo;{selectedOrder.deliveryInstructions}&rdquo;
                  </p>
                </div>
              )}

              {/* Itemized Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700 uppercase">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {selectedOrder?.productsData?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={getProductImage(item?.productId || { name: item?.productName })}
                            alt={item?.productId?.name || item?.productName || "Product"}
                            className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {item?.productId?.name || item?.productName || "Madhur Dairy Product"}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Unit: {item?.productId?.quantityUnit || "Pack"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-gray-800 dark:text-gray-200">
                          {item?.productQuantity}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-600 dark:text-gray-300">
                          &#8377;{(item?.productPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-gray-900 dark:text-white">
                          &#8377;{((item?.productPrice || 0) * (item?.productQuantity || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Summary */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <FaMoneyBillWave className="text-emerald-500 text-base" />
                  <span>Payment Mode: <strong className="text-gray-900 dark:text-white">{selectedOrder?.paymentMode}</strong></span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 font-medium block">Total Paid / Payable</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    &#8377;{(selectedOrder?.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {(selectedOrder?.status === "Pending" || selectedOrder?.status === "Confirmed") && (
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleUserCancelOrder(selectedOrder?._id);
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 text-xs font-extrabold rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 transition cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}

                {selectedOrder?.status === "Confirmed" && (
                  <button
                    disabled={loading}
                    onClick={handleOrderReceived}
                    className="px-4 py-2 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                  >
                    {loading ? "Updating..." : "✓ Mark Order Received"}
                  </button>
                )}

                {selectedOrder?.status === "Delivered" && (
                  <a
                    href={`${api.defaults.baseURL || 'http://localhost:9000'}/pdf/generate-bill/${selectedOrder?._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs transition"
                  >
                    <FaShoppingCart /> Download Official Invoice
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}


