import Order from "../models/OrderSchema.js";
import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";
import Address from "../models/AddressShema.js";
import Product from "../models/ProductSchema.js";
import { sendOrderConfirmationEmail } from "../config/nodemailer.js";

// CREATE: Place new order via REST API
export const createOrder = async (req, res) => {
  const { userId, address, productsData, paymentMode, totalAmount } = req.body;

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

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    let user = await User.findById(userId);
    if (!user) {
      user = await Admin.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
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

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    orders,
  });
};

// READ: Get pending admin orders
export const getAdminOrders = async (req, res) => {
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
      .json({ success: false, message: "Admin not found." });
  }

  res.status(200).json({
    success: true,
    orders: admin.pendingOrders,
  });
};

// READ: Recent 20 orders
export const getRecentOrders = async (req, res) => {
  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .populate({
      path: "address",
      select: "name streetAddress city state pincode",
    })
    .select("address productsData totalAmount status createdAt paymentMode");
  res.status(200).json({
    success: true,
    orders: recentOrders,
  });
};

// UPDATE: Update order status (Pending, Confirmed, Shipped, Delivered, Cancelled)
export const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ success: false, message: "Order ID and status are required." });
  }

  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
};

// DELETE / CANCEL: Cancel an order and restore stock
export const cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required." });
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
      if (item.productId && item.productQuantity) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.productQuantity },
        });
      }
    }
  }

  order.status = "Cancelled";
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order cancelled successfully and stock restored.",
    order,
  });
};
