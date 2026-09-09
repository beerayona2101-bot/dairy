import mongoose from "mongoose";
import Order from "../models/OrderSchema.js";
import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";
import Address from "../models/AddressShema.js";
import Product from "../models/ProductSchema.js";
import { sendOrderConfirmationEmail } from "../config/nodemailer.js";
import { broadcastOrderStatusUpdate } from "../socket/socket.js";
import { emitAdminOrderNotifications } from "../socket/helper.js";

// CREATE: Place new order via REST API
export const createOrder = async (req, res) => {
  const { userId, address, productsData, paymentMode, totalAmount, deliveryInstructions, precautions } = req.body;

  if (!userId || !address || !productsData || !paymentMode || !totalAmount) {
    return res.status(400).json({ success: false, message: "Missing required order fields." });
  }

  let user = await User.findById(userId);
  if (!user) {
    user = await Admin.findById(userId);
  }

  if (!user) {
    return res.status(404).json({ success: false, message: "User account not found." });
  }

  const newOrder = new Order({
    user: userId,
    address,
    productsData,
    paymentMode,
    totalAmount,
    deliveryInstructions: deliveryInstructions || precautions || "",
    status: "Pending",
  });

  const savedOrder = await newOrder.save();

  user.orders = user.orders || [];
  if (!user.orders.some((id) => String(id) === String(savedOrder._id))) {
    user.orders.push(savedOrder._id);
    await user.save().catch(() => {});
  }

  const admin = await Admin.findOne();
  if (admin) {
    admin.pendingOrders = admin.pendingOrders || [];
    if (!admin.pendingOrders.some((id) => String(id) === String(savedOrder._id))) {
      admin.pendingOrders.push(savedOrder._id);
      await admin.save().catch(() => {});
    }
  }

  if (user?.email) {
    sendOrderConfirmationEmail({
      toEmail: user.email,
      orderId: savedOrder._id,
      totalAmount: savedOrder.totalAmount,
      paymentMode: savedOrder.paymentMode,
    }).catch((err) => console.warn("Email notice:", err.message));
  }

  // Real-time socket emissions to Admin & Customer dashboards
  const io = req.app.get("io");
  if (io) {
    try {
      const populatedOrder = await Order.findById(savedOrder._id)
        .populate({
          path: "address",
          populate: { path: "owner", model: "User" },
        })
        .populate({ path: "productsData.productId", model: "Product" });

      const finalOrder = populatedOrder || savedOrder;

      emitAdminOrderNotifications(null, finalOrder, user, new Date().toISOString(), io);
      io.emit("order:place-new-success", { newOrder: finalOrder });
      io.to(`user:${userId}`).emit("order:place-new-success", { newOrder: finalOrder });
      io.emit("order:global-status-update", { orderId: savedOrder._id, status: "Pending", userId });
    } catch (err) {
      console.warn("Socket notification error in createOrder:", err?.message);
    }
  }

  return res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order: savedOrder,
  });
};

// READ: Get all orders for a specific user
export const getAllUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ success: true, message: "No orders found.", orders: [] });
    }

    let user = await User.findById(userId);
    if (!user) {
      user = await Admin.findById(userId);
    }
    if (!user) {
      return res.status(200).json({ success: true, message: "User not found.", orders: [] });
    }

    const userOrderIds = user.orders || [];

    const orders = await Order.find({
      $or: [
        { user: userId },
        { _id: { $in: userOrderIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "productsData.productId",
        model: "Product",
        select: "name quantityUnit image price discount photos photo",
      });

    return res.status(200).json({
      success: true,
      message: "User orders retrieved",
      orders: orders || [],
    });
  } catch (error) {
    console.error("getAllUserOrders error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch user orders." });
  }
};

// READ: Get all orders (Admin view)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        model: "User",
        select: "firstName lastName username email phone mobileNo",
      })
      .populate({
        path: "address",
        model: "Address",
        populate: {
          path: "owner",
          model: "User",
          select: "firstName lastName username email phone mobileNo",
        },
      })
      .populate({
        path: "productsData.productId",
        model: "Product",
      });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: orders || [],
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch all orders.", orders: [] });
  }
};

// READ: Get pending admin orders
export const getAdminOrders = async (req, res) => {
  try {
    const admin = await Admin.findOne().populate({
      path: "pendingOrders",
      model: "Order",
      populate: [
        {
          path: "address",
          model: "Address",
          populate: {
            path: "owner",
            model: "User",
          },
        },
        {
          path: "productsData.productId",
          model: "Product",
        },
      ],
    });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found.", orders: [] });
    }

    return res.status(200).json({
      success: true,
      orders: admin.pendingOrders || [],
    });
  } catch (error) {
    console.error("getAdminOrders error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch admin orders.", orders: [] });
  }
};

// READ: Recent 20 orders
export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "user",
        model: "User",
        select: "firstName lastName username email mobileNo",
      })
      .select("user address productsData totalAmount status createdAt paymentMode");

    return res.status(200).json({
      success: true,
      orders: recentOrders || [],
    });
  } catch (error) {
    console.error("getRecentOrders error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch recent orders.", orders: [] });
  }
};

// UPDATE: Update order status (Pending, Confirmed, Shipped, Delivered, Cancelled)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Valid Order ID and status are required." });
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const io = req.app.get("io");
    if (io) {
      await broadcastOrderStatusUpdate(io, { orderId, status, userId: order.user });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update order status." });
  }
};

// DELETE / CANCEL: Cancel an order and restore stock
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Valid Order ID is required." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled." });
    }

    // Restore product stock
    if (Array.isArray(order.productsData)) {
      for (const item of order.productsData) {
        if (item.productId && item.productQuantity && mongoose.Types.ObjectId.isValid(item.productId)) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.productQuantity },
          });
        }
      }
    }

    order.status = "Cancelled";
    await order.save();

    const io = req.app.get("io");
    if (io) {
      await broadcastOrderStatusUpdate(io, { orderId, status: "Cancelled", userId: order.user });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully and stock restored.",
      order,
    });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to cancel order." });
  }
};
