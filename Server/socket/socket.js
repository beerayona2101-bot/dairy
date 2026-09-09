import { Server } from "socket.io";
import Order from "../models/OrderSchema.js";
import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";
import Address from "../models/AddressShema.js";
import Product from "../models/ProductSchema.js";

import {
  validateOrderData,
  validateAndProcessProducts,
  addNotification,
  formatTotals,
  createBulkStockUpdateOps,
  emitAdminOrderNotifications,
} from "./helper.js";
import mongoose from "mongoose";
import { cloudinary, uploadToCloudinary } from "../config/cloudinary.js";

import { publishEvent } from "./eventPublisher.js";

export const broadcastOrderStatusUpdate = async (io, { orderId, status, userId }) => {
  if (!io) return;
  const stringOrderId = String(orderId);
  let stringUserId = userId ? String(userId) : undefined;

  let order = null;
  try {
    order = await Order.findById(orderId);
    if (order && !stringUserId && order.user) {
      stringUserId = String(order.user);
    }
  } catch (err) {
    console.warn("broadcastOrderStatusUpdate order fetch error:", err?.message);
  }

  const payload = { orderId: stringOrderId, status, userId: stringUserId };

  publishEvent(io, "order.updated", payload, {
    userId: stringUserId,
    rooms: ["admin_room"],
  });

  if (stringUserId) {
    io.to(`user:${stringUserId}`).emit("user-order:updated-status", payload);
  }

  io.emit("user-order:updated-status", payload);
  io.emit("order:global-status-update", payload);
  io.emit("admin:order-updated", payload);
  io.emit("order:status-updated", payload);
  io.emit("order:accept-success", payload);
  io.emit("admin-order:delivered-success", payload);
  io.emit("order:reject-success", payload);

  // Send real-time & persistent notification to the user
  if (stringUserId) {
    try {
      let targetUser = await User.findById(stringUserId);
      if (!targetUser) {
        targetUser = await Admin.findById(stringUserId);
      }

      if (targetUser) {
        const orderIdDisplay = order?.orderId || stringOrderId.slice(-6).toUpperCase();
        let notifTitle = `Order Status Updated`;
        let notifDesc = `Your order #${orderIdDisplay} status has been updated to "${status}".`;

        switch (status) {
          case "Confirmed":
            notifTitle = "Order Confirmed 📦";
            notifDesc = `Great news! Your order #${orderIdDisplay} has been confirmed by our team.`;
            break;
          case "Processing":
            notifTitle = "Order Processing ⚙️";
            notifDesc = `Your order #${orderIdDisplay} is currently being packed and prepared.`;
            break;
          case "Shipped":
            notifTitle = "Order Dispatched 🚚";
            notifDesc = `Your order #${orderIdDisplay} has been shipped and is out for delivery!`;
            break;
          case "Ready to Deliver":
            notifTitle = "Ready for Delivery 🛵";
            notifDesc = `Your order #${orderIdDisplay} is ready and will be delivered to your address shortly!`;
            break;
          case "Delivered":
            notifTitle = "Order Delivered ✅";
            notifDesc = `Your order #${orderIdDisplay} has been successfully delivered. Thank you for choosing Dairy Excellence!`;
            break;
          case "Cancelled":
            notifTitle = "Order Cancelled ❌";
            notifDesc = `Your order #${orderIdDisplay} has been cancelled.`;
            break;
          default:
            break;
        }

        const notificationObj = {
          title: notifTitle,
          description: notifDesc,
          date: new Date(),
          isRead: false,
          orderId: order?._id || undefined,
          type: "order",
        };

        await addNotification(targetUser, notificationObj);

        io.to(`user:${stringUserId}`).emit("user:notification", notificationObj);
        io.emit("user:notification", notificationObj);
      }
    } catch (notifErr) {
      console.error("Error creating/sending status notification:", notifErr);
    }
  }
};

