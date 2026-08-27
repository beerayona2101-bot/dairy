import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader,
  PackageCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Truck,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import { fetchRecentOrders } from "../../../services/orderService";

export default function OrdersPreview() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await fetchRecentOrders();
        setOrders(res?.orders || []);
      } catch (error) {
        console.error("Error fetching recent orders", error);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100/10 text-yellow-500";
      case "Processing":
        return "bg-blue-100/10 text-blue-500";
      case "Shipped":
        return "bg-indigo-100/10 text-indigo-500";
      case "Delivered":
        return "bg-green-100/10 text-green-500";
      case "Cancelled":
        return "bg-red-100/10 text-red-500";
      case "Confirmed":
        return "bg-green-100/10 text-green-500";
      default:
        return "bg-gray-100/10 text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={14} className="mr-1 text-yellow-500" />;
      case "Processing":
        return <Loader2 size={14} className="mr-1 animate-spin text-blue-500" />;
      case "Shipped":
        return <Truck size={14} className="mr-1 text-indigo-500" />;
      case "Delivered":
        return <PackageCheck size={14} className="mr-1 text-green-600" />;
      case "Cancelled":
        return <XCircle size={14} className="mr-1 text-red-600" />;
      case "Confirmed":
        return <CheckCircle2 size={14} className="mr-1 text-green-500" />;
      default:
        return <AlertTriangle size={14} className="mr-1 text-gray-500" />;
    }
  };

  let content;

  if (loading) {
    content = (
      <div className="flex justify-center items-center py-6">
        <Loader className="animate-spin text-purple-600 w-6 h-6" />
      </div>
    );
  } else if (orders.length === 0) {
    content = <p className="text-gray-500 text-sm">No recent orders found.</p>;
  } else {
    content = (
      <div className="overflow-x-auto scrollbar-hide w-full">
        <table className="min-w-[700px] w-full text-sm text-left text-gray-700 dark:text-white">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-sm">
            <tr>
              <th className="p-3 w-[15%]">Customer</th>
              <th className="p-3 w-[15%]">Date</th>
              <th className="p-3 w-[10%]">Items</th>
              <th className="p-3 w-[15%]">Amount</th>
              <th className="p-3 w-[15%]">Status</th>
              <th className="p-3 w-[10%]">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const statusClass = getStatusClass(order?.status);
              const address = order?.address;

              const paymentIcon =
                order.paymentMode === "Online" ? (
                  <span className="text-green-600 font-medium">Online</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Cash</span>
                );

              return (
                <tr
                  key={order?._id}
                  className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500/10"
                >
                  <td className="p-3">{address?.name || "N/A"}</td>
                  <td className="p-3">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                      : "N/A"}
                  </td>
                  <td className="p-3">{order?.productsData?.length ?? "-"}</td>
                  <td className="p-3">₹{order?.totalAmount?.toFixed(2) ?? "0.00"}</td>
                  <td className="p-3">
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusClass}`}
                    >
                      {getStatusIcon(order?.status)}
                      {order?.status}
                    </span>
                  </td>
                  <td className="p-3">{paymentIcon}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }


  return (
    <div className="bg-gray-100 dark:bg-gray-500/20 p-3 rounded shadow-sm w-full">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Recent Orders
      </h2>

      {content}

      <div className="mt-4">
        {orders?.length > 0 && (
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 justify-end text-blue-600 hover:underline text-sm"
          >
            View More <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
