export const filterStoresByInput = (stores = [], searchText = "") => {
  if (!searchText.trim()) return stores;

  const query = searchText.trim().toLowerCase();

  return stores.filter((store) => {
    const {
      shopName = "",
      firstName = "",
      lastName = "",
      address = {},
    } = store;

    const { streetAddress = "", city = "", pincode = "" } = address;

    return (
      shopName.toLowerCase().includes(query) ||
      firstName.toLowerCase().includes(query) ||
      lastName.toLowerCase().includes(query) ||
      streetAddress.toLowerCase().includes(query) ||
      city.toLowerCase().includes(query) ||
      String(pincode).includes(query)
    );
  });
};

export const filterOrdersByQuery = (orders = [], query = "") => {
  if (!query.trim()) return orders;

  const lowerQuery = query.trim().toLowerCase();

  return orders.filter((order) => {
    const date = new Date(order.createdAt).toLocaleDateString("en-IN");
    return (
      order._id.toLowerCase().includes(lowerQuery) ||
      order.status.toLowerCase().includes(lowerQuery) ||
      order.paymentMode.toLowerCase().includes(lowerQuery) ||
      date.includes(lowerQuery)
    );
  });
};

export const filterOrdersByDateRange = (orders = [], fromDate, toDate) => {
  if (!fromDate && !toDate) return orders;

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  // Set end of toDate to 23:59:59
  if (to) {
    to.setHours(23, 59, 59, 999);
  }

  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);

    const isAfterFrom = from ? orderDate >= from : true;
    const isBeforeTo = to ? orderDate <= to : true;

    return isAfterFrom && isBeforeTo;
  });
};
