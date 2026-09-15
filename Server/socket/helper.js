import Product from "../models/ProductSchema.js";
import Admin from "../models/AdminSchema.js";

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
  const validModes = ["Cash on Delivery", "Online", "Online (Test Mode)"];
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
  if (!io) return;

  const notifObj = {
    title: "New Order Received 📦",
    description: `New pending order #${order?.orderId || String(order?._id || "").slice(-6).toUpperCase()} received from ${user?.firstName || "Customer"} ${user?.lastName || ""}`.trim(),
    date: date || new Date().toISOString(),
  };

  // Broadcast to admin room & global events
  io.to("admin_room").emit("order:new-pending-order", { order });
  io.to("admin_room").emit("admin:notification", notifObj);
  io.emit("order:new-pending-order", { order });
  io.emit("order.created", { order, newOrder: order });
  io.emit("admin:notification", notifObj);

  // Broadcast to any mapped sockets
  if (adminSocketMap) {
    for (const [, socketSet] of adminSocketMap) {
      for (const socketId of socketSet) {
        io.to(socketId).emit("order:new-pending-order", { order });
        io.to(socketId).emit("admin:notification", notifObj);
      }
    }
  }
};

export const addNotification = async (target, notification) => {
  target.notifications.unshift(notification);
  target.notifications = target.notifications.slice(0, 50);
  await target.save();
};

export const notifyNewUserRegistration = async (user, io, options = {}) => {
  try {
    if (!user) return;

    const userName = (
      user.firstName ||
      user.fullName ||
      user.username ||
      (user.email ? user.email.split("@")[0] : "Valued Customer")
    ).trim();
    const userEmail = user.email || "No email provided";
    const createdByAdmin = options.createdByAdmin || false;

    // 1. User Welcome Notification
    const userWelcomeNotif = {
      title: "Welcome to MADHU Dairy! 🥛",
      description: createdByAdmin
        ? `Welcome, ${userName}! Your customer account has been created by MADHU Admin. Enjoy fresh dairy products and fast home delivery.`
        : `Welcome, ${userName}! Thank you for joining MADHU Dairy. Explore fresh dairy products, manage orders, and enjoy fast home delivery.`,
      date: new Date(),
      isRead: false,
      type: "welcome",
    };

    user.notifications = user.notifications || [];
    user.notifications.unshift(userWelcomeNotif);
    user.notifications = user.notifications.slice(0, 50);
    await user.save();

    // 2. Admin Dashboard Notification
    const adminNotif = {
      title: createdByAdmin ? "New Customer Created 👤" : "New User Registered 👤",
      description: createdByAdmin
        ? `New customer ${userName} (${userEmail}) was created by admin.`
        : `New customer ${userName} (${userEmail}) has registered on MADHU Dairy.`,
      date: new Date(),
      isRead: false,
      type: "user_signup",
    };

    // Save notification to all Admin accounts in database
    const admins = await Admin.find({});
    for (const adminDoc of admins) {
      adminDoc.notifications = adminDoc.notifications || [];
      adminDoc.notifications.unshift(adminNotif);
      adminDoc.notifications = adminDoc.notifications.slice(0, 50);
      await adminDoc.save();
    }

    // 3. Live Socket Broadcasting
    if (io) {
      // Emit to specific user room
      io.to(`user:${String(user._id)}`).emit("user:notification", userWelcomeNotif);

      // Emit to admin room & global broadcast for real-time dashboard updates
      io.to("admin_room").emit("admin:notification", adminNotif);
      io.emit("admin:notification", adminNotif);

      const payload = {
        _id: user._id,
        firstName: user.firstName || userName,
        lastName: user.lastName || "",
        email: user.email,
        mobileNo: user.mobileNo || "",
        role: "Customer",
        createdAt: user.createdAt || new Date(),
      };

      io.to("admin_room").emit("user:registered", payload);
      io.to("admin_room").emit("user:new-registered", { user: payload, notification: adminNotif });
      io.emit("user:registered", payload);
      io.emit("user:new-registered", { user: payload, notification: adminNotif });
    }

    return { userWelcomeNotif, adminNotif };
  } catch (err) {
    console.error("notifyNewUserRegistration error:", err?.message || err);
  }
};

