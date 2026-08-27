export const totalCanceledOrders = (orders) => {
   return orders.filter((order) => order?.status === "Cancelled")?.length || 0;
}

export const totalDeliveredOrders = (orders) => {
   return orders.filter((order) => order?.status === "Delivered")?.length || 0;
};
