import React, { useContext, useState } from "react";
import OrdersSummary from "../../components/AdminComponents/OrderComponents/OrdersSummary";
import OrderDetails from "../../components/AdminComponents/OrderComponents/OrderDetails";
import {
  totalActiveOrders,
  totalCanceledOrders,
  totalOrdersCount,
} from "../../services/orderService";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { AdminOrderContext } from "../../context/AdminOrderProvider";

// Animation Variants
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Orders() {

  const { adminOrders, orderLoading, allOrders } = useContext(AdminOrderContext);

  const [statusFilter, setStatusFilter] = useState("Pending");

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  }

  return (
    <motion.div
      className="p-3"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={fadeUpVariants}>
        <OrdersSummary
          orders={adminOrders}
          totalOrders={totalActiveOrders(adminOrders)}
          totalRecievedOrders={totalOrdersCount(allOrders)}
          totalCanceledOrders={totalCanceledOrders(allOrders)}
          handleStatusFilter={handleStatusFilter}
        />
      </motion.div>

      <motion.div variants={fadeUpVariants} className="mt-6">
        <OrderDetails orders={adminOrders} allOrders={allOrders} loading={orderLoading} statusFilter={statusFilter} handleStatusFilter={handleStatusFilter} />
      </motion.div>
    </motion.div>
  );
}