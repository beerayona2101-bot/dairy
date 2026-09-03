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

export const connectToSocket = (server) => {
  const userSocketMap = new Map();
  const adminSocketMap = new Map();

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    },
    transports: ["websocket"],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on("connection", (socket) => {

    socket.on("user:register", ({ userId }) => {
      if (!userId) return;

      socket.data.userId = userId;

      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);
    });

    socket.on("admin:register", ({ adminId }) => {
      if (!adminId) return;

      socket.data.adminId = adminId;

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
            await savedOrder.save().catch(() => {});
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
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Confirmed",
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

        socket.emit("order:update-status-success", {
          message: "Order accepted successfully.",
          status,
        });

        for (const [_, socketSet] of adminSocketMap) {
          for (const socketId of socketSet) {
            io.to(socketId).emit("order:accept-success", {
              orderId,
              status,
            });
          }
        }

        if (userId && userSocketMap.has(userId)) {
          for (const socketId of userSocketMap.get(userId)) {
            io.to(socketId).emit("user-order:updated-status", {
              orderId,
              status,
            });

            io.to(socketId).emit("user:notification", {
              title: "Order Confirmed",
              description: notificationMessage,
              date,
            });
          }
        }
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
        if (!orderId || !status || !userId) {
          return socket.emit("order:update-status-failed", {
            message: "Missing required fields.",
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

        const user = await User.findById(userId);
        if (!user) {
          return socket.emit("order:update-status-failed", {
            message: "User not found.",
            status: "Cancelled",
          });
        }

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

        await addNotification(user, {
          title: "Order Cancelled",
          description: `Order #${order._id} with ${totalItems} item(s) worth ₹${order.totalAmount} has been cancelled.${refundNote}`,
          date: timestamp,
        });

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

        for (const [_, socketSet] of adminSocketMap) {
          for (const socketId of socketSet) {
            io.to(socketId).emit("order:reject-success", {
              orderId,
            });
          }
        }

        if (userId && userSocketMap.has(userId)) {
          for (const socketId of userSocketMap.get(userId)) {
            io.to(socketId).emit("user-order:updated-status", {
              orderId,
              status: "Cancelled",
            });

            io.to(socketId).emit("user:notification", {
              title: "Order Cancelled",
              description: `Order #${order._id} (${totalItems} items, ₹${order.totalAmount}) was cancelled.${refundNote}`,
              date: timestamp,
            });
          }
        }
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
        if (!orderId || !status || !userId) {
          return socket.emit("order:update-delivered-status", {
            message: "Missing required fields.",
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

        const user = await User.findById(userId);
        if (!user) {
          return socket.emit("order:update-delivered-status", {
            message: "User not found.",
            success: false,
          });
        }

        const admin = await Admin.findOne();
        if (!admin) {
          return socket.emit("order:update-delivered-status", {
            message: "Admin not found",
          });
        }

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

        await addNotification(user, {
          title: "Order Delivered",
          description: `Your order (ID: ${order._id}) with ${totalItems} item(s) has been successfully delivered. Total: ₹${order.totalAmount}.`,
          date,
        });

        await addNotification(admin, {
          title: "Order Delivered",
          description: `Order #${order._id} placed by ${user?.firstName} ${user?.lastName} has been delivered. Total: ₹${order.totalAmount}, Items: ${totalItems}`,
          date,
        });

        socket.emit("order:update-delivered-status", {
          message: "Order marked as delivered.",
          success: true,
        });

        for (const [_, socketSet] of adminSocketMap) {
          for (const socketId of socketSet) {
            io.to(socketId).emit("admin:notification", {
              title: "Order Delivered",
              description: `Order #${order._id} placed by ${user?.firstName} ${user?.lastName} has been delivered. Total: ₹${order.totalAmount}, Items: ${totalItems}`,
              date,
            });

            io.to(socketId).emit("admin-order:delivered-success", {
              orderId,
            });
          }
        }

        if (userId && userSocketMap.has(userId)) {
          for (const socketId of userSocketMap.get(userId)) {
            io.to(socketId).emit("user-order:updated-status", {
              orderId,
              status: "Delivered",
            });

            io.to(socketId).emit("user:notification", {
              title: "Order Delivered",
              description: `Order #${order._id} delivered successfully. Items: ${totalItems}, Amount: ₹${order.totalAmount}.`,
              date,
            });
          }
        }
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
          imageUrl = await uploadToCloudinary(image, "evan_homepage_cms");
        }

        let pngImageUrl = productDetails?.pngImage || "";
        if (pngImageUrl && typeof pngImageUrl === "string" && pngImageUrl.startsWith("data:image")) {
          pngImageUrl = await uploadToCloudinary(pngImageUrl, "evan_homepage_cms");
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
          const uploadedUrl = await uploadToCloudinary(imgVal, "evan_homepage_cms");
          updatedProductData.image = [uploadedUrl];
        } else if (Array.isArray(updatedProductData.image)) {
          updatedProductData.image = updatedProductData.image;
        } else if (typeof updatedProductData.image === "string" && updatedProductData.image.trim() !== "") {
          updatedProductData.image = [updatedProductData.image];
        } else {
          updatedProductData.image = product.image;
        }

        if (typeof updatedProductData.pngImage === "string" && updatedProductData.pngImage.startsWith("data:image")) {
          const uploadedPngUrl = await uploadToCloudinary(updatedProductData.pngImage, "evan_homepage_cms");
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
};
