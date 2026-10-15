export const getCartProductDetails = (cartItems, products) => {
  if (!cartItems?.length) return [];

  const productMap = new Map();
  const allProducts = Array.isArray(products) ? products : [];

  for (const product of allProducts) {
    if (!product) continue;
    const pId = (product._id || product.id)?.toString();
    if (pId) {
      productMap.set(pId, product);
      productMap.set(pId.toLowerCase(), product);
    }
  }

  return cartItems
    .map((item) => {
      if (!item) return null;
      const rawId = typeof item.productId === "object" ? (item.productId?._id || item.productId?.id) : item.productId;
      const itemPId = rawId ? String(rawId).trim() : null;

      if (!itemPId) return null;

      let product = productMap.get(itemPId) || productMap.get(itemPId.toLowerCase());

      if (!product && allProducts.length > 0) {
        product = allProducts.find(p => {
          if (!p) return false;
          const pIdStr = String(p._id || p.id || "").trim();
          return pIdStr === itemPId || pIdStr.toLowerCase() === itemPId.toLowerCase();
        });
      }

      if (!product && typeof item.productId === "object" && item.productId?.name) {
        product = item.productId;
      }

      const finalProduct = product || {};

      return {
        id: finalProduct?._id || finalProduct?.id || itemPId,
        name: finalProduct?.name || item?.name || "Dairy Product",
        image: Array.isArray(finalProduct?.image) ? finalProduct.image[0] : (finalProduct?.image || finalProduct?.pngImage || item?.image || ""),
        price: Number(finalProduct?.price ?? item?.price ?? 0),
        discount: Number(finalProduct?.discount ?? item?.discount ?? 0),
        selectedQuantity: Number(item?.quantity || 1),
        quantityUnit: finalProduct?.quantityUnit || item?.quantityUnit || "Unit",
        type: finalProduct?.type || finalProduct?.category || "Dairy",
        stock: finalProduct?.stock ?? 100,
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
