export const getCartProductDetails = (cartItems, products, removeFromCart) => {
  const productMap = new Map();

  if (!cartItems?.length || !products?.length) return [];

  for (const product of products) {
    productMap.set(product._id?.toString(), {
      ...product,
    });
  }

  return cartItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        removeFromCart?.(item.productId);
        return null;
      }

      return {
        id: product?._id,
        name: product?.name || "N/A",
        image: product?.image?.[0] || "",
        price: product.price,
        discount: product?.discount || 0,
        selectedQuantity: item.quantity,
        quantityUnit: product.quantityUnit,
        type: product.type || "N/A",
        stock: product.stock ?? 0,
      };
    })
    .filter(Boolean);
};

export const calculateCartTotals = (cartItems) => {
  let subtotal = 0;
  let total = 0;
  let totalSaving = 0;

  for (const item of cartItems) {
    const discount = item?.discount || 0;
    const discountedPrice = item.price - (item.price * discount) / 100;
    subtotal += item.price * item.selectedQuantity;
    total += discountedPrice * item.selectedQuantity;
    totalSaving += (item.price - discountedPrice) * item.selectedQuantity;
  }

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalAmount: parseFloat(total.toFixed(2)),
    totalSaving: parseFloat(totalSaving.toFixed(2)),
  };
};
