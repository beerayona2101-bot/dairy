import Product from "../models/ProductSchema.js";

export const validateOrderData = (data) => {
  const { address, productsData, paymentMode, totalAmount, userId } =
    data.orderData;
  if (
    !address ||
    !Array.isArray(productsData) ||
    !paymentMode ||
    !totalAmount ||
    !userId
  ) {
    return "Missing required fields.";
  }
  const validModes = ["Cash on Delivery", "Online"];
  if (!validModes.includes(paymentMode)) {
    return "Invalid payment mode.";
  }
  return null;
};

export const validateAndProcessProducts = async (productsData, socket) => {
  const validatedProducts = [];
  let serverTotal = 0;

  for (const item of productsData) {
    const { productId, productQuantity, productPrice, productName } = item;

    if (!productId || !productQuantity || !productPrice) {
      return { error: "Incomplete product data." };
    }

    const product = await Product.findById(productId);
    if (!product) {
      return { error: `Product not found: ${productName}` };
    }

    if (product.stock < productQuantity) {
      return { error: `Insufficient stock for product ${product.name}` };
    }

    const discountPercent = product.discount || 0;
    const discountedPrice =
      product.price - (product.price * discountPercent) / 100;
    serverTotal += discountedPrice * productQuantity;

    validatedProducts.push({
      productId,
      productQuantity,
      productPrice: discountedPrice,
      unitManufacturingCost: product.manufacturingCost || 0,
    });
  }

  return { validatedProducts, serverTotal };
};

export const createBulkStockUpdateOps = (validatedProducts, direction = -1) => {
  return validatedProducts.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: {
        $inc: {
          stock: direction * item.productQuantity,
          totalQuantitySold: direction === -1 ? item.productQuantity : 0,
        },
      },
    },
  }));
};

export const formatTotals = (serverTotal, clientTotal) => {
  const formattedServerTotal = parseFloat(serverTotal.toFixed(2));
  const formattedClientTotal = parseFloat(parseFloat(clientTotal).toFixed(2));
  return { formattedServerTotal, formattedClientTotal };
};

export const emitAdminOrderNotifications = (
  adminSocketMap,
  order,
  user,
  date,
  io
) => {
  for (const [, socketSet] of adminSocketMap) {
    for (const socketId of socketSet) {
      io.to(socketId).emit("order:new-pending-order", { order });
      io.to(socketId).emit("admin:notification", {
        title: "New Order Received",
        description: `You have a new pending order from ${user?.firstName} ${user?.lastName}`,
        date,
      });
    }
  }
};

export const addNotification = async (target, notification) => {
  target.notifications.unshift(notification);
  target.notifications = target.notifications.slice(0, 50);
  await target.save();
};
