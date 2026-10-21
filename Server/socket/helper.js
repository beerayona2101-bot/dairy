import mongoose from "mongoose";
import Product from "../models/ProductSchema.js";
import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";
import { sendPushNotification, sendNotificationToAdmin } from "../services/fcmService.js";

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

  // Push notification to all admin mobile devices
  sendNotificationToAdmin({
    title: notifObj.title,
    body: notifObj.description,
    orderId: order?._id ? String(order._id) : undefined,
    data: {
      type: "new_order",
      orderId: order?._id ? String(order._id) : "",
      totalAmount: String(order?.totalAmount || 0),
    },
  }).catch((err) => console.warn("[FCM] Order admin push notice:", err?.message));
};

export const addNotification = async (target, notification) => {
  if (!target || !notification) return;
  if (!Array.isArray(target.notifications)) {
    target.notifications = [];
  }

  // Ensure notification has an _id for clean tracking and deduplication
  if (!notification._id) {
    notification._id = new mongoose.Types.ObjectId();
  }

  const isLoginNotification =
    notification.type === "login" ||
    (typeof notification.title === "string" &&
      notification.title.toLowerCase().includes("login"));

  if (isLoginNotification) {
    // Only keep the latest login notification; remove any prior login notifications
    target.notifications = target.notifications.filter((n) => {
      if (!n) return false;
      const isPastLogin =
        n.type === "login" ||
        (typeof n.title === "string" && n.title.toLowerCase().includes("login"));
      return !isPastLogin;
    });
  } else {
    // For other notifications, prevent identical duplicate entries
    const existingIndex = target.notifications.findIndex((n) => {
      if (!n) return false;
      const sameTitle = (n.title || "").trim() === (notification.title || "").trim();
      const sameDesc = (n.description || "").trim() === (notification.description || "").trim();
      const sameOrder = String(n.orderId || "") === String(notification.orderId || "");
      return sameTitle && sameDesc && sameOrder;
    });

    if (existingIndex !== -1) {
      target.notifications.splice(existingIndex, 1);
    }
  }

  target.notifications.unshift(notification);
  target.notifications = target.notifications.slice(0, 50);
  try {
    if (target._id) {
      const Model = target.constructor?.modelName === "Admin" ? Admin : User;
      await Model.findByIdAndUpdate(target._id, { notifications: target.notifications });
    } else if (typeof target.save === "function") {
      await target.save();
    }
  } catch (saveErr) {
    console.warn("addNotification save notice:", saveErr?.message);
  }

  // Asynchronously dispatch FCM push notification to user's/admin's device(s)
  try {
    let tokens = target.fcmTokens;
    if ((!tokens || tokens.length === 0) && target._id) {
      const fresh = (await User.findById(target._id).select("fcmTokens")) ||
                    (await Admin.findById(target._id).select("fcmTokens"));
      if (fresh && Array.isArray(fresh.fcmTokens)) {
        tokens = fresh.fcmTokens;
      }
    }

    if (Array.isArray(tokens) && tokens.length > 0) {
      sendPushNotification({
        fcmTokens: tokens,
        title: notification.title || "Natural Milk Dairy",
        body: notification.description || "",
        data: {
          orderId: notification.orderId ? String(notification.orderId) : "",
          type: notification.type || "notification",
        },
      }).catch((err) => console.warn("[FCM] Push error in addNotification:", err?.message));
    }
  } catch (pushErr) {
    console.warn("[FCM] Push dispatch error:", pushErr?.message);
  }
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
      _id: new mongoose.Types.ObjectId(),
      title: "Welcome to Natural Milk Dairy! 🥛",
      description: createdByAdmin
        ? `Welcome, ${userName}! Your customer account has been created. Enjoy fresh dairy products and fast home delivery.`
        : `Welcome, ${userName}! Thank you for joining Natural Milk Dairy. Explore fresh dairy products, manage orders, and enjoy fast home delivery.`,
      date: new Date(),
      isRead: false,
      type: "welcome",
    };

    if (user._id) {
      try {
        await User.findByIdAndUpdate(user._id, {
          $push: {
            notifications: {
              $each: [userWelcomeNotif],
              $position: 0,
              $slice: 50,
            },
          },
        });
      } catch (uErr) {
        console.warn("Welcome notification save notice:", uErr?.message);
      }
    }

    // Push welcome notification to user's device if token exists
    if (Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
      sendPushNotification({
        fcmTokens: user.fcmTokens,
        title: userWelcomeNotif.title,
        body: userWelcomeNotif.description,
        data: { type: "welcome", userId: String(user._id) },
      }).catch((err) => console.warn("[FCM] Welcome push error:", err?.message));
    }

    // 2. Admin Dashboard Notification
    const adminNotif = {
      _id: new mongoose.Types.ObjectId(),
      title: createdByAdmin ? "New Customer Created 👤" : "New User Registered 👤",
      description: createdByAdmin
        ? `New customer ${userName} (${userEmail}) was created by admin.`
        : `New customer ${userName} (${userEmail}) has registered on Natural Milk Dairy.`,
      date: new Date(),
      isRead: false,
      type: "user_signup",
    };

    // Save notification to all Admin accounts atomically
    try {
      await Admin.updateMany(
        {},
        {
          $push: {
            notifications: {
              $each: [adminNotif],
              $position: 0,
              $slice: 50,
            },
          },
        }
      );
    } catch (aErr) {
      console.warn("Admin registration notification notice:", aErr?.message);
    }

    // Send push notification to all admin devices
    sendNotificationToAdmin({
      title: adminNotif.title,
      body: adminNotif.description,
      data: { type: "user_signup", userId: String(user._id) },
    }).catch(() => {});

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

