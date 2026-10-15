export const filterOrdersBySearch = (orders, query) => {
  if (!query) return orders;

  const lowerQuery = query.toLowerCase();

  return orders.filter((order) => {
    const address = order?.address;
    const owner = address?.owner;

    const fullName = `${owner?.firstName || ""} ${owner?.lastName || ""}`.toLowerCase();
    const mobileNo = owner?.mobileNo?.toString()?.toLowerCase() || "";
    const streetAddress = address?.streetAddress?.toLowerCase() || "";
    const deliveryName = address?.name?.toLowerCase() || "";

    const matchOwner =
      fullName.includes(lowerQuery) ||
      mobileNo.includes(lowerQuery) ||
      streetAddress.includes(lowerQuery) ||
      deliveryName.includes(lowerQuery);

    const matchProduct = order?.productsData?.some((product) =>
      product?.productId?.name?.toLowerCase().includes(lowerQuery)
    );

    return matchOwner || matchProduct;
  });
}
