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
            className="bg-gray-100 dark:bg-gray-500/10 md:rounded-lg p-3 md:p-5 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(order?.status)}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#6C5CE7] bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                    #{order?.orderId || `MD-${order?._id?.slice(-6).toUpperCase()}`}
                  </span>
                  <span className="font-semibold text-lg">{order?.status}</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300">
                {formatOrderDate(order?.createdAt)}
              </div>
            </div>

            <div className="w-full overflow-x-auto scrollbar-hide mb-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
              <table className="w-full min-w-[520px] text-xs sm:text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="p-2.5 font-bold">Image</th>
                    <th className="p-2.5 font-bold">Product</th>
                    <th className="p-2.5 font-bold">Quantity</th>
                    <th className="p-2.5 font-bold">Price</th>
                    <th className="p-2.5 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {order?.productsData?.map((product, idx) => (
                    <tr
                      key={product?.productId?._id || idx}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition"
                    >
                      <td className="p-2.5">
                        <img
                          src={getProductImage(product?.productId || { name: product?.productName })}
                          alt={product?.productId?.name || product?.productName || "Product"}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                        />
                      </td>
                      <td className="p-2.5 break-words font-medium text-gray-800 dark:text-gray-200">{product?.productId?.name || product?.productName || "Madhur Dairy Item"}</td>
                      <td className="p-2.5 break-words font-medium">{product?.productQuantity}</td>
                      <td className="p-2.5 break-words font-medium">&#8377;{(product?.productPrice || 0).toFixed(2)} / {product?.productId?.quantityUnit || "Pack"}</td>
                      <td className="p-2.5 font-bold text-gray-900 dark:text-white break-words">
                        &#8377;{(product?.productQuantity * (product?.productPrice || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-xs sm:text-sm bg-gray-50/80 dark:bg-gray-700/40 p-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200">Delivery Address</h4>
                {order?.address?.addressType && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                    {order?.address?.addressType}
                  </span>
                )}
              </div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {order?.address?.name || "Recipient"} <span className="font-semibold text-gray-500 dark:text-gray-400 text-xs ml-2">📞 {order?.address?.phone || "-"}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {formatFullAddress(order?.address)}
              </p>
            </div>

            <div className="flex flex-row flex-wrap justify-between items-center gap-3 mt-4 border-t pt-3">
              <p className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" />
                <span className="hidden sm:flex">Payment: </span>
                {order?.paymentMode}
              </p>

              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                &#8377;{order?.totalAmount}
              </p>

              {(order?.status === "Pending" || order?.status === "Confirmed") && (
                <button
                  disabled={loading}
                  onClick={() => handleUserCancelOrder(order?._id)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                >
                  Cancel Order
                </button>
              )}

              {order?.status === "Confirmed" && (
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-1.5 w-full sm:w-fit text-sm font-semibold rounded bg-green-600 hover:bg-green-700 text-white"
                >
                  Order Received
                </button>
              )}

              {order?.status === "Delivered" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`http://localhost:9000/pdf/generate-bill/${order?._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow transition"
                    title="Download Bill"
                  >
                    <FaShoppingCart /> Download Bill
                  </a>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    )
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

        <div className="flex overflow-x-auto items-center gap-1.5 scrollbar-hide py-1 max-w-full">
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
                      ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-xs"
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
        slots={{
          transition: Transition,
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "transparent",
              borderRadius: 1,
            },
          },
        }}
        fullWidth
        maxWidth="sm"
      >
        <div className="bg-white/40 dark:bg-black/50 text-black dark:text-white backdrop-blur-sm rounded-md">
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-sm px-2 py-2 flex justify-between items-center">
            <h1 className="flex items-center gap-2 font-bold text-lg">
              <FaShoppingCart className="text-[#1E88E5]" size={20} />
              Order Details
            </h1>
            <button className="hover:text-gray-200" onClick={() => setSelectedOrder(null)}>
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div className="overflow-x-auto px-3">
            <table className="w-full text-sm border-separate border-spacing-y-1">
              <thead className="text-left text-gray-700 dark:text-gray-300 font-semibold">
                <tr>
                  <th className="p-2">Product</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder?.productsData.map((item, idx) => (
                  <tr
                    key={idx * 0.5}
                    className="bg-gray-100/50 dark:bg-gray-800 rounded text-gray-900 dark:text-gray-100"
                  >
                    <td className="p-2 line-clamp-1">{item?.productId?.name}</td>
                    <td className="p-2 text-right">{item?.productQuantity}</td>
                    <td className="p-2 text-right">&#8377;{item?.productPrice}</td>
                    <td className="p-2 text-right font-medium">
                      &#8377;{(item?.productPrice * item?.productQuantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-2 px-3 font-semibold text-base text-gray-800 dark:text-green-400">
            Total: &#8377;{selectedOrder?.totalAmount}
          </div>

          <div className="mt-2 text-xs text-gray-800 dark:text-gray-400 text-right px-3">
            Ordered on:{" "}
            {new Date(selectedOrder?.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>

          <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-400 px-3 flex items-center gap-1">
            <span>Please ensure all items have been received in correct quantity and condition before confirming.</span>
          </div>


          {/* Actions */}
          <div className="flex justify-end items-center gap-3 mt-2 pt-0 p-3">
            <button
              disabled={loading}
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-1 px-4 py-1.5 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm text-black dark:text-white disabled:cursor-not-allowed"
            >
              <FaTimesCircle size={16} />
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleOrderReceived}
              className="flex items-center gap-1 px-4 py-1.5 rounded bg-[#1E88E5] hover:bg-green-700 text-sm text-white disabled:cursor-not-allowed"
            >
              {
                loading ? <p>Updating...</p>
                  : <>
                    <FaCheckCircle size={16} />
                    Received
                  </>
              }
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}


