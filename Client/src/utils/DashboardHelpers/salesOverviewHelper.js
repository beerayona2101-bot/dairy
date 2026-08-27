export const getTotalRevenue = (allOrders) => {
  const revenue = allOrders
    .filter(
      (order) => order?.status === "Delivered" || order?.status === "Confirmed"
    )
    .reduce((sum, order) => sum + order?.totalAmount, 0);

  return revenue;
};

export const getTotalSales = (orders) => {
  const sales = orders
    .filter((order) => order?.status !== "Cancelled")
    .reduce((sum, order) => sum + order?.totalAmount, 0);

  return sales || 0;
};

export const calculateTotalProfit = (orders) => {
  if (!Array.isArray(orders)) return 0;

  const profit = orders?.reduce((totalProfit, order) => {
    if (
      (order?.status !== "Confirmed" && order?.status !== "Delivered") ||
      !Array.isArray(order?.productsData)
    ) {
      return totalProfit;
    }

    const totalManufacturingCost = order?.productsData?.reduce((sum, item) => {
      const cost = item?.unitManufacturingCost ?? item?.productPrice ?? 0;
      const qty = item?.productQuantity ?? 0;
      return sum + cost * qty;
    }, 0);

    const profit = order?.totalAmount - totalManufacturingCost;

    return totalProfit + profit;
  }, 0);

  return Number(profit.toFixed(2));
};

export const calculateTotalExpenses = (orders, costPerKg = 7) => {
  if (!Array.isArray(orders)) return 0;

  const expenses = orders?.reduce((totalExpense, order) => {
    if (
      (order?.status !== "Confirmed" && order?.status !== "Delivered") ||
      !Array.isArray(order?.productsData)
    ) {
      return totalExpense;
    }

    const orderExpense = order?.productsData?.reduce((sum, item) => {
      const qty = item?.productQuantity ?? 0;
      return sum + costPerKg * qty;
    }, 0);

    return totalExpense + orderExpense;
  }, 0);

  return Number(expenses.toFixed(2));
};

export const topSellingStocks = (products) => {
  if (!Array.isArray(products)) return [];

  const sorted = [...products].sort((a, b) => {
    const qtyA = a.totalQuantitySold || 0;
    const qtyB = b.totalQuantitySold || 0;
    return qtyB - qtyA; // descending
  });

  return sorted;
};