export const connectToSocket = (server) => {
  const userSocketMap = new Map();
  const adminSocketMap = new Map();

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Socket Authentication & Identity Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      let rawUserId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
      if (rawUserId === "undefined" || rawUserId === "null" || !rawUserId) {
        rawUserId = null;
      }
      const role = socket.handshake.auth?.role || socket.handshake.query?.role || "user";

      socket.user = { id: rawUserId, role, token };
      return next();
    } catch (err) {
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const displayUser = socket.user?.id ? `User ID: ${socket.user.id}` : "Guest";
    console.log(`[Socket] Client connected: ${socket.id} (${displayUser})`);

    // Ping / Heartbeat Handler
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });

    // Room Authorization Join Handler
    socket.on("room:join", ({ room }) => {
      if (!room) return;
      if (room === "admin_room" && socket.user?.role !== "admin") {
        return socket.emit("error:unauthorized", { message: "Access denied to admin room" });
      }
      socket.join(room);
      socket.emit("room:joined", { room });
    });

    socket.on("user:register", ({ userId }) => {
      if (!userId) return;

      socket.data.userId = userId;
      socket.join(`user:${userId}`);

      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);
    });

    socket.on("admin:register", ({ adminId }) => {
      if (!adminId) return;

      socket.data.adminId = adminId;
      socket.join("admin_room");

      if (!adminSocketMap.has(adminId)) {
        adminSocketMap.set(adminId, new Set());
      }
      adminSocketMap.get(adminId).add(socket.id);
    });

    socket.on(
      "admin:send-message-to-user",
      async ({ userId, title, description, date }) => {
        try {
          if (!userId || !title || !description) {
            return socket.emit("admin:send-message-status", {
              success: false,
              message: "Missing required fields.",
            });
          }

          const user = await User.findById(userId);
          if (!user) {
            return socket.emit("admin:send-message-status", {
              success: false,
              message: "User not found.",
            });
          }

          await addNotification(user, {
            title,
            description,
            date,
          });

          socket.emit("admin:send-message-status", {
            success: true,
            message: "Message sent and notification added successfully.",
          });

          if (userSocketMap.has(userId)) {
            for (const socketId of userSocketMap.get(userId)) {
              io.to(socketId).emit("user:notification", {
                title,
                description,
                date,
              });
            }
          }
        } catch (error) {
          socket.emit("admin:send-message-status", {
            success: false,
            message: error?.message || "Internal server error.",
          });
        }
      }
    );

    socket.on("place-new-order", async (data) => {
      const { address, productsData, paymentMode, totalAmount, userId, date, deliveryInstructions } =
        data.orderData || {};

      const { paymentInfo } = data;

      try {
        const validationError = validateOrderData(data);
        if (validationError) {
          return socket.emit("new-order-place-failed", {
            message: validationError,
          });
        }

        let foundAddress = null;
        if (address && mongoose.Types.ObjectId.isValid(address)) {
          foundAddress = await Address.findById(address);
        }
        if (!foundAddress && address) {
          foundAddress = address;
        }
        if (!foundAddress) {
          const u = await User.findById(userId) || await Admin.findById(userId);
          if (u && (u.address || (Array.isArray(u.savedAddresses) && u.savedAddresses.length > 0))) {
            foundAddress = u.address || u.savedAddresses[0];
          }
        }

        if (!foundAddress) {
          return socket.emit("new-order-place-failed", {
            message: "Invalid or missing address.",
          });
        }

        const user = await User.findById(userId) || await Admin.findById(userId);
        if (!user) {
          return socket.emit("new-order-place-failed", {
            message: "User account not found.",
          });
        }

        const { validatedProducts, serverTotal, error } =
          await validateAndProcessProducts(productsData, socket);
        if (error) {
          return socket.emit("new-order-place-failed", { message: error });
        }

        const { formattedServerTotal, formattedClientTotal } = formatTotals(
          serverTotal,
          totalAmount
        );

        if (formattedServerTotal !== formattedClientTotal) {
          return socket.emit("new-order-place-failed", {
            message: `Total amount mismatch. Expected ₹${formattedServerTotal}, received ₹${formattedClientTotal}`,
          });
        }

        const admin = await Admin.findOne();
        if (!admin) {
          return socket.emit("new-order-place-failed", {
            message: "Admin not found",
          });
        }

        const instructionText = (deliveryInstructions || data?.orderData?.deliveryInstructions || data?.deliveryInstructions || "").trim();

        let savedOrder = null;
        if (data?.createdOrder?._id) {
          savedOrder = await Order.findById(data.createdOrder._id);
        }

        if (!savedOrder) {
          const recentExisting = await Order.findOne({
            user: userId,
            totalAmount: formattedServerTotal,
            createdAt: { $gte: new Date(Date.now() - 30000) },
          }).sort({ createdAt: -1 });

          if (recentExisting) {
            savedOrder = recentExisting;
          }
        }

        if (savedOrder) {
          if (instructionText && !savedOrder.deliveryInstructions) {
            savedOrder.deliveryInstructions = instructionText;
            await savedOrder.save().catch(() => { });
          }
        } else {
          const newOrder = new Order({
            user: userId,
            address,
            productsData: validatedProducts,
            paymentMode,
            totalAmount: formattedServerTotal,
            deliveryInstructions: instructionText,
            razorpay:
              paymentMode === "Online" && paymentInfo
                ? {
                  orderId: paymentInfo.razorpayOrderId,
                  paymentId: paymentInfo.razorpayPaymentId,
                  signature: paymentInfo.razorpaySignature,
                }
                : undefined,
          });
          savedOrder = await newOrder.save();
        }

        await savedOrder.populate([
          {
            path: "address",
            populate: {
              path: "owner",
              model: "User",
            },
          },
          {
            path: "productsData.productId",
            model: "Product",
          },
        ]);

        admin.pendingOrders = admin.pendingOrders || [];
        if (!admin.pendingOrders.some(id => String(id) === String(savedOrder._id))) {
          admin.pendingOrders.push(savedOrder._id);
          await admin.save();
        }

        user.orders = user.orders || [];
        if (!user.orders.some(id => String(id) === String(savedOrder._id))) {
          user.orders.push(savedOrder._id);
          await user.save();
        }

        const bulkOperations = createBulkStockUpdateOps(validatedProducts);

        await Product.bulkWrite(bulkOperations);

        const updatedData = validatedProducts.map((item) => ({
          productId: item.productId,
          change: -item.productQuantity,
        }));

        await addNotification(admin, {
          title: "New Order Recieved",
          description: `You have new pending order from ${user?.firstName} ${user?.lastName}`,
          date,
        });

        emitAdminOrderNotifications(adminSocketMap, savedOrder, user, date, io);

        if (userId && userSocketMap.has(userId)) {
          for (const socketId of userSocketMap.get(userId)) {
            io.to(socketId).emit("order:place-new-success", {
              newOrder: savedOrder,
            });
          }
        }

        socket.emit("new-order-place-success", { message: "Order confirmed" });

        io.emit("product-stock-update", { updatedData });
      } catch (error) {
        socket.emit("new-order-place-failed", {
          message:
            error?.message || "Something went wrong while placing the order.",
        });
      }
    });

    socket.on("order:accept", async ({ orderId, status, date, userId }) => {
      try {
        if (!orderId || !status) {
          return socket.emit("order:update-status-failed", {
            message: "Order ID and status are required.",
            status,
          });
        }

        const validStatuses = [
          "Pending",
          "Confirmed",
          "Processing",
          "Shipped",
          "Ready to Deliver",
          "Delivered",
          "Cancelled",
        ];

        if (!validStatuses.includes(status)) {
          return socket.emit("order:update-status-failed", {
            message: "Invalid status value.",
            status,
          });
        }

        const user = await User.findById(userId);
        if (!user) {
          return socket.emit("order:update-status-failed", {
            message: "User not found.",
            status,
          });
        }

        const order = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true }
        );

        if (!order) {
          return socket.emit("order:update-status-failed", {
            message: "Order not found.",
            status,
          });
        }

        await Admin.updateMany(
          { pendingOrders: order._id },
          { $pull: { pendingOrders: order._id } }
        );

        const totalItems = order.productsData.reduce(
          (sum, item) => sum + item.productQuantity,
          0
        );

        const notificationMessage = `Your order #${order._id} with ${totalItems} item(s) worth ₹${order.totalAmount} has been confirmed and is being processed.`;

        await addNotification(user, {
          title: "Order Confirmed",
          description: notificationMessage,
          date,
        });

        const targetUserId = userId || order?.user?.toString();

        broadcastOrderStatusUpdate(io, { orderId, status, userId: targetUserId });

        socket.emit("order:update-status-success", {
          message: `Order status updated to ${status} successfully.`,
          status,
          orderId,
        });
      } catch (error) {
        socket.emit("order:update-status-failed", {
          message:
            error?.message ||
            "Internal server error while accepting the order.",
          status,
        });
      }
    });

    socket.on("order:reject", async ({ orderId, status, date, userId }) => {
      try {
        if (!orderId) {
          return socket.emit("order:update-status-failed", {
            message: "Missing order ID.",
            status: "Cancelled",
          });
        }

        const order = await Order.findById(orderId);
        if (!order) {
          return socket.emit("order:update-status-failed", {
            message: "Order not found.",
            status: "Cancelled",
          });
        }

        const targetUserId = userId || order?.user?.toString();
        const user = targetUserId ? await User.findById(targetUserId) : null;

        if (order.status === "Cancelled") {
          return socket.emit("order:update-status-failed", {
            message: "Order is already cancelled.",
            status: "Cancelled",
          });
        }

        const totalItems = order.productsData.reduce(
          (sum, item) => sum + item.productQuantity,
          0
        );

        const refundNote =
          order.paymentMode === "Online"
            ? " Refund will be processed within 1 working day."
            : "";

        const timestamp = new Date().toISOString();

        const bulkOperations = order.productsData.map((item) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: item.productQuantity } },
          },
        }));

        await Product.bulkWrite(bulkOperations);

        order.status = "Cancelled";
        await order.save();

        if (user) {
          await addNotification(user, {
            title: "Order Cancelled",
            description: `Order #${order._id} with ${totalItems} item(s) worth ₹${order.totalAmount} has been cancelled.${refundNote}`,
            date: timestamp,
          });
        }

        await Admin.findOneAndUpdate(
          {},
          { $pull: { pendingOrders: order._id } },
          { new: true }
        );

        const updatedData = order.productsData.map((item) => ({
          productId: item.productId.toString(),
          change: item.productQuantity,
        }));

        io.emit("product-stock-update", { updatedData });

        socket.emit("order:update-status-success", {
          message: "Order cancelled and stock restored successfully.",
          status: "Cancelled",
          orderId,
        });

        broadcastOrderStatusUpdate(io, { orderId, status: "Cancelled", userId: targetUserId });
      } catch (error) {
        socket.emit("order:update-status-failed", {
          message:
            error?.message || "Failed to cancel order due to server error.",
          status: "Cancelled",
          orderId,
        });
      }
    });

    socket.on("order:delivered", async ({ orderId, status, userId }) => {
      try {
        if (!orderId) {
          return socket.emit("order:update-delivered-status", {
            message: "Missing order ID.",
            success: false,
          });
        }

        const order = await Order.findById(orderId);
        if (!order) {
          return socket.emit("order:update-delivered-status", {
            message: "Order not found.",
            success: false,
          });
        }

        const targetUserId = userId || order?.user?.toString();
        const user = targetUserId ? await User.findById(targetUserId) : null;

        const admin = await Admin.findOne();

        if (order.status === "Delivered") {
          return socket.emit("order:update-delivered-status", {
            message: "Order is already marked as delivered.",
            success: false,
          });
        }

        order.status = "Delivered";
        await order.save();

        const date = new Date().toISOString();
        const totalItems = order.productsData?.reduce(
          (sum, item) => sum + item.productQuantity,
          0
        );

        if (user) {
          await addNotification(user, {
            title: "Order Delivered",
            description: `Your order (ID: ${order._id}) with ${totalItems} item(s) has been successfully delivered. Total: ₹${order.totalAmount}.`,
            date,
          });
        }

        if (admin) {
          await addNotification(admin, {
            title: "Order Delivered",
            description: `Order #${order._id} placed by ${user?.firstName || "User"} ${user?.lastName || ""} has been delivered. Total: ₹${order.totalAmount}, Items: ${totalItems}`,
            date,
          });
        }

        socket.emit("order:update-delivered-status", {
          message: "Order marked as delivered.",
          success: true,
        });

        broadcastOrderStatusUpdate(io, { orderId, status: "Delivered", userId: targetUserId });
      } catch (error) {
        socket.emit("order:update-delivered-status", {
          message:
            error?.message ||
            "Failed to mark order as delivered due to server error.",
          success: false,
        });
      }
    });

    socket.on("page-content:update", (data) => {
      io.emit("page-content:updated", data);
    });

    socket.on("add-new-product", async (data) => {
      const { image, productDetails } = data;
      let imageUrl = "";

      try {
        if (!image || !productDetails) {
          return socket.emit("add-new-product:failed", {
            success: false,
            message: "Fields are missing",
          });
        }

        const existingProduct = await Product.findOne({
          name: productDetails?.name
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase()),
        });

        if (existingProduct) {
          return socket.emit("add-new-product:failed", {
            success: false,
            message: "Product with this name already exists.",
          });
        }

        if (image) {
          imageUrl = await uploadToCloudinary(image, "dairy_app");
        }

        let pngImageUrl = productDetails?.pngImage || "";
        if (pngImageUrl && typeof pngImageUrl === "string" && pngImageUrl.startsWith("data:image")) {
          pngImageUrl = await uploadToCloudinary(pngImageUrl, "dairy_app");
        }

        const newProduct = new Product({
          ...productDetails,
          name: productDetails?.name
            ?.trim()
            ?.replace(/\s+/g, " ")
            ?.toLowerCase()
            ?.replace(/\b\w/g, (char) => char.toUpperCase()),
          image: [imageUrl || "/images/madhur_dairy_milk.png"],
          pngImage: pngImageUrl || productDetails?.pngImage || "",
        });

        await newProduct.save();

        io.emit("add-new-product:success", {
          success: true,
          message: "New product added successfully",
          newProduct,
        });

        socket.emit("added-new-product:to-inventory", {
          message: "New product added successfully in inventory",
        });
      } catch (error) {
        socket.emit("add-new-product:failed", {
          success: false,
          message:
            error?.message || "Something went wrong while adding new product",
        });
      }
    });

    socket.on("remove-product", async (data) => {
      let { productId } = data;

      try {
        if (!productId) {
          return socket.emit("remove-product:failed", {
            message: "Product ID is missing",
          });
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);

        io.emit("remove-product:success", {
          message: "Product removed successfully",
          deletedProduct,
        });

        socket.emit("remove-product:from-inventory", {
          message: `${deletedProduct?.name || "Product"} removed successfully.`,
        });
      } catch (error) {
        socket.emit("remove-product:failed", {
          message:
            error?.message || "Something went wrong while deleting product",
        });
      }
    });

    socket.on("update-product", async (data) => {
      const updatedProductData = data;
      try {
        if (!updatedProductData) {
          return socket.emit("update-product:failed", {
            message: "Updated product data is missing",
          });
        }

        const productId = updatedProductData?._id;

        if (!productId) {
          return socket.emit("update-product:failed", {
            message: "Product Id is missing.",
          });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return socket.emit("update-product:failed", {
            message: "Product not found",
          });
        }

        if (
          updatedProductData?.name &&
          updatedProductData?.name !== product?.name
        ) {
          const nameExists = await Product.findOne({
            name: updatedProductData?.name,
            _id: { $ne: productId }
          });
          if (nameExists) {
            return socket.emit("update-product:failed", {
              message:
                "Product with this name already exists! You can update it",
            });
          }
        }

        let imgVal = updatedProductData.image;
        if (Array.isArray(imgVal) && imgVal.length > 0) {
          imgVal = imgVal[0];
        }

        if (typeof imgVal === "string" && imgVal.startsWith("data:image")) {
          const uploadedUrl = await uploadToCloudinary(imgVal, "dairy_app");
          updatedProductData.image = [uploadedUrl];
        } else if (Array.isArray(updatedProductData.image)) {
          updatedProductData.image = updatedProductData.image;
        } else if (typeof updatedProductData.image === "string" && updatedProductData.image.trim() !== "") {
          updatedProductData.image = [updatedProductData.image];
        } else {
          updatedProductData.image = product.image;
        }

        if (typeof updatedProductData.pngImage === "string" && updatedProductData.pngImage.startsWith("data:image")) {
          const uploadedPngUrl = await uploadToCloudinary(updatedProductData.pngImage, "dairy_app");
          updatedProductData.pngImage = uploadedPngUrl;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          { $set: updatedProductData },
          { new: true }
        );

        if (!updatedProduct) {
          return socket.emit("update-product:failed", {
            message: "Updated product not found",
          });
        }

        io.emit("update-product:success", {
          message: "Product updated successfully",
          updatedProduct,
        });

        socket.emit("update-product:updated", {
          message: `${updatedProduct?.name} updated successfully.`,
        });
      } catch (error) {
        socket.emit("update-product:failed", {
          message:
            error?.message || "Something went wrong while updating product",
        });
      }
    });

    socket.on("client:logout", ({ userId, adminId }) => {
      if (userId && userSocketMap.has(userId)) {
        const sockets = userSocketMap.get(userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId);
        }
      }

      if (adminId && adminSocketMap.has(adminId)) {
        const sockets = adminSocketMap.get(adminId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          adminSocketMap.delete(adminId);
        }
      }
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      const adminId = socket.data.adminId;

      if (userId && userSocketMap.has(userId)) {
        const sockets = userSocketMap.get(userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(userId);
        }
      }

      if (adminId && adminSocketMap.has(adminId)) {
        const sockets = adminSocketMap.get(adminId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          adminSocketMap.delete(adminId);
        }
      }
    });
  });

  return io;
};
