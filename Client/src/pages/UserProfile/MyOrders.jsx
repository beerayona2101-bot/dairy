import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, useMediaQuery, useTheme } from "@mui/material";
import { FaHourglassHalf, FaBoxOpen, FaShippingFast, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaShoppingCart } from "react-icons/fa";
import CloseIcon from '@mui/icons-material/Close';
import { UserOrderContext } from "../../context/UserOrderProvider";
import { CartContext } from "../../context/CartProvider";
import { enqueueSnackbar } from "notistack";
import BuffaloLoader from "../../components/BuffaloLoader";

import Slide from '@mui/material/Slide';
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { socket } from "../../socket/socket";
import { getProductImage } from "../../utils/helper";
import { cancelOrderApi } from "../../services/orderService";

import api from "../../services/api";
import { formatOrderDate, formatFullAddress } from "../../utils/dateUtils";
import OrderStatusTracker from "../../components/OrderStatusTracker";
import { ChevronRight, Headphones } from "lucide-react";


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MyOrders() {
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { userOrders, orderLoading } = useContext(UserOrderContext);
  const { addToCart } = useContext(CartContext);
  const { authUser } = useContext(UserAuthContext);
  const { authAdmin } = useContext(AdminAuthContext);
  const currentUser = authUser || authAdmin;

  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const activeSelectedOrder = userOrders?.find((o) => String(o?._id) === String(selectedOrder?._id)) || selectedOrder;

  const handleOrderAgain = (targetOrder, e) => {
    if (e) e.stopPropagation();

    if (!targetOrder || !Array.isArray(targetOrder.productsData) || targetOrder.productsData.length === 0) {
      enqueueSnackbar("Order details not available to re-order.", { variant: "error" });
      return;
    }

    let addedCount = 0;
    targetOrder.productsData.forEach((item) => {
      const pId = typeof item.productId === "object"
        ? (item.productId?._id || item.productId?.id)
        : item.productId;

      const qty = item.productQuantity || 1;
      const price = item.productPrice || (typeof item.productId === "object" ? item.productId?.price : 0);

      if (pId) {
        addToCart(pId, qty, price);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      enqueueSnackbar("Items added to cart! Redirecting to cart...", { variant: "success" });
      setSelectedOrder(null);
      navigate("/cart");
    } else {
      enqueueSnackbar("Could not add items to cart.", { variant: "error" });
    }
  };

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

    if (!activeSelectedOrder) {
      enqueueSnackbar("No order selected!", { variant: "error" });
      return;
    }

    if (!currentUser) {
      enqueueSnackbar("User not authenticated!", { variant: "error" });
      return;
    }

    setLoading(true);
    socket.emit("order:delivered", {
      orderId: activeSelectedOrder?._id,
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
          socket.emit("order:reject", { orderId, status: "Cancelled", userId: currentUser?._id });
        }
        setSelectedOrder(null);
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
      case "Ready to Deliver":
        return <FaShippingFast className="text-teal-500" />;
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

  const filteredOrders = userOrders;

  let content;
  if (orderLoading) {
    content = <BuffaloLoader variant="inline" text="Loading orders..." />;
  } else if (!filteredOrders || filteredOrders?.length === 0) {
    content = (
      <div className="text-center text-gray-600 dark:text-gray-300 py-16 w-full font-medium">
        You haven't placed any orders yet.
      </div>
    );
  } else {
    content = (
      <div className="space-y-4 pt-1 pb-20 sm:pb-4">
        {filteredOrders?.map((order) => {
          const statusText =
            order?.status === "Delivered"
              ? "Order delivered"
              : order?.status === "Cancelled"
              ? "Order cancelled"
              : order?.status === "Pending"
              ? "Order placed"
              : order?.status === "Processing" || order?.status === "Confirmed"
              ? "Order confirmed"
              : `Order ${order?.status?.toLowerCase() || ""}`;

          return (
            <div
              key={order?._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/90 dark:border-gray-800 hover:border-[#6C5CE7] dark:hover:border-purple-500 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                    <span>{statusText}</span>
                    {order?.status === "Delivered" ? (
                      <FaCheckCircle className="text-emerald-500 text-sm sm:text-base shrink-0" />
                    ) : order?.status === "Cancelled" ? (
                      <FaTimesCircle className="text-red-500 text-sm sm:text-base shrink-0" />
                    ) : (
                      <FaCheckCircle className="text-blue-500 text-sm sm:text-base shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 font-medium">
                    Placed at {formatOrderDate(order?.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 font-extrabold text-base sm:text-lg text-gray-900 dark:text-white shrink-0">
                  <span>&#8377;{(order?.totalAmount || 0).toFixed(2)}</span>
                  <ChevronRight size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1">
                {order?.productsData?.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="relative shrink-0">
                    <img
                      src={getProductImage(item?.productId || { name: item?.productName })}
                      alt={item?.productId?.name || item?.productName || "Product"}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/madhu_cow_milk.png";
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-gray-200/80 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-2xs"
                    />
                    {item?.productQuantity > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-gray-900 dark:bg-purple-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-xs">
                        x{item?.productQuantity}
                      </span>
                    )}
                  </div>
                ))}
                {order?.productsData?.length > 6 && (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xs font-extrabold text-gray-500 dark:text-gray-400 shrink-0">
                    +{order?.productsData?.length - 6}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                  }}
                  className="text-xs sm:text-sm font-extrabold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer flex items-center gap-1 group-hover:text-[#6C5CE7]"
                >
                  View Details <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#6C5CE7] transition" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleOrderAgain(order, e)}
                  className="text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#FF2E63] to-[#e02654] hover:brightness-105 px-4.5 py-1.5 rounded-full transition cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <FaShoppingCart className="text-xs" /> Order Again
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 pb-4 mb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
            My Orders
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            View and manage your recent order history and status.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        {content}
      </div>

      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        TransitionComponent={Transition}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            className: "!bg-gray-50 dark:!bg-gray-900 sm:!rounded-3xl !rounded-none !shadow-2xl !p-0 !overflow-hidden flex flex-col w-full h-full sm:h-auto sm:max-h-[92vh]",
          },
          backdrop: {
            className: "!bg-black/60 !backdrop-blur-md",
          },
        }}
      >
        {activeSelectedOrder && (
          <div className="flex flex-col h-full sm:max-h-[92vh] overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Header Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 bg-white dark:bg-gray-800 sticky top-0 z-20 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer text-gray-700 dark:text-gray-200"
                  aria-label="Back"
                >
                  <CloseIcon fontSize="small" />
                </button>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
                    Order #{activeSelectedOrder?.orderId || activeSelectedOrder?._id?.slice(-8)?.toUpperCase() || `ORD-1234`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {activeSelectedOrder?.productsData?.length || 0} Items
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  navigate("/contact-us");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/50 text-[#FF2E63] dark:text-pink-300 font-extrabold text-xs hover:bg-pink-100 transition cursor-pointer"
              >
                <Headphones size={14} />
                <span>Get Help</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Live Order Progress Status Tracking Timeline */}
              <OrderStatusTracker status={activeSelectedOrder?.status} />

              {/* Items in Order Section */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3 shadow-2xs">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {activeSelectedOrder?.productsData?.length || 0} items in order
                </h4>

                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {activeSelectedOrder?.productsData?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={getProductImage(item?.productId || { name: item?.productName })}
                          alt={item?.productId?.name || item?.productName || "Product"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/madhu_cow_milk.png";
                          }}
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800"
                        />
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                            {item?.productId?.name || item?.productName || "MADHU Dairy Product"}
                          </h5>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                            {item?.productQuantity}x &bull; {item?.productId?.quantityUnit || "1 unit"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-xs sm:text-sm text-gray-900 dark:text-white">
                          &#8377;{((item?.productPrice || 0) * (item?.productQuantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary Card */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3 shadow-2xs">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  📄 Bill Summary
                </h4>

                <div className="space-y-2 text-xs sm:text-sm pt-1">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>Item Total</span>
                    <span className="font-semibold">&#8377;{(activeSelectedOrder?.totalAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>Payment Mode</span>
                    <span className="font-bold text-gray-900 dark:text-white">{activeSelectedOrder?.paymentMode || "COD"}</span>
                  </div>

                  <div className="pt-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between font-black text-sm sm:text-base text-gray-900 dark:text-white">
                    <span>Total Bill</span>
                    <span className="text-emerald-600 dark:text-emerald-400">&#8377;{(activeSelectedOrder?.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                {activeSelectedOrder?.status === "Delivered" && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <a
                      href={`${api.defaults.baseURL || 'http://localhost:9000'}/pdf/generate-bill/${activeSelectedOrder?._id}?print=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-purple-100 text-[#6C5CE7] hover:bg-purple-200 dark:bg-purple-950/80 dark:text-purple-300 transition shadow-2xs cursor-pointer"
                    >
                      Download Invoice / Credit Note
                    </a>
                  </div>
                )}
              </div>

              {/* Order Details Card */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-3 text-xs sm:text-sm shadow-2xs">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2">
                  Order Details
                </h4>

                <div>
                  <span className="text-gray-400 dark:text-gray-500 font-semibold block text-[11px]">Order ID</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-gray-800 dark:text-gray-200">
                    <span>#{activeSelectedOrder?.orderId || activeSelectedOrder?._id}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeSelectedOrder?.orderId || activeSelectedOrder?._id);
                        enqueueSnackbar("Order ID copied to clipboard!", { variant: "success" });
                      }}
                      className="text-gray-400 hover:text-purple-600 transition cursor-pointer"
                      title="Copy Order ID"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 dark:text-gray-500 font-semibold block text-[11px]">Receiver Details</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {activeSelectedOrder?.address?.name || "Customer"}, {activeSelectedOrder?.address?.phone || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 dark:text-gray-500 font-semibold block text-[11px]">Delivery Address</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                    {formatFullAddress(activeSelectedOrder?.address)}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 dark:text-gray-500 font-semibold block text-[11px]">Order Placed at</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {formatOrderDate(activeSelectedOrder?.createdAt)}
                  </p>
                </div>

                {activeSelectedOrder?.status === "Delivered" && (
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 font-semibold block text-[11px]">Order Arrived at</span>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      {formatOrderDate(activeSelectedOrder?.updatedAt || activeSelectedOrder?.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/80 dark:bg-gray-900/90 backdrop-blur-md flex items-center justify-between gap-3 sticky bottom-0 z-20 shrink-0 rounded-b-[24px]">
              {(activeSelectedOrder?.status === "Pending" || activeSelectedOrder?.status === "Confirmed") && (
                <button
                  disabled={loading}
                  onClick={() => {
                    handleUserCancelOrder(activeSelectedOrder?._id);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-3 px-3 text-xs sm:text-sm font-extrabold rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60 dark:hover:bg-rose-900/60 transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                >
                  <FaTimesCircle className="text-sm shrink-0" /> Cancel Order
                </button>
              )}

              {activeSelectedOrder?.status === "Confirmed" && (
                <button
                  disabled={loading}
                  onClick={handleOrderReceived}
                  className="flex-1 py-3 px-3 text-xs sm:text-sm font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <FaCheckCircle className="text-sm shrink-0" /> Mark Received
                </button>
              )}

              <button
                type="button"
                onClick={(e) => handleOrderAgain(activeSelectedOrder, e)}
                className="flex-1 py-3 px-3 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-[#FF2E63] to-[#e02654] hover:brightness-105 text-white transition cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98 whitespace-nowrap"
              >
                <FaShoppingCart className="text-sm shrink-0" /> Order Again
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}


