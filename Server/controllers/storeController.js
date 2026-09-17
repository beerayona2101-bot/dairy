import mongoose from "mongoose";
import User from "../models/UserSchema.js";
import Order from "../models/OrderSchema.js";
import bcryptjs from "bcryptjs";
import { sendWelcomeCredentialsEmail } from "../config/nodemailer.js";
import { notifyNewUserRegistration } from "../socket/helper.js";

// READ: Get all customers with accurate aggregated order counts
export const getAllStores = async (req, res) => {
  try {
    const users = await User.find()
      .select("firstName lastName username email mobileNo gender photo createdAt address shopName orders")
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate order counts directly from Order collection grouped by user
    const orderAgg = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 },
        },
      },
    ]);

    const orderCountMap = {};
    orderAgg.forEach((item) => {
      if (item._id) {
        orderCountMap[item._id.toString()] = item.count;
      }
    });

    const storesWithCounts = users.map((u) => {
      const dbOrderCount = orderCountMap[u._id.toString()] || 0;
      const arrayOrderCount = Array.isArray(u.orders) ? u.orders.length : 0;
      const effectiveOrderCount = Math.max(dbOrderCount, arrayOrderCount);

      return {
        ...u,
        orderCount: effectiveOrderCount,
        orders: Array.isArray(u.orders) && u.orders.length >= effectiveOrderCount
          ? u.orders
          : Array(effectiveOrderCount).fill(null),
      };
    });

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully.",
      stores: storesWithCounts,
    });
  } catch (error) {
    console.error("getAllStores error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customer profiles.",
    });
  }
};

// CREATE: Admin Add Customer
export const createCustomer = async (req, res) => {
  const { firstName, lastName, email, mobileNo, gender, password } = req.body;

  if (!email || !firstName) {
    return res.status(400).json({ success: false, message: "First Name and Email are required." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, "i") });
  if (existing) {
    return res.status(400).json({ success: false, message: "A customer account with this email already exists." });
  }

  const effectivePassword = (password && password.trim())
    ? password.trim()
    : `MADHU@${Math.floor(1000 + Math.random() * 9000)}`;

  const hashedPassword = await bcryptjs.hash(effectivePassword, 10);
  const photo = gender === "Female"
    ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcQ6xalcUqiwlcrMkGuc7NJW6txojdE57QMw&s"
    : "https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740";

  const newUser = new User({
    firstName: firstName.trim(),
    lastName: (lastName || "").trim(),
    username: `${firstName.trim()}_${Math.floor(100 + Math.random() * 900)}`,
    email: cleanEmail,
    mobileNo: (mobileNo || "").trim(),
    gender: gender || "Male",
    password: hashedPassword,
    photo,
  });

  const savedUser = await newUser.save();
  console.log("✅ [ADMIN_CREATE_USER] Saved user ID: %s, Email: %s", savedUser._id, savedUser.email);

  // Trigger registration notifications for User & Admin
  try {
    await notifyNewUserRegistration(savedUser, req.app.get("io"), { createdByAdmin: true });
  } catch (notifErr) {
    console.warn("Admin create customer notification notice:", notifErr?.message);
  }

  // Send Welcome Email with login credentials after user is saved in DB
  let emailSent = false;
  try {
    const emailResult = await sendWelcomeCredentialsEmail({
      toEmail: cleanEmail,
      name: `${firstName} ${lastName || ''}`.trim(),
      email: cleanEmail,
      rawPassword: effectivePassword,
    });
    emailSent = emailResult?.success || false;
    console.log("📧 [EMAIL_DISPATCH_RESULT] Sent to %s: %s", cleanEmail, emailSent ? "SUCCESS" : "FAILED/FALLBACK");
  } catch (emailErr) {
    console.error("❌ [EMAIL_DISPATCH_ERROR] Failed to send welcome email:", emailErr.message);
  }

  const customerObject = savedUser.toObject ? savedUser.toObject() : { ...savedUser };
  delete customerObject.password;

  return res.status(201).json({
    success: true,
    message: "User created successfully and login credentials have been sent to the registered email.",
    emailSent,
    customer: customerObject,
  });
};

// UPDATE: Admin Update Customer
export const updateCustomer = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, mobileNo } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid customer ID." });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName, email, mobileNo },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "Customer not found." });
  }

  return res.status(200).json({
    success: true,
    message: "Customer updated successfully.",
    customer: updatedUser,
  });
};

// DELETE: Admin Delete Customer
export const deleteCustomer = async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid customer ID." });
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return res.status(404).json({ success: false, message: "Customer not found." });
  }

  return res.status(200).json({
    success: true,
    message: "Customer deleted successfully.",
  });
};

// READ: Customer Order History
export const getStoreOrderHistory = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing userId." });
    }

    const store = await User.findById(userId).lean();

    if (!store) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const userOrderIds = store.orders || [];
    const orders = await Order.find({
      $or: [
        { user: userId },
        { _id: { $in: userOrderIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "productsData.productId",
        model: "Product",
        select: "name image price quantityUnit",
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Order history fetched successfully.",
      orders: {
        ...store,
        orders: orders || [],
      },
    });
  } catch (error) {
    console.error("getStoreOrderHistory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch store order history.",
    });
  }
};
