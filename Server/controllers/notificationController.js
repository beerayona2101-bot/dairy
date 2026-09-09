import mongoose from "mongoose";
import User from "../models/UserSchema.js";
import Admin from "../models/AdminSchema.js";
import { addNotification } from "../socket/helper.js";

// GET /api/notifications/:userId - Get all notifications for a user or admin
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ success: true, notifications: [], unreadCount: 0 });
    }

    let account = await User.findById(userId);
    if (!account) {
      account = await Admin.findById(userId);
    }

    if (!account) {
      return res.status(200).json({ success: true, notifications: [], unreadCount: 0 });
    }

    const notifications = account.notifications || [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("getUserNotifications error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch notifications." });
  }
};

// POST /api/notifications/mark-read - Mark notification(s) as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { userId, notificationId, mode = "single" } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Valid User ID is required." });
    }

    let account = await User.findById(userId);
    if (!account) {
      account = await Admin.findById(userId);
    }

    if (!account) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (mode === "all") {
      account.notifications.forEach((n) => {
        n.isRead = true;
      });
    } else if (notificationId) {
      const targetNotif = account.notifications.id(notificationId);
      if (targetNotif) {
        targetNotif.isRead = true;
      }
    }

    await account.save();

    const unreadCount = account.notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      message: mode === "all" ? "All notifications marked as read." : "Notification marked as read.",
      notifications: account.notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to mark notification as read." });
  }
};

// DELETE /api/notifications/delete - Delete notification(s)
export const deleteNotification = async (req, res) => {
  try {
    const { userId, adminId, mode = "single", index, notificationId } = req.body;
    const targetId = userId || adminId;

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ success: false, message: "Valid User or Admin ID is required." });
    }

    let account = await User.findById(targetId);
    if (!account) {
      account = await Admin.findById(targetId);
    }

    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    if (mode === "all") {
      account.notifications = [];
    } else if (notificationId) {
      account.notifications = account.notifications.filter(
        (n) => String(n._id) !== String(notificationId)
      );
    } else if (typeof index === "number" && index >= 0 && index < account.notifications.length) {
      account.notifications.splice(index, 1);
    }

    await account.save();

    return res.status(200).json({
      success: true,
      message: mode === "all" ? "All notifications cleared successfully." : "Notification deleted successfully.",
      notifications: account.notifications,
      unreadCount: account.notifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    console.error("deleteNotification error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete notification." });
  }
};

// POST /api/notifications/send - Send a notification (Admin / System)
export const sendCustomNotification = async (req, res) => {
  try {
    const { userId, title, description, orderId, type = "system" } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }

    const notificationPayload = {
      title,
      description,
      date: new Date(),
      isRead: false,
      orderId: orderId || undefined,
      type,
    };

    const io = req.app.get("io");

    if (userId) {
      let targetUser = await User.findById(userId);
      if (!targetUser) {
        targetUser = await Admin.findById(userId);
      }

      if (!targetUser) {
        return res.status(404).json({ success: false, message: "Target user not found." });
      }

      await addNotification(targetUser, notificationPayload);

      if (io) {
        io.to(`user:${String(userId)}`).emit("user:notification", notificationPayload);
      }
    } else {
      // Broadcast to all users
      const users = await User.find({});
      for (const u of users) {
        await addNotification(u, notificationPayload);
      }
      if (io) {
        io.emit("user:notification", notificationPayload);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully.",
    });
  } catch (error) {
    console.error("sendCustomNotification error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send notification." });
  }
};
